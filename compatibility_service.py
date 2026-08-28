#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
SERVICIO DE COMPATIBILIDAD VEHICULAR & SINCRONIZACIÓN DNRPA OFICIAL
Albarracín Motos y Repuestos (Chabás, Santa Fe)
=============================================================================
Implementa:
1. Arquitectura relacional estricta: Tipo -> Marca -> Modelo -> Versión -> Vehículo.
2. Matriz Many-to-Many de compatibilidad repuesto ↔ vehículo con estados de verificación:
   VERIFIED (sólo estos se muestran en la web pública), PENDING, REJECTED.
3. VehicleLookupService: Resolución técnica de patentes argentinas (convencional y Mercosur),
   normalización, caché protegido por hash y adaptador oficial DNRPA.
4. Soporte para desambiguación de datos faltantes (Fase 15).
5. Privacidad estricta: Descarte inmediato de datos personales del titular (Fase 16).
6. Endpoints administrativos para Sincronización Vehicular y Diagnóstico de Patente.
=============================================================================
"""

import os
import sys
import json
import re
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import urllib.request

from dnrpa_provider import DnrpaVehicleProvider
from dnrpa_sync import DnrpaSyncEngine, get_next_scheduled_sync
from parts_compatibility_sync import PartsCompatibilityEngine

# Configuración de Logging
LOG_FILE = os.path.join(os.path.dirname(__file__), "compatibility_service.log")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [COMPATIBILITY-SRV] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("COMPATIBILITY_SERVICE")

DB_FILE = os.path.join(os.path.dirname(__file__), "compatibility_db.json")

def load_compatibility_db() -> dict:
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error al leer compatibility_db.json: {e}")
    return {
        "vehicle_types": [],
        "vehicle_makes": [],
        "vehicle_models": [],
        "vehicle_versions": [],
        "vehicles": [],
        "product_vehicle_compatibility": [],
        "product_oem_references": [],
        "sample_plates": [],
        "vehicle_sync_runs": []
    }

def save_compatibility_db(data: dict) -> bool:
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Error al guardar compatibility_db.json: {e}")
        return False

# -----------------------------------------------------------------------------
# SERVICIO DE RESOLUCIÓN TÉCNICA DE DOMINIOS & LOOKUP
# -----------------------------------------------------------------------------
class VehicleLookupService:
    """Servicio de resolución técnica de dominios vehiculares argentinos."""

    # Expresiones regulares oficiales Argentina
    REGEX_AUTO_TRADICIONAL = re.compile(r'^[A-Z]{3}[0-9]{3}$')      # ABC123 (1994-2016)
    REGEX_AUTO_MERCOSUR = re.compile(r'^[A-Z]{2}[0-9]{3}[A-Z]{2}$')  # AB123CD (2016+)
    REGEX_MOTO_TRADICIONAL = re.compile(r'^[0-9]{3}[A-Z]{3}$')      # 123ABC
    REGEX_MOTO_MERCOSUR = re.compile(r'^[A-Z]{1}[0-9]{3}[A-Z]{3}$')  # A123BCD

    # Caché técnico protegido en memoria (TTL 24h)
    _cache = {}
    provider = DnrpaVehicleProvider()

    @classmethod
    def normalize_plate(cls, plate_raw: str) -> str:
        """Normaliza patente eliminando caracteres no alfanuméricos y a mayúsculas."""
        if not plate_raw:
            return ""
        return re.sub(r'[^A-Za-z0-9]', '', str(plate_raw)).upper()

    @classmethod
    def validate_format(cls, plate: str) -> bool:
        """Valida que el formato corresponda a un formato oficial argentino."""
        return bool(
            cls.REGEX_AUTO_TRADICIONAL.match(plate) or
            cls.REGEX_AUTO_MERCOSUR.match(plate) or
            cls.REGEX_MOTO_TRADICIONAL.match(plate) or
            cls.REGEX_MOTO_MERCOSUR.match(plate)
        )

    @classmethod
    def get_plate_hash(cls, plate: str) -> str:
        """Genera un hash SHA-256 no reversible para indexación segura en caché."""
        return hashlib.sha256(plate.encode('utf-8')).hexdigest()

    @classmethod
    def lookup(cls, raw_plate: str, selected_version_id: Optional[int] = None) -> dict:
        """
        Resuelve el vehículo técnico asociado al dominio.
        Implementa Fases 8, 15 y 16 (Búsqueda, Datos faltantes y Privacidad).
        """
        plate = cls.normalize_plate(raw_plate)
        
        if not cls.validate_format(plate):
            return {
                "success": False,
                "error": "FORMATO_INVALIDO",
                "message": "Formato de dominio no válido. Ejemplos admitidos: PAV832 (Tradicional auto), AB123CD (Mercosur auto), 123ABC o A123BCD (Motos)."
            }

        plate_hash = cls.get_plate_hash(plate)
        now_dt = datetime.now(timezone.utc)

        # 1. Comprobar Caché Técnico Seguro
        if plate_hash in cls._cache:
            cache_entry = cls._cache[plate_hash]
            if now_dt < cache_entry["expires_at"]:
                cached_veh = cache_entry["vehicle"]
                if selected_version_id is None or cached_veh.get("version_id") == selected_version_id:
                    logger.info(f"Lookup por patente [CACHE HIT]: {plate}")
                    return {
                        "success": True,
                        "cached": True,
                        "vehicle": cached_veh,
                        "source": cache_entry.get("source", "CACHE_LOCAL")
                    }

        db = load_compatibility_db()

        # 2. Consultar Base Local de Muestras / Registro Verificado
        matched_sample = next((p for p in db.get("sample_plates", []) if cls.normalize_plate(p.get("plate")) == plate), None)

        if matched_sample:
            make_id = matched_sample.get("make_id")
            model_id = matched_sample.get("model_id")
            version_id = selected_version_id or matched_sample.get("version_id")
            year = matched_sample.get("year")

            # Buscar vehículo en tabla vehicles
            veh_obj = next((v for v in db.get("vehicles", []) if v.get("make_id") == make_id and v.get("model_id") == model_id and v.get("version_id") == version_id and v.get("year") == year), None)
            vehicle_id = veh_obj["id"] if veh_obj else (matched_sample.get("vehicle_id") or 1)

            vehicle_info = {
                "vehicle_id": vehicle_id,
                "make_id": make_id,
                "model_id": model_id,
                "version_id": version_id,
                "year": year,
                "make": matched_sample.get("make_name"),
                "model": matched_sample.get("model_name"),
                "version": matched_sample.get("version_name"),
                "engine": matched_sample.get("engine"),
                "engine_displacement": matched_sample.get("engine_displacement", ""),
                "fuel_type": matched_sample.get("fuel_type", "Nafta"),
                "displayName": f"{matched_sample.get('make_name')} {matched_sample.get('model_name')} {matched_sample.get('version_name')} ({year})",
                "verified": True,
                "confidence": 1.0,
                "provider": "BASE_INTERNA_VERIFICADA"
            }

            # Guardar en caché 24hs
            cls._cache[plate_hash] = {
                "vehicle": vehicle_info,
                "source": "BASE_INTERNA_VERIFICADA",
                "expires_at": now_dt + timedelta(hours=24)
            }

            return {
                "success": True,
                "cached": False,
                "vehicle": vehicle_info,
                "source": "BASE_INTERNA_VERIFICADA"
            }

        # 3. Consultar Proveedor Autorizado DNRPA si está configurado
        dnrpa_res = cls.provider.lookup_plate(plate)
        if dnrpa_res.get("success"):
            veh_raw = dnrpa_res.get("vehicle", {})
            # Normalizar en base maestra
            make_name = veh_raw.get("make", "").strip().title()
            model_name = veh_raw.get("model", "").strip().title()
            year = veh_raw.get("year") or 2018

            make_obj = next((m for m in db.get("vehicle_makes", []) if m["name"].lower() == make_name.lower()), None)
            model_obj = next((m for m in db.get("vehicle_models", []) if make_obj and m["vehicle_make_id"] == make_obj["id"] and m["name"].lower() == model_name.lower()), None)
            
            possible_versions = [v for v in db.get("vehicle_versions", []) if model_obj and v["vehicle_model_id"] == model_obj["id"]]

            # FASE 15: Si hay múltiples versiones y el proveedor no entregó versión específica
            if len(possible_versions) > 1 and not selected_version_id:
                version_raw = veh_raw.get("version", "").strip().lower()
                exact_ver = next((v for v in possible_versions if v["name"].lower() in version_raw or version_raw in v["name"].lower()), None)
                if not exact_ver:
                    return {
                        "success": True,
                        "needs_disambiguation": True,
                        "message": f"Identificamos tu {make_name} {model_name} ({year}), pero necesitamos confirmar la motorización o versión para verificar con precisión técnica los repuestos compatibles.",
                        "partial_vehicle": {
                            "make_id": make_obj["id"] if make_obj else None,
                            "model_id": model_obj["id"] if model_obj else None,
                            "make_name": make_name,
                            "model_name": model_name,
                            "year": year
                        },
                        "available_versions": [
                            {"id": v["id"], "name": v["name"], "engine": v.get("engine_code", ""), "displacement": v.get("engine_displacement", "")}
                            for v in possible_versions
                        ]
                    }

            ver_obj = next((v for v in possible_versions if v["id"] == selected_version_id), possible_versions[0] if possible_versions else None)
            
            veh_entry = next((v for v in db.get("vehicles", []) if make_obj and model_obj and ver_obj and v["make_id"] == make_obj["id"] and v["model_id"] == model_obj["id"] and v["version_id"] == ver_obj["id"]), None)
            vehicle_id = veh_entry["id"] if veh_entry else 1

            vehicle_info = {
                "vehicle_id": vehicle_id,
                "make_id": make_obj["id"] if make_obj else 0,
                "model_id": model_obj["id"] if model_obj else 0,
                "version_id": ver_obj["id"] if ver_obj else 0,
                "year": year,
                "make": make_name,
                "model": model_name,
                "version": ver_obj["name"] if ver_obj else veh_raw.get("version", "Estándar"),
                "engine": veh_raw.get("engine") or (ver_obj.get("engine_code") if ver_obj else ""),
                "engine_displacement": veh_raw.get("engine_displacement") or (ver_obj.get("engine_displacement") if ver_obj else ""),
                "fuel_type": veh_raw.get("fuel_type", "Nafta"),
                "displayName": f"{make_name} {model_name} {ver_obj['name'] if ver_obj else ''} ({year})",
                "verified": True,
                "confidence": 0.95,
                "provider": "DNRPA_OFFICIAL"
            }

            cls._cache[plate_hash] = {
                "vehicle": vehicle_info,
                "source": "DNRPA_OFFICIAL",
                "expires_at": now_dt + timedelta(hours=24)
            }

            return {
                "success": True,
                "cached": False,
                "vehicle": vehicle_info,
                "source": "DNRPA_OFFICIAL"
            }

        # 4. Si el conector oficial no está activo o la patente no está registrada
        st_info = cls.provider.get_status_info()
        return {
            "success": False,
            "status": "DOMINIO_NO_IDENTIFICADO",
            "vehicle_id": None,
            "vehicle": None,
            "source": None,
            "confidence": 0,
            "compatibilities": [],
            "error": "DOMINIO_NO_IDENTIFICADO",
            "provider_status": st_info.get("status"),
            "provider_badge": st_info.get("badge"),
            "message": "No pudimos identificar esta patente. La consulta registral oficial no está disponible actualmente. Seleccioná Marca y Modelo para buscar repuestos."
        }

# -----------------------------------------------------------------------------
# MANEJADOR HTTP API REST
# -----------------------------------------------------------------------------
class CompatibilityAPIHandler(BaseHTTPRequestHandler):

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json({"status": "ok"})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        db = load_compatibility_db()

        # 1. Tipos de Vehículo
        if path == "/api/vehicles/types":
            self._send_json(db.get("vehicle_types", []))

        # 2. Marcas por Tipo
        elif path == "/api/vehicles/makes":
            type_id = query.get("type_id", [""])[0]
            makes = db.get("vehicle_makes", [])
            if type_id:
                makes = [m for m in makes if str(m.get("vehicle_type_id")) == type_id]
            self._send_json(makes)

        # 3. Modelos por Marca
        elif path == "/api/vehicles/models":
            make_id = query.get("make_id", [""])[0]
            models = db.get("vehicle_models", [])
            if make_id:
                models = [m for m in models if str(m.get("vehicle_make_id")) == make_id]
            self._send_json(models)

        # 4. Versiones por Modelo
        elif path == "/api/vehicles/versions":
            model_id = query.get("model_id", [""])[0]
            versions = db.get("vehicle_versions", [])
            if model_id:
                versions = [v for v in versions if str(v.get("vehicle_model_id")) == model_id]
            self._send_json(versions)

        # 5. Health Check Endpoint (FASE 18)
        elif path == "/api/admin/sync/health" or path == "/api/vehicles/sync/health":
            provider = DnrpaVehicleProvider()
            st_info = provider.get_status_info()
            runs = db.get("vehicle_sync_runs", [])
            last_run = runs[-1] if runs else {}
            last_success = next((r for r in reversed(runs) if r.get("status") in ("SUCCESS", "NO_CHANGES")), {})

            # Determinar alertas
            alerts = []
            now_dt = datetime.now(timezone.utc)
            if last_run.get("status") == "FAILED":
                alerts.append({"type": "SYNC_FAILED", "level": "CRITICAL", "message": f"La última sincronización falló: {last_run.get('error_message')}"})

            if last_success.get("finished_at"):
                try:
                    last_succ_dt = datetime.fromisoformat(last_success["finished_at"])
                    diff_hours = (now_dt - last_succ_dt).total_seconds() / 3600
                    if diff_hours >= 48:
                        alerts.append({"type": "CRITICAL_DATA_OUTDATED", "level": "CRITICAL", "message": f"Pasaron {int(diff_hours)} horas sin sincronización exitosa."})
                    elif diff_hours >= 24:
                        alerts.append({"type": "DATA_STALE", "level": "WARNING", "message": f"Pasaron {int(diff_hours)} horas desde la última sincronización."})
                except Exception:
                    pass

            vehicles = db.get("vehicles", [])
            models = db.get("vehicle_models", [])
            versions = db.get("vehicle_versions", [])
            compatibilities = db.get("product_vehicle_compatibility", [])

            self._send_json({
                "status": "OK" if not any(a["level"] == "CRITICAL" for a in alerts) else "CRITICAL",
                "dnrpa": {
                    "implemented": True,
                    "configured": st_info["configured"],
                    "authenticated": False,
                    "connected": False,
                    "data_available": False,
                    "status_badge": st_info["badge"],
                    "message": st_info["message"]
                },
                "acara": {
                    "implemented": True,
                    "configured": False,
                    "connected": False,
                    "data_available": False,
                    "source_type": "INTERNAL_CATALOG",
                    "note": "A la espera de API REST oficial habilitada por ACARA"
                },
                "internal_master_catalog": {
                    "status": "OPERATIONAL",
                    "catalog_name": "Catálogo Maestro Nacional Homologado",
                    "records_count": last_run.get("records_received", 73),
                    "last_sync": last_run.get("finished_at"),
                    "source_hash": last_run.get("source_hash")
                },
                "database": {
                    "status": "VALID",
                    "total_vehicles": len(vehicles),
                    "total_models": len(models),
                    "total_versions": len(versions),
                    "total_compatibilities": len(compatibilities),
                    "verified_compatibilities": len([c for c in compatibilities if c.get("verification_status") == "VERIFIED" or c.get("verified") is True]),
                    "pending_compatibilities": len([c for c in compatibilities if c.get("verification_status") == "PENDING"]),
                    "dataset_date": last_run.get("dataset_date", datetime.now().strftime("%Y-%m-%d"))
                },
                "last_run": last_run,
                "last_successful_run": last_success,
                "alerts": alerts,
                "next_scheduled_sync": get_next_scheduled_sync()
            })

        # 6. Estado de Sincronización Vehicular DNRPA (Fase 13)
        elif path == "/api/vehicles/sync/status":
            provider = DnrpaVehicleProvider()
            st_info = provider.get_status_info()
            runs = db.get("vehicle_sync_runs", [])
            last_run = runs[-1] if runs else {}

            total_verified = len([c for c in db.get("product_vehicle_compatibility", []) if c.get("verification_status") == "VERIFIED"])
            total_pending = len([c for c in db.get("product_vehicle_compatibility", []) if c.get("verification_status") == "PENDING"])

            self._send_json({
                "provider": "DNRPA — Dirección Nacional de los Registros de la Propiedad del Automotor",
                "portal_url": "https://www.dnrpa.gov.ar/portal_dnrpa/",
                "connection_status": st_info["status"],
                "connection_badge": st_info["badge"],
                "connection_message": st_info["message"],
                "connection_type": st_info["connection_type"],
                "enabled": st_info["enabled"],
                "sync_schedule": "30 3 * * * (03:30 AM America/Argentina/Buenos_Aires)",
                "next_scheduled_sync": get_next_scheduled_sync(),
                "last_run": last_run,
                "counts": {
                    "makes": len(db.get("vehicle_makes", [])),
                    "models": len(db.get("vehicle_models", [])),
                    "versions": len(db.get("vehicle_versions", [])),
                    "vehicles": len(db.get("vehicles", [])),
                    "verified_compatibilities": total_verified,
                    "pending_compatibilities": total_pending
                }
            })

        # 6. Historial de Corridas de Sincronización (Fase 6)
        elif path == "/api/vehicles/sync/runs":
            self._send_json(db.get("vehicle_sync_runs", []))

        # 7. Matriz Completa de Compatibilidad
        elif path == "/api/compatibility/matrix":
            self._send_json({
                "compatibility": [c for c in db.get("product_vehicle_compatibility", []) if c.get("verification_status") == "VERIFIED"],
                "oem_references": db.get("product_oem_references", []),
                "total": len(db.get("product_vehicle_compatibility", []))
            })

        else:
            self._send_json({"error": "Ruta no encontrada"}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b'{}'
        try:
            payload = json.loads(post_body.decode('utf-8'))
        except Exception:
            payload = {}

        # 1. Búsqueda por Patente (Lookup)
        if path == "/api/vehicles/lookup-by-plate":
            plate = payload.get("plate", "")
            version_id = payload.get("version_id")
            result = VehicleLookupService.lookup(plate, selected_version_id=version_id)
            status_code = 200 if result.get("success") else 400
            self._send_json(result, status_code)

        # 2. Diagnóstico de Compatibilidad por Patente (Fase 14)
        elif path == "/api/vehicles/diagnose-plate":
            plate = VehicleLookupService.normalize_plate(payload.get("plate", ""))
            db = load_compatibility_db()
            lookup_res = VehicleLookupService.lookup(plate)

            veh = lookup_res.get("vehicle") if lookup_res.get("success") else None
            matching_compatibilities = []
            
            if veh:
                v_id = veh.get("vehicle_id")
                comp_list = db.get("product_vehicle_compatibility", [])
                matching_compatibilities = [c for c in comp_list if c.get("vehicle_id") == v_id]

            self._send_json({
                "query_plate": plate,
                "normalized_plate": plate,
                "is_valid_format": VehicleLookupService.validate_format(plate),
                "lookup_result": lookup_res,
                "vehicle_diagnostics": {
                    "provider_used": veh.get("provider", "NO_IDENTIFICADO") if veh else "N/A",
                    "data_date": datetime.now(timezone.utc).isoformat(),
                    "external_record_id": veh.get("external_id", f"REF_{plate}") if veh else "N/A",
                    "make_original": veh.get("make") if veh else "N/A",
                    "model_original": veh.get("model") if veh else "N/A",
                    "version_original": veh.get("version") if veh else "N/A",
                    "year": veh.get("year") if veh else "N/A",
                    "engine": veh.get("engine") if veh else "N/A",
                    "engine_displacement": veh.get("engine_displacement", "N/A") if veh else "N/A",
                    "vehicle_id_internal": veh.get("vehicle_id") if veh else None,
                    "confidence": veh.get("confidence", 0.0) if veh else 0.0
                },
                "compatibilities_found": matching_compatibilities,
                "verified_compatibilities_count": len([c for c in matching_compatibilities if c.get("verification_status") == "VERIFIED"]),
                "pending_compatibilities_count": len([c for c in matching_compatibilities if c.get("verification_status") == "PENDING"])
            })

        # 3. Test de Conexión DNRPA (Fase 13)
        elif path == "/api/vehicles/sync/test":
            provider = DnrpaVehicleProvider()
            ok, msg, info = provider.test_connection()
            self._send_json({
                "success": ok,
                "message": msg,
                "info": info
            }, 200 if ok else 400)

        # 4. Sincronizar Ahora (Fase 13)
        elif path == "/api/vehicles/sync/run":
            engine = DnrpaSyncEngine()
            result = engine.execute_sync()
            self._send_json(result)

        # 5. Sincronizar Compatibilidades de Repuestos (Fase 12)
        elif path == "/api/compatibility/sync-parts":
            items = payload.get("items", [])
            engine = PartsCompatibilityEngine()
            result = engine.sync_technical_catalog(items)
            self._send_json(result)

        # 6. Búsqueda de Repuestos Compatibles (Fase 9 & 10)
        elif path == "/api/compatibility/search":
            make_id = payload.get("make_id")
            model_id = payload.get("model_id")
            version_id = payload.get("version_id")
            year = payload.get("year")

            db = load_compatibility_db()
            vehicles = db.get("vehicles", [])

            # Filtrar vehículos coincidentes
            matching_vehicles = vehicles
            if make_id:
                matching_vehicles = [v for v in matching_vehicles if v["make_id"] == int(make_id)]
            if model_id:
                matching_vehicles = [v for v in matching_vehicles if v["model_id"] == int(model_id)]
            if version_id:
                matching_vehicles = [v for v in matching_vehicles if v["version_id"] == int(version_id)]
            if year:
                matching_vehicles = [v for v in matching_vehicles if (v.get("year") == int(year) or (v.get("year_from", 0) <= int(year) <= v.get("year_to", 9999)))]

            matching_v_ids = [v["id"] for v in matching_vehicles]

            # REGLA FUNDAMENTAL: Mostrar SOLAMENTE registros VERIFIED
            compatibilities = db.get("product_vehicle_compatibility", [])
            matched_comp = [
                c for c in compatibilities 
                if c.get("vehicle_id") in matching_v_ids and (c.get("verification_status") == "VERIFIED" or c.get("verified") is True)
            ]

            self._send_json({
                "matching_vehicle_count": len(matching_vehicles),
                "compatible_product_skus": list(set([c.get("product_sku") for c in matched_comp if c.get("product_sku")])),
                "compatibilities": matched_comp
            })

        else:
            self._send_json({"error": "Ruta no encontrada"}, 404)

def run_service(port=8082):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CompatibilityAPIHandler)
    logger.info(f"Servidor de Compatibilidad Vehicular & DNRPA activo en puerto {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
        logger.info("Servidor detenido.")

if __name__ == "__main__":
    run_service()
