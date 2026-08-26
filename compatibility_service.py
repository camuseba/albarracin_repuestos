#!/usr/bin/env python3
"""
=============================================================================
SERVICIO DE COMPATIBILIDAD VEHICULAR REAL & LOOKUP POR PATENTE
Albarracín Motos y Repuestos (Chabás, Santa Fe)
=============================================================================
Implementa:
1. Arquitectura relacional estricta: Tipo -> Marca -> Modelo -> Versión -> Vehículo.
2. Matriz Many-to-Many de compatibilidad repuesto ↔ vehículo con niveles y auditoría.
3. VehicleLookupService: Resolución de patentes argentinas (convencional y Mercosur),
   normalización, caché protegido por hash y adaptador a APIs autorizadas (DNRPA / comercial).
4. Privacidad estricta: No consulta ni persiste información personal del titular.
=============================================================================
"""

import os
import sys
import json
import re
import hashlib
import logging
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import urllib.request

# Configuración de Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [COMPATIBILITY-SRV] %(message)s',
    handlers=[
        logging.FileHandler("compatibility_service.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Variables de entorno
VEHICLE_LOOKUP_PROVIDER = os.getenv("VEHICLE_LOOKUP_PROVIDER", "INTERNAL_CACHE") # 'DNRPA_PROVIDER', 'COMMERCIAL_API', 'INTERNAL_CACHE'
VEHICLE_LOOKUP_API_KEY = os.getenv("VEHICLE_LOOKUP_API_KEY", "")
VEHICLE_LOOKUP_API_URL = os.getenv("VEHICLE_LOOKUP_API_URL", "https://api.vehicular.com.ar/v1/lookup")

DB_FILE = os.path.join(os.path.dirname(__file__), "compatibility_db.json")

def load_compatibility_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Error al leer compatibility_db.json: {e}")
    return {
        "vehicle_types": [],
        "vehicle_makes": [],
        "vehicle_models": [],
        "vehicle_versions": [],
        "vehicles": [],
        "product_vehicle_compatibility": [],
        "product_oem_references": [],
        "sample_plates": []
    }

def save_compatibility_db(data):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logging.error(f"Error al guardar compatibility_db.json: {e}")
        return False

# -----------------------------------------------------------------------------
# VEHICLE LOOKUP SERVICE & VALIDACIÓN DE PATENTES
# -----------------------------------------------------------------------------
class VehicleLookupService:
    """Servicio de resolución técnica de dominios vehiculares argentinos."""

    # Expresiones regulares oficiales Argentina
    REGEX_AUTO_TRADICIONAL = re.compile(r'^[A-Z]{3}[0-9]{3}$')     # ABC123 (1994-2016)
    REGEX_AUTO_MERCOSUR = re.compile(r'^[A-Z]{2}[0-9]{3}[A-Z]{2}$') # AB123CD (2016+)
    REGEX_MOTO_TRADICIONAL = re.compile(r'^[0-9]{3}[A-Z]{3}$')     # 123ABC
    REGEX_MOTO_MERCOSUR = re.compile(r'^[A-Z]{1}[0-9]{3}[A-Z]{3}$') # A123BCD

    # Caché técnico seguro en memoria
    _cache = {}

    @classmethod
    def normalize_plate(cls, plate_raw: str) -> str:
        """Normaliza patente eliminando espacios, guiones y convirtiendo a mayúsculas."""
        if not plate_raw:
            return ""
        return re.sub(r'[^A-Za-z0-9]', '', plate_raw).upper()

    @classmethod
    def validate_format(cls, plate: str) -> bool:
        """Valida que el formato corresponda a un formato oficial vigente en Argentina."""
        return bool(
            cls.REGEX_AUTO_TRADICIONAL.match(plate) or
            cls.REGEX_AUTO_MERCOSUR.match(plate) or
            cls.REGEX_MOTO_TRADICIONAL.match(plate) or
            cls.REGEX_MOTO_MERCOSUR.match(plate)
        )

    @classmethod
    def get_plate_hash(cls, plate: str) -> str:
        """Genera un hash técnico no reversible para indexación segura."""
        return hashlib.sha256(plate.encode('utf-8')).hexdigest()

    @classmethod
    def lookup(cls, raw_plate: str) -> dict:
        """Resuelve el vehículo técnico asociado al dominio."""
        plate = cls.normalize_plate(raw_plate)
        
        if not cls.validate_format(plate):
            return {
                "success": False,
                "error": "FORMATO_INVALIDO",
                "message": "El formato de patente no es válido. Ejemplos aceptados: ABC123, AB123CD, A123BCD."
            }

        plate_hash = cls.get_plate_hash(plate)

        # 1. Comprobar Caché Técnico
        if plate_hash in cls._cache:
            cache_entry = cls._cache[plate_hash]
            if datetime.utcnow() < cache_entry["expires_at"]:
                logging.info(f"Lookup por patente [CACHE HIT]: {plate}")
                return {
                    "success": True,
                    "cached": True,
                    "vehicle": cache_entry["vehicle"]
                }

        # 2. Consultar Provider Configurado
        db = load_compatibility_db()
        matched_sample = next((p for p in db.get("sample_plates", []) if p["plate"] == plate), None)

        if matched_sample:
            vehicle_info = {
                "make_id": matched_sample["make_id"],
                "model_id": matched_sample["model_id"],
                "version_id": matched_sample["version_id"],
                "year": matched_sample["year"],
                "make": matched_sample["make_name"],
                "model": matched_sample["model_name"],
                "version": matched_sample["version_name"],
                "engine": matched_sample["engine"],
                "fuel_type": matched_sample.get("fuel_type", "Nafta"),
                "verified": True,
                "provider": "VERIFIED_INTERNAL_REGISTRY"
            }

            # Guardar en caché técnico 24 horas (sin datos personales)
            cls._cache[plate_hash] = {
                "vehicle": vehicle_info,
                "expires_at": datetime.utcnow() + timedelta(hours=24)
            }

            return {
                "success": True,
                "cached": False,
                "vehicle": vehicle_info
            }

        # 3. Si hay una API Externa configurada
        if VEHICLE_LOOKUP_PROVIDER == "COMMERCIAL_API" and VEHICLE_LOOKUP_API_KEY:
            try:
                req = urllib.request.Request(
                    VEHICLE_LOOKUP_API_URL,
                    data=json.dumps({"plate": plate}).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {VEHICLE_LOOKUP_API_KEY}",
                        "Content-Type": "application/json"
                    }
                )
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode("utf-8"))
                        # Descartar cualquier dato personal inmediatamente
                        clean_vehicle = {
                            "make": data.get("make"),
                            "model": data.get("model"),
                            "year": data.get("year"),
                            "version": data.get("version"),
                            "engine": data.get("engine"),
                            "provider": "COMMERCIAL_API"
                        }
                        return {"success": True, "vehicle": clean_vehicle}
            except Exception as e:
                logging.error(f"Error al conectar con API vehicular externa: {e}")

        return {
            "success": False,
            "error": "VEHICULO_NO_ENCONTRADO",
            "message": "No se encontró registro para la patente ingresada. Podés seleccionarlo manualmente en la pestaña Por Vehículo."
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

        # 5. Matriz Completa de Compatibilidad
        elif path == "/api/compatibility/matrix":
            self._send_json({
                "compatibility": db.get("product_vehicle_compatibility", []),
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
            result = VehicleLookupService.lookup(plate)
            status_code = 200 if result.get("success") else 400
            self._send_json(result, status_code)

        # 2. Búsqueda de Repuestos Compatibles
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
                matching_vehicles = [v for v in matching_vehicles if v["year_from"] <= int(year) <= v["year_to"]]

            matching_v_ids = [v["id"] for v in matching_vehicles]

            # Buscar productos en la matriz Many-to-Many
            compatibilities = db.get("product_vehicle_compatibility", [])
            matched_comp = [c for c in compatibilities if c["vehicle_id"] in matching_v_ids and c.get("verified", True)]

            self._send_json({
                "matching_vehicle_count": len(matching_vehicles),
                "compatible_product_skus": list(set([c["product_sku"] for c in matched_comp])),
                "compatibilities": matched_comp
            })

        # 3. Guardar / Agregar Vínculo de Compatibilidad
        elif path == "/api/compatibility/matrix/save":
            db = load_compatibility_db()
            new_item = {
                "id": len(db.get("product_vehicle_compatibility", [])) + 1,
                "product_sku": payload.get("product_sku"),
                "product_id": payload.get("product_id"),
                "vehicle_id": payload.get("vehicle_id"),
                "compatibility_type": payload.get("compatibility_type", "EXACTA"),
                "position": payload.get("position", "General"),
                "notes": payload.get("notes", ""),
                "source": payload.get("source", "CARGA_ADMINISTRATIVA"),
                "source_reference": payload.get("source_reference", "Verificado por Administrador"),
                "confidence": float(payload.get("confidence", 1.0)),
                "verified": bool(payload.get("verified", True))
            }
            db["product_vehicle_compatibility"].append(new_item)
            save_compatibility_db(db)
            self._send_json({"success": True, "created": new_item})

        else:
            self._send_json({"error": "Ruta no encontrada"}, 404)

def run_service(port=8082):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CompatibilityAPIHandler)
    logging.info(f"Servidor de Compatibilidad Relacional activo en puerto {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
        logging.info("Servidor detenido.")

if __name__ == "__main__":
    run_service()
