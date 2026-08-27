#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
DNRPA VEHICLE PROVIDER & OFFICIAL CONNECTOR (ARGENTINA)
Albarracín Motos y Repuestos - Chabás, Santa Fe
=============================================================================
Capa de integración oficial y autorizada con la Dirección Nacional de los
Registros Nacionales de la Propiedad del Automotor (DNRPA).

REGLAS DE ARQUITECTURA:
1. NO realiza scraping de la web pública ni automatiza formularios web.
2. Utiliza exclusivamente mecanismos oficiales autorizados (Web Services,
   APIs REST, feeds de base de datos o convenios con certificados).
3. Privacidad estricta: Descarta de inmediato titular, DNI, CUIT, domicilio
   u otros datos personales. Retiene únicamente metadata técnica vehicular.
4. Si las credenciales o convenio no están cargados, informa con precisión
   el estado 'PENDIENTE_CREDENCIALES' sin simular respuestas ficticias.
=============================================================================
"""

import os
import re
import json
import logging
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple

# Logger específico del proveedor
logger = logging.getLogger("DNRPA_PROVIDER")

def _load_env_file():
    """Carga automáticamente variables de entorno desde .env si existe."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, ".env"),
        os.path.join(os.getcwd(), ".env")
    ]
    for env_path in candidates:
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
                break
            except Exception as err:
                logger.warning(f"Error leyendo archivo de entorno {env_path}: {err}")

# Carga inicial al importar el módulo
_load_env_file()

