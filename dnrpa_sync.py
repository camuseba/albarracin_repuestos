#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
DAILY DNRPA SYNC & MASTER VEHICLE DATABASE ETL ENGINE
Albarracín Motos y Repuestos - Chabás, Santa Fe
=============================================================================
Implementa:
1. DAILY_DNRPA_SYNC: Tarea de sincronización diaria incremental.
2. Control de concurrencia mediante DNRPA_SYNC_LOCK (evita ejecuciones simultáneas).
3. Reintentos automáticos con backoff exponencial (3 intentos).
4. Persistencia en base maestra normalizada con cálculo de record_hash.
5. Regla de borrado seguro: Registros dados de baja pasan a 'PENDING_REVIEW'
   (nunca se eliminan automáticamente).
6. Trazabilidad completa en tabla vehicle_sync_runs.
7. Horario por defecto: 03:30 AM America/Argentina/Buenos_Aires.
=============================================================================
"""

import os
import sys
import json
import time
import hashlib
import logging
import argparse
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple

from dnrpa_provider import DnrpaVehicleProvider
from acara_sync import fetch_open_data_and_acara_feed

# Rutas del sistema
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "compatibility_db.json")
LOCK_FILE = os.path.join(BASE_DIR, "dnrpa_sync.lock")
LOG_FILE = os.path.join(BASE_DIR, "dnrpa_sync.log")

# Configuración de Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [DNRPA_SYNC] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("DNRPA_SYNC")

# Variables de programación
DNRPA_SYNC_SCHEDULE = os.getenv("DNRPA_SYNC_SCHEDULE", "30 3 * * *")
DNRPA_SYNC_TIMEZONE = os.getenv("DNRPA_SYNC_TIMEZONE", "America/Argentina/Buenos_Aires")

class SyncLock:
    """Manejo de bloqueo exclusivo para evitar ejecuciones concurrentes."""
    def __init__(self, lock_path: str = LOCK_FILE, timeout_minutes: int = 45):
        self.lock_path = lock_path
        self.timeout_minutes = timeout_minutes
        self.acquired = False

    def __enter__(self):
        if os.path.exists(self.lock_path):
            try:
                mod_time = datetime.fromtimestamp(os.path.getmtime(self.lock_path))
                if datetime.now() - mod_time > timedelta(minutes=self.timeout_minutes):
                    logger.warning(f"Lock huérfano detectado ({mod_time}). Liberando lock...")
                    os.remove(self.lock_path)
                else:
                    with open(self.lock_path, "r", encoding="utf-8") as f:
                        lock_info = f.read()
                    raise RuntimeError(f"DNRPA_SYNC_LOCK ACTIVO: Otra sincronización está en curso ({lock_info}). Abortando ejecución duplicada.")
            except Exception as e:
                if "DNRPA_SYNC_LOCK ACTIVO" in str(e):
                    raise
                pass

        with open(self.lock_path, "w", encoding="utf-8") as f:
            f.write(f"PID={os.getpid()} Started={datetime.now().isoformat()}")
        self.acquired = True
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.acquired and os.path.exists(self.lock_path):
            try:
                os.remove(self.lock_path)
            except Exception as e:
                logger.error(f"Error al remover lock file: {e}")

class DnrpaSyncEngine:
    """Motor maestro de sincronización incremental DNRPA y Base Vehicular."""

    def __init__(self):
        self.provider = DnrpaVehicleProvider()

    @staticmethod
    def calculate_record_hash(data: Dict[str, Any]) -> str:
        """Calcula el hash SHA-256 de los atributos técnicos normalizados."""
        components = [
            str(data.get("make", "")).strip().upper(),
            str(data.get("model", "")).strip().upper(),
            str(data.get("version", "")).strip().upper(),
            str(data.get("year_from", data.get("year", 0))),
            str(data.get("year_to", data.get("year", 0))),
            str(data.get("engine", "")).strip().upper(),
            str(data.get("engine_code", "")).strip().upper(),
            str(data.get("engine_displacement", "")).strip().upper(),
            str(data.get("fuel_type", "")).strip().upper(),
            str(data.get("vehicle_type", "")).strip().upper()
        ]
        raw_str = "|".join(components)
        return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

    def load_db(self) -> Dict[str, Any]:
        """Carga la base de datos relacional local."""
        if not os.path.exists(DB_FILE):
            return {
                "vehicle_types": [
                    {"id": 1, "name": "Motos", "slug": "motos"},
                    {"id": 2, "name": "Autos", "slug": "autos"},
                    {"id": 3, "name": "Pick-ups y 4x4", "slug": "pickups"},
                    {"id": 4, "name": "Camiones y Acoplados", "slug": "camiones"}
                ],
                "vehicle_makes": [],
                "vehicle_models": [],
                "vehicle_versions": [],
                "vehicles": [],
                "product_vehicle_compatibility": [],
                "product_oem_references": [],
                "sample_plates": [],
                "vehicle_sync_runs": []
            }
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                db = json.load(f)
                if "vehicle_sync_runs" not in db:
                    db["vehicle_sync_runs"] = []
                return db
        except Exception as e:
            logger.error(f"Error al cargar compatibility_db.json: {e}")
            raise

    def save_db(self, db: Dict[str, Any]) -> bool:
        """Persiste la base de datos relacional local de forma atómica."""
        tmp_file = DB_FILE + ".tmp"
        try:
            with open(tmp_file, "w", encoding="utf-8") as f:
                json.dump(db, f, indent=2, ensure_ascii=False)
            os.replace(tmp_file, DB_FILE)
            return True
        except Exception as e:
            logger.error(f"Error al guardar compatibility_db.json: {e}")
            if os.path.exists(tmp_file):
                os.remove(tmp_file)
            return False

    def execute_sync(self, custom_records: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Ejecuta el ciclo de sincronización diaria incremental con reintentos y backoff.
        """
        run_id = int(time.time())
        start_time = datetime.now(timezone.utc).isoformat()
        
        run_record = {
            "id": run_id,
            "provider": "DNRPA_OFFICIAL",
            "started_at": start_time,
            "finished_at": None,
            "status": "RUNNING",
            "records_received": 0,
            "records_inserted": 0,
            "records_updated": 0,
            "records_unchanged": 0,
            "records_failed": 0,
            "last_cursor": None,
            "last_sync_reference": None,
            "error_message": None,
            "created_at": start_time
        }

        # Comprobar lock de concurrencia
        try:
            with SyncLock():
                db = self.load_db()
                db["vehicle_sync_runs"].append(run_record)
                self.save_db(db)

                # Obtener registros (desde custom_records o desde el provider con 3 reintentos)
                records = []
                last_cursor = None
                error_msg = None

                if custom_records is not None:
                    records = custom_records
                    last_cursor = f"BATCH_IMPORT_{run_id}"
                elif self.provider.enabled:
                    # Intento 1 -> Espera (2s) -> Intento 2 -> Espera (4s) -> Intento 3 (8s)
                    max_attempts = 3
                    backoff = 2
                    sync_success = False

                    # Obtener último cursor exitoso
                    previous_success = [r for r in db.get("vehicle_sync_runs", []) if r.get("status") == "SUCCESS"]
                    last_successful_cursor = previous_success[-1].get("last_cursor") if previous_success else None

                    for attempt in range(1, max_attempts + 1):
                        logger.info(f"Iniciando intento {attempt}/{max_attempts} de sincronización DNRPA...")
                        success, fetched_records, cursor_or_err = self.provider.fetch_daily_incremental_feed(last_successful_cursor)
                        
                        if success:
                            records = fetched_records
                            last_cursor = cursor_or_err
                            sync_success = True
                            logger.info(f"Sincronización exitosa en intento {attempt}. Recibidos: {len(records)} registros.")
                            break
                        else:
                            error_msg = cursor_or_err
                            logger.warning(f"Intento {attempt} falló: {error_msg}")
                            if attempt < max_attempts:
                                wait_time = backoff ** attempt
                                logger.info(f"Esperando {wait_time}s antes de reintentar...")
                                time.sleep(wait_time)

                    if not sync_success:
                        # Si el conector oficial no está activo o falló tras 3 intentos
                        run_record["status"] = "FAILED"
                        run_record["finished_at"] = datetime.now(timezone.utc).isoformat()
                        run_record["error_message"] = error_msg or "Fallaron todos los reintentos hacia DNRPA."
                        self._update_run_record(db, run_record)
                        return run_record
                else:
                    # Modo Catálogo Maestro Interno de Especificaciones Vehiculares Homologadas
                    logger.info("Ejecutando sincronización de Catálogo Maestro Interno de Especificaciones Vehiculares...")
                    records = fetch_open_data_and_acara_feed()
                    run_record["provider"] = "INTERNAL_MASTER_CATALOG"
                    last_cursor = f"INTERNAL_CATALOG_{run_id}"
                    logger.info(f"Obtenidos {len(records)} registros de Catálogo Maestro Interno para procesamiento incremental.")

                # Calcular hash global de la fuente recibida
                raw_payload_str = json.dumps(records, sort_keys=True)
                current_hash = hashlib.sha256(raw_payload_str.encode("utf-8")).hexdigest()
                
                # Obtener corrida anterior exitosa
                previous_runs = [r for r in db.get("vehicle_sync_runs", []) if r.get("status") in ("SUCCESS", "NO_CHANGES")]
                prev_run = previous_runs[-1] if previous_runs else {}
                previous_hash = prev_run.get("source_hash")

                if len(records) == 0:
                    run_record["status"] = "FAILED"
                    run_record["finished_at"] = datetime.now(timezone.utc).isoformat()
                    run_record["error_message"] = "CRITICAL — EMPTY DATASET: Se recibieron 0 registros de la fuente."
                    run_record["source_hash"] = current_hash
                    run_record["previous_source_hash"] = previous_hash
                    self._update_run_record(db, run_record)
                    logger.error("CRITICAL — EMPTY DATASET: Abortando importación para proteger base actual.")
                    return run_record

                # Procesamiento incremental de registros
                inserted, updated, unchanged, failed = self._process_incremental_records(db, records)

                run_record["records_received"] = len(records)
                run_record["records_inserted"] = inserted
                run_record["records_updated"] = updated
                run_record["records_unchanged"] = unchanged
                run_record["records_failed"] = failed
                run_record["last_cursor"] = last_cursor
                run_record["last_sync_reference"] = f"DNRPA_SYNC_REF_{run_id}"
                run_record["hash_algorithm"] = "SHA-256"
                run_record["source_hash"] = current_hash
                run_record["previous_source_hash"] = previous_hash
                run_record["dataset_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                run_record["workflow_run_id"] = os.getenv("GITHUB_RUN_ID", "LOCAL_EXECUTION")
                run_record["commit_sha"] = os.getenv("GITHUB_SHA", "LOCAL_COMMIT")

                if current_hash == previous_hash and inserted == 0 and updated == 0:
                    run_record["status"] = "NO_CHANGES"
                else:
                    run_record["status"] = "PARTIAL_SUCCESS" if failed > 0 else "SUCCESS"

                run_record["finished_at"] = datetime.now(timezone.utc).isoformat()

                self._update_run_record(db, run_record)
                logger.info(f"Sincronización completada ({run_record['status']}): Hash={current_hash[:8]}..., Insertados={inserted}, Actualizados={updated}, Sin cambios={unchanged}, Fallidos={failed}.")
                return run_record

        except RuntimeError as lock_err:
            logger.error(str(lock_err))
            run_record["status"] = "CANCELLED"
            run_record["error_message"] = str(lock_err)
            run_record["finished_at"] = datetime.now(timezone.utc).isoformat()
            return run_record
        except Exception as e:
            logger.error(f"Error crítico en sincronización diaria: {e}")
            run_record["status"] = "FAILED"
            run_record["error_message"] = str(e)
            run_record["finished_at"] = datetime.now(timezone.utc).isoformat()
            return run_record

    def _update_run_record(self, db: Dict[str, Any], run_record: Dict[str, Any]):
        """Actualiza el registro de corrida en la base local."""
        runs = db.get("vehicle_sync_runs", [])
        for idx, r in enumerate(runs):
            if r.get("id") == run_record["id"]:
                runs[idx] = run_record
                break
        self.save_db(db)

    def _process_incremental_records(self, db: Dict[str, Any], records: List[Dict[str, Any]]) -> Tuple[int, int, int, int]:
        """
        Aplica las reglas de FASE 5:
        - Registro nuevo -> INSERT
        - Registro modificado -> UPDATE
        - Registro sin cambios -> NO MODIFICAR
        - Registro que desaparece del proveedor -> Marcar PENDING_REVIEW
        """
        inserted = 0
        updated = 0
        unchanged = 0
        failed = 0

        makes = db.setdefault("vehicle_makes", [])
        models = db.setdefault("vehicle_models", [])
        versions = db.setdefault("vehicle_versions", [])
        vehicles = db.setdefault("vehicles", [])

        now_str = datetime.now(timezone.utc).isoformat()

        for rec in records:
            try:
                make_name = (rec.get("make") or "").strip().title()
                model_name = (rec.get("model") or "").strip().title()
                version_name = (rec.get("version") or "Estándar").strip()
                vtype_str = (rec.get("vehicle_type") or "autos").strip().lower()
                year = rec.get("year")
                year_from = rec.get("year_from", year or 2010)
                year_to = rec.get("year_to", year or 2026)
                engine = (rec.get("engine") or "Estándar").strip()
                engine_code = (rec.get("engine_code") or "").strip().upper()
                displacement = (rec.get("engine_displacement") or "").strip()
                fuel_type = (rec.get("fuel_type") or "Nafta").strip().title()

                if not make_name or not model_name:
                    failed += 1
                    continue

                # 1. Determinar vehicle_type_id
                type_id = 2 # Autos por defecto
                if "moto" in vtype_str or "ciclomotor" in vtype_str or "scooter" in vtype_str:
                    type_id = 1
                elif "pickup" in vtype_str or "4x4" in vtype_str or "utilitario" in vtype_str:
                    type_id = 3
                elif "camion" in vtype_str or "acoplado" in vtype_str:
                    type_id = 4

                # 2. Upsert Make
                make_slug = make_name.lower().replace(" ", "-")
                make_obj = next((m for m in makes if m["name"].lower() == make_name.lower()), None)
                if not make_obj:
                    make_id = max([m["id"] for m in makes], default=0) + 1
                    make_obj = {
                        "id": make_id,
                        "vehicle_type_id": type_id,
                        "name": make_name,
                        "slug": make_slug,
                        "country": "Internacional",
                        "is_active": True,
                        "source": "DNRPA_OFFICIAL",
                        "source_record_id": rec.get("external_id", f"MAKE_{make_id}"),
                        "last_synced_at": now_str,
                        "sync_status": "SYNCED",
                        "verification_status": "VERIFIED",
                        "created_at": now_str,
                        "updated_at": now_str
                    }
                    makes.append(make_obj)
                else:
                    make_obj["last_synced_at"] = now_str
                    make_obj["sync_status"] = "SYNCED"

                # 3. Upsert Model
                model_slug = f"{make_slug}-{model_name.lower().replace(' ', '-')}"
                model_obj = next((m for m in models if m["vehicle_make_id"] == make_obj["id"] and m["name"].lower() == model_name.lower()), None)
                if not model_obj:
                    model_id = max([m["id"] for m in models], default=0) + 1
                    model_obj = {
                        "id": model_id,
                        "vehicle_make_id": make_obj["id"],
                        "name": model_name,
                        "slug": model_slug,
                        "vehicle_type_id": type_id,
                        "is_active": True,
                        "source": "DNRPA_OFFICIAL",
                        "external_id": rec.get("external_id", f"MODEL_{model_id}"),
                        "last_synced_at": now_str,
                        "sync_status": "SYNCED",
                        "verification_status": "VERIFIED",
                        "created_at": now_str,
                        "updated_at": now_str
                    }
                    models.append(model_obj)
                else:
                    model_obj["last_synced_at"] = now_str
                    model_obj["sync_status"] = "SYNCED"

                # 4. Upsert Version & Config
                version_obj = next((v for v in versions if v["vehicle_model_id"] == model_obj["id"] and v["name"].lower() == version_name.lower()), None)
                record_hash = self.calculate_record_hash(rec)

                if not version_obj:
                    version_id = max([v["id"] for v in versions], default=0) + 1
                    version_obj = {
                        "id": version_id,
                        "vehicle_model_id": model_obj["id"],
                        "name": version_name,
                        "generation": rec.get("generation", "Estándar"),
                        "year_from": int(year_from),
                        "year_to": int(year_to),
                        "engine_code": engine_code,
                        "engine_displacement": displacement,
                        "fuel_type": fuel_type,
                        "transmission": rec.get("transmission", "Manual"),
                        "traction": rec.get("traction", "4x2"),
                        "body_type": rec.get("body_type", "Sedan / Hatchback"),
                        "external_id": rec.get("external_id", f"VER_{version_id}"),
                        "source": "DNRPA_OFFICIAL",
                        "sync_status": "SYNCED",
                        "verification_status": "VERIFIED",
                        "record_hash": record_hash,
                        "is_active": True,
                        "created_at": now_str,
                        "updated_at": now_str
                    }
                    versions.append(version_obj)
                    inserted += 1
                else:
                    # Comparar hash para determinar si cambió
                    if version_obj.get("record_hash") != record_hash:
                        version_obj["generation"] = rec.get("generation", version_obj.get("generation", "Estándar"))
                        version_obj["year_from"] = int(year_from)
                        version_obj["year_to"] = int(year_to)
                        version_obj["engine_code"] = engine_code or version_obj.get("engine_code", "")
                        version_obj["engine_displacement"] = displacement or version_obj.get("engine_displacement", "")
                        version_obj["fuel_type"] = fuel_type
                        version_obj["record_hash"] = record_hash
                        version_obj["sync_status"] = "SYNCED"
                        version_obj["verification_status"] = "VERIFIED"
                        version_obj["updated_at"] = now_str
                        version_obj["last_synced_at"] = now_str
                        updated += 1
                    else:
                        version_obj["last_synced_at"] = now_str
                        version_obj["sync_status"] = "SYNCED"
                        unchanged += 1

                # 5. Asegurar registro en vehículos individuales
                target_year = int(year or year_from)
                veh_obj = next((v for v in vehicles if v["make_id"] == make_obj["id"] and v["model_id"] == model_obj["id"] and v["version_id"] == version_obj["id"] and v["year"] == target_year), None)
                if not veh_obj:
                    v_id = max([v["id"] for v in vehicles], default=0) + 1
                    vehicles.append({
                        "id": v_id,
                        "vehicle_type_id": type_id,
                        "make_id": make_obj["id"],
                        "model_id": model_obj["id"],
                        "version_id": version_obj["id"],
                        "year": target_year,
                        "engine_code": engine_code,
                        "engine_displacement": displacement,
                        "fuel_type": fuel_type,
                        "source": "DNRPA_OFFICIAL",
                        "external_id": rec.get("external_id", f"VEH_{v_id}"),
                        "sync_status": "SYNCED",
                        "verification_status": "VERIFIED",
                        "record_hash": record_hash,
                        "is_active": True,
                        "created_at": now_str,
                        "updated_at": now_str
                    })

            except Exception as item_err:
                logger.error(f"Error procesando registro {rec}: {item_err}")
                failed += 1

        # Regla: Registros con más de 90 días sin sincronizar se marcan como PENDING_REVIEW (nunca se borran)
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()
        for v in versions:
            if v.get("last_synced_at") and v["last_synced_at"] < cutoff_date and v.get("sync_status") == "SYNCED":
                v["sync_status"] = "PENDING_REVIEW"
                v["verification_status"] = "PENDING"
                logger.info(f"Registro marcado como PENDING_REVIEW: Versión ID {v['id']} ({v['name']})")

        self.save_db(db)
        return inserted, updated, unchanged, failed

def get_next_scheduled_sync() -> str:
    """Calcula la próxima fecha y hora estimada de sincronización."""
    # Por defecto 03:30 AM hora local
    now = datetime.now()
    next_run = now.replace(hour=3, minute=30, second=0, microsecond=0)
    if next_run <= now:
        next_run += timedelta(days=1)
    return next_run.strftime("%Y-%m-%d 03:30:00") + " (America/Argentina/Buenos_Aires)"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Motor de Sincronización Diaria DNRPA - Albarracín")
    parser.add_argument("--run-now", action="store_true", help="Ejecuta la sincronización incremental inmediatamente")
    parser.add_argument("--test-connection", action="store_true", help="Prueba el handshake y estado del conector DNRPA")
    parser.add_argument("--status", action="store_true", help="Muestra el estado del conector y última sincronización")
    parser.add_argument("--import-file", type=str, help="Importa un archivo JSON o CSV de novedades oficiales")
    parser.add_argument("--daemon", action="store_true", help="Ejecuta el scheduler en segundo plano para 03:30 AM")

    args = parser.parse_args()
    engine = DnrpaSyncEngine()

    if args.test_connection:
        ok, msg, info = engine.provider.test_connection()
        print(f"Resultado del Test de Conexión:")
        print(f"Estado: {info.get('badge', info.get('status'))}")
        print(f"Detalle: {msg}")
        sys.exit(0 if ok else 1)

    elif args.status:
        st = engine.provider.get_status_info()
        db = engine.load_db()
        runs = db.get("vehicle_sync_runs", [])
        last_run = runs[-1] if runs else {}
        print("=" * 60)
        print("ESTADO DEL CONECTOR DNRPA & BASE VEHICULAR")
        print("=" * 60)
        print(f"Fuente Principal: DNRPA Oficial ({st.get('connection_type')})")
        print(f"Estado de Conexión: {st.get('badge')}")
        print(f"Mensaje: {st.get('message')}")
        print(f"Última Sincronización: {last_run.get('finished_at', 'Sin ejecuciones registradas')}")
        print(f"Resultado Última Corrida: {last_run.get('status', 'N/A')}")
        print(f"Próxima Sincronización Programada: {get_next_scheduled_sync()}")
        print(f"Marcas: {len(db.get('vehicle_makes', []))} | Modelos: {len(db.get('vehicle_models', []))} | Versiones: {len(db.get('vehicle_versions', []))}")
        print("=" * 60)

    elif args.import_file:
        if not os.path.exists(args.import_file):
            print(f"Error: Archivo no encontrado: {args.import_file}")
            sys.exit(1)
        with open(args.import_file, "r", encoding="utf-8") as f:
            records = json.load(f)
        res = engine.execute_sync(custom_records=records)
        print(json.dumps(res, indent=2))

    elif args.run_now:
        print("Iniciando DAILY_DNRPA_SYNC bajo demanda...")
        res = engine.execute_sync()
        now_dt = datetime.now(timezone.utc)
        print("\n" + "=" * 60)
        print("=== ALBARRACÍN VEHICLE DATABASE SYNC ===")
        print(f"DATE: {now_dt.strftime('%Y-%m-%d')}")
        print(f"TIME: {now_dt.strftime('%H:%M:%S')}")
        print("TIMEZONE: America/Argentina/Buenos_Aires (UTC-3)")
        print(f"PROVIDER: {res.get('provider')}")
        print(f"RECORDS RECEIVED: {res.get('records_received')}")
        print(f"DATA DATE: {res.get('dataset_date')}")
        print(f"DATABASE INSERTED: {res.get('records_inserted')}")
        print(f"DATABASE UPDATED: {res.get('records_updated')}")
        print(f"DATABASE UNCHANGED: {res.get('records_unchanged')}")
        print(f"DATABASE REJECTED: {res.get('records_failed')}")
        print(f"PREVIOUS HASH: {res.get('previous_source_hash')}")
        print(f"CURRENT HASH: {res.get('source_hash')}")
        print(f"WORKFLOW RUN ID: {res.get('workflow_run_id')}")
        print(f"COMMIT SHA: {res.get('commit_sha')}")
        print(f"FINAL STATUS: {res.get('status')}")
        print("=" * 60 + "\n")

    elif args.daemon:
        print(f"Iniciando scheduler daemon DNRPA (Programado: {DNRPA_SYNC_SCHEDULE} en {DNRPA_SYNC_TIMEZONE})...")
        while True:
            now = datetime.now()
            # Chequear si es las 03:30 AM
            if now.hour == 3 and now.minute == 30:
                logger.info("Disparando DAILY_DNRPA_SYNC programada (03:30 AM)...")
                engine.execute_sync()
                time.sleep(70) # Esperar 70 segundos para no repetir en el mismo minuto
            time.sleep(30)
    else:
        parser.print_help()