class DnrpaVehicleProvider:
    """
    Proveedor desacoplado para consulta e identificación vehicular autorizada ante DNRPA.
    """

    # Estado de la conexión
    STATUS_CONFIGURED = "CONFIGURADA"
    STATUS_PENDING_CREDENTIALS = "PENDIENTE_CREDENCIALES"
    STATUS_REQUIRES_AUTH = "REQUIERE_AUTORIZACION"
    STATUS_ERROR = "ERROR"

    def __init__(self):
        # Carga de variables de entorno oficiales
        self.enabled = os.getenv("DNRPA_ENABLED", "false").lower() in ("true", "1", "yes")
        self.connection_type = os.getenv("DNRPA_CONNECTION_TYPE", "REST_API").upper() # 'REST_API', 'SOAP_WS', 'SECURE_FEED', 'DATABASE_MIRROR'
        self.api_url = os.getenv("DNRPA_API_URL", "").strip()
        self.client_id = os.getenv("DNRPA_CLIENT_ID", "").strip()
        self.client_secret = os.getenv("DNRPA_CLIENT_SECRET", "").strip()
        self.username = os.getenv("DNRPA_USERNAME", "").strip()
        self.password = os.getenv("DNRPA_PASSWORD", "").strip()
        self.certificate_path = os.getenv("DNRPA_CERTIFICATE_PATH", "").strip()
        self.sync_enabled = os.getenv("DNRPA_SYNC_ENABLED", "true").lower() in ("true", "1", "yes")
        self.timeout_seconds = int(os.getenv("DNRPA_TIMEOUT_SECONDS", "10"))

    def get_status_info(self) -> Dict[str, Any]:
        """
        Retorna el estado de configuración y disponibilidad del conector oficial.
        """
        if not self.enabled:
            return {
                "status": self.STATUS_PENDING_CREDENTIALS,
                "badge": "~ PENDIENTE DE CREDENCIALES / CONVENIO",
                "message": "Conector DNRPA listo pero inactivo (DNRPA_ENABLED=false). A la espera de credenciales o habilitación de convenio.",
                "enabled": False,
                "connection_type": self.connection_type,
                "configured": False,
                "has_api_url": bool(self.api_url),
                "has_credentials": bool(self.client_id or self.username or self.certificate_path)
            }

        if not self.api_url:
            return {
                "status": self.STATUS_PENDING_CREDENTIALS,
                "badge": "~ PENDIENTE DE CREDENCIALES",
                "message": "Falta configurar URL del Web Service / API autorizada (DNRPA_API_URL).",
                "enabled": True,
                "connection_type": self.connection_type,
                "configured": False,
                "has_api_url": False,
                "has_credentials": bool(self.client_id or self.username)
            }

        # Si requiere certificado o token y falta
        if self.connection_type in ("REST_API", "SOAP_WS") and not (self.client_id or self.username or self.certificate_path):
            return {
                "status": self.STATUS_REQUIRES_AUTH,
                "badge": "! REQUIERE AUTORIZACIÓN",
                "message": "Faltan credenciales de autenticación autorizada para el servicio DNRPA.",
                "enabled": True,
                "connection_type": self.connection_type,
                "configured": False,
                "has_api_url": True,
                "has_credentials": False
            }

        return {
            "status": self.STATUS_CONFIGURED,
            "badge": "✓ CONFIGURADA",
            "message": f"Conector oficial DNRPA activo vía {self.connection_type}.",
            "enabled": True,
            "connection_type": self.connection_type,
            "configured": True,
            "has_api_url": True,
            "has_credentials": True
        }

    def test_connection(self) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Verifica la conectividad y handshake con el proveedor autorizado.
        """
        status_info = self.get_status_info()
        if not status_info["configured"]:
            return False, status_info["message"], status_info

        try:
            # Si hay un certificado provisto, validar su existencia en disco
            if self.certificate_path and not os.path.exists(self.certificate_path):
                msg = f"El certificado configurado no existe en la ruta: {self.certificate_path}"
                logger.error(msg)
                return False, msg, {"status": self.STATUS_ERROR, "detail": msg}

            import urllib.request
            import ssl

            ctx = ssl.create_default_context()
            if self.certificate_path and os.path.exists(self.certificate_path):
                ctx.load_cert_chain(self.certificate_path)

            req = urllib.request.Request(
                f"{self.api_url}/health",
                headers={
                    "User-Agent": "AlbarracinMotos-DnrpaClient/2.0",
                    "Accept": "application/json"
                }
            )
            if self.client_id and self.client_secret:
                req.add_header("X-Client-Id", self.client_id)
                req.add_header("Authorization", f"Bearer {self.client_secret}")

            with urllib.request.urlopen(req, timeout=self.timeout_seconds, context=ctx) as response:
                if response.status == 200:
                    return True, "Conexión autorizada con DNRPA establecida correctamente.", status_info
                else:
                    return False, f"El servidor respondió con código {response.status}", {"status": self.STATUS_ERROR}
        except Exception as e:
            logger.warning(f"Test de conexión DNRPA falló: {e}")
            return False, f"No fue posible contactar el servicio DNRPA: {str(e)}", {"status": self.STATUS_ERROR, "error": str(e)}

    @classmethod
    def sanitize_technical_payload(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        FASE 16 - PRIVACIDAD:
        Filtra y elimina de manera irreversible cualquier dato de carácter personal.
        Conserva estrictamente los datos técnicos requeridos para compatibilidad vehicular.
        """
        if not isinstance(raw_data, dict):
            return {}

        # Extraer exclusivamente atributos técnicos del vehículo
        make = raw_data.get("marca") or raw_data.get("make") or ""
        model = raw_data.get("modelo") or raw_data.get("model") or ""
        version = raw_data.get("version") or raw_data.get("desc_modelo") or ""
        year = raw_data.get("anio") or raw_data.get("year") or raw_data.get("modelo_anio")
        engine = raw_data.get("motor") or raw_data.get("engine") or raw_data.get("tipo_motor") or ""
        engine_code = raw_data.get("codigo_motor") or raw_data.get("engine_code") or ""
        displacement = raw_data.get("cilindrada") or raw_data.get("displacement") or ""
        fuel = raw_data.get("combustible") or raw_data.get("fuel_type") or "Nafta"
        vehicle_type = raw_data.get("tipo_vehiculo") or raw_data.get("vehicle_type") or ""
        external_id = raw_data.get("id_dnrpa") or raw_data.get("codigo_registro") or ""

        # Normalizar año numérico
        year_num = None
        if year:
            try:
                match = re.search(r'\b(19\d\d|20\d\d)\b', str(year))
                if match:
                    year_num = int(match.group(1))
            except Exception:
                year_num = None

        return {
            "make": make.strip().title() if isinstance(make, str) else "",
            "model": model.strip().title() if isinstance(model, str) else "",
            "version": version.strip() if isinstance(version, str) else "",
            "year": year_num,
            "engine": engine.strip() if isinstance(engine, str) else "",
            "engine_code": engine_code.strip().upper() if isinstance(engine_code, str) else "",
            "engine_displacement": displacement.strip() if isinstance(displacement, str) else "",
            "fuel_type": fuel.strip().title() if isinstance(fuel, str) else "Nafta",
            "vehicle_type": vehicle_type.strip().lower() if isinstance(vehicle_type, str) else "",
            "external_id": str(external_id).strip(),
            "provider": "DNRPA_OFFICIAL",
            "fetched_at": datetime.now(timezone.utc).isoformat()
        }

    def lookup_plate(self, normalized_plate: str) -> Dict[str, Any]:
        """
        Consulta vehicular en tiempo real ante el servicio autorizado de DNRPA.
        """
        status = self.get_status_info()
        if not status["configured"]:
            return {
                "success": False,
                "error": "DNRPA_NOT_CONFIGURED",
                "status_badge": status["badge"],
                "message": "El conector oficial DNRPA se encuentra pendiente de credenciales o convenio autorizado."
            }

        try:
            import urllib.request
            import urllib.parse
            import ssl

            ctx = ssl.create_default_context()
            if self.certificate_path and os.path.exists(self.certificate_path):
                ctx.load_cert_chain(self.certificate_path)

            req = urllib.request.Request(
                f"{self.api_url}/v1/vehiculos/{urllib.parse.quote(normalized_plate)}",
                headers={
                    "User-Agent": "AlbarracinMotos-DnrpaClient/2.0",
                    "Accept": "application/json",
                    "X-Client-Id": self.client_id,
                    "Authorization": f"Bearer {self.client_secret}"
                }
            )

            with urllib.request.urlopen(req, timeout=self.timeout_seconds, context=ctx) as resp:
                if resp.status == 200:
                    raw = json.loads(resp.read().decode("utf-8"))
                    clean_vehicle = self.sanitize_technical_payload(raw)
                    return {
                        "success": True,
                        "vehicle": clean_vehicle,
                        "source": "DNRPA_OFFICIAL"
                    }
                elif resp.status == 404:
                    return {
                        "success": False,
                        "error": "VEHICULO_NO_ENCONTRADO",
                        "message": f"El dominio {normalized_plate} no fue hallado en el registro oficial DNRPA."
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP_{resp.status}",
                        "message": f"El servicio DNRPA retornó estado {resp.status}."
                    }
        except Exception as e:
            logger.error(f"Error consultando patente {normalized_plate} en DNRPA: {e}")
            return {
                "success": False,
                "error": "CONNECTION_ERROR",
                "message": f"Error de comunicación con el servicio autorizado DNRPA: {str(e)}"
            }

    def fetch_daily_incremental_feed(self, since_timestamp: Optional[str] = None) -> Tuple[bool, List[Dict[str, Any]], str]:
        """
        Obtiene el lote diario de novedades registrales y homologaciones vehiculares.
        """
        status = self.get_status_info()
        if not status["configured"]:
            return False, [], "El conector oficial DNRPA se encuentra pendiente de credenciales."

        try:
            import urllib.request
            import urllib.parse

            url = f"{self.api_url}/v1/sync/feed"
            if since_timestamp:
                url += f"?since={urllib.parse.quote(since_timestamp)}"

            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "AlbarracinMotos-DnrpaSync/2.0",
                    "Accept": "application/json",
                    "X-Client-Id": self.client_id,
                    "Authorization": f"Bearer {self.client_secret}"
                }
            )

            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    items = data.get("items", [])
                    sanitized_items = [self.sanitize_technical_payload(it) for it in items]
                    next_cursor = data.get("next_cursor", datetime.utcnow().isoformat())
                    return True, sanitized_items, next_cursor
                else:
                    return False, [], f"Error HTTP {resp.status} al consultar feed de sincronización."
        except Exception as e:
            return False, [], f"Error en feed incremental DNRPA: {str(e)}"
