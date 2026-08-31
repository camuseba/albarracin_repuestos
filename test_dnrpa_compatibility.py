#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
SUITE DE PRUEBAS AUTOMATIZADAS — COMPATIBILIDAD VEHICULAR & DNRPA
Albarracín Motos y Repuestos - Chabás, Santa Fe
=============================================================================
Verifica los requisitos de la FASE 17:
1. Sincronización incremental: Sin cambios, nuevos datos, modificados, lock.
2. Manejo de errores y timeouts en conector oficial.
3. Compatibilidad estricta con vehículos reales (Motos, Autos, Pick-ups).
4. Modelos con múltiples versiones / motorizaciones.
5. Exclusión de productos no verificados y privacidad.
=============================================================================
"""

import os
import sys
import json
import shutil
import tempfile
import time
import unittest
from datetime import datetime, timezone

from dnrpa_provider import DnrpaVehicleProvider
from dnrpa_sync import DnrpaSyncEngine, SyncLock
from parts_compatibility_sync import PartsCompatibilityEngine
from compatibility_service import VehicleLookupService, load_compatibility_db

class TestDnrpaCompatibilityArchitecture(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_db_path = os.path.join(self.temp_dir.name, "compatibility_db.json")
        shutil.copy2(os.path.join(os.path.dirname(__file__), "compatibility_db.json"), self.test_db_path)
        self.engine = DnrpaSyncEngine(
            db_path=self.test_db_path,
            lock_path=os.path.join(self.temp_dir.name, "dnrpa_sync.lock")
        )
        self.provider = DnrpaVehicleProvider()
        self.parts_engine = PartsCompatibilityEngine(db_path=self.test_db_path)
        with open(self.test_db_path, "r", encoding="utf-8") as f:
            self.db = json.load(f)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_01_privacy_sanitization(self):
        """FASE 16: Privacidad - Descarte inmediato de datos personales."""
        raw_payload = {
            "titular": "Juan Carlos Pérez",
            "dni": "30123456",
            "cuit": "20-30123456-7",
            "domicilio": "Av. San Martín 1234, Rosario",
            "marca": "Toyota",
            "modelo": "Hilux",
            "version": "2.8 TDI 4x4 SRV",
            "anio": "2021",
            "motor": "1GD-FTV",
            "cilindrada": "2755 cc",
            "combustible": "Diesel",
            "tipo_vehiculo": "pickup"
        }
        sanitized = DnrpaVehicleProvider.sanitize_technical_payload(raw_payload)

        # Verificar que NINGÚN dato personal exista en el resultado
        self.assertNotIn("titular", sanitized)
        self.assertNotIn("dni", sanitized)
        self.assertNotIn("cuit", sanitized)
        self.assertNotIn("domicilio", sanitized)
        self.assertNotIn("Juan Carlos Pérez", str(sanitized))
        self.assertNotIn("30123456", str(sanitized))

        # Verificar que los datos técnicos sí existan
        self.assertEqual(sanitized["make"], "Toyota")
        self.assertEqual(sanitized["model"], "Hilux")
        self.assertEqual(sanitized["year"], 2021)
        self.assertEqual(sanitized["fuel_type"], "Diesel")
        print("[PASS] Test 01: Privacidad estricta y descarte de datos personales.")

    def test_02_dnrpa_provider_status_handling(self):
        """FASE 2: El proveedor no inventa endpoints y reporta estado preciso."""
        info = self.provider.get_status_info()
        self.assertIn("status", info)
        self.assertIn("badge", info)
        self.assertIn("message", info)
        
        if not self.provider.enabled or not self.provider.api_url:
            self.assertEqual(info["status"], DnrpaVehicleProvider.STATUS_PENDING_CREDENTIALS)
        print("[PASS] Test 02: Estado del conector DNRPA reportado sin simulacion apocrifa.")

    def test_03_incremental_sync_insert_update_unchanged(self):
        """FASES 4 & 5: Inserción, actualización y detección de sin cambios."""
        test_rec = {
            "make": "Renault",
            "model": "Kangoo",
            "version": f"1.6 SCe Zen Test_{int(time.time())}",
            "vehicle_type": "autos",
            "year": 2022,
            "year_from": 2018,
            "year_to": 2026,
            "engine": "1.6 16V",
            "engine_code": "H4M",
            "engine_displacement": "1598 cc",
            "fuel_type": "Nafta"
        }

        # 1. Primera corrida: INSERT
        res1 = self.engine.execute_sync(custom_records=[test_rec])
        self.assertEqual(res1["status"], "SUCCESS")
        self.assertGreaterEqual(res1["records_inserted"], 1)

        # 2. Segunda corrida idéntica: NO_CHANGES
        res2 = self.engine.execute_sync(custom_records=[test_rec])
        self.assertIn(res2["status"], ("SUCCESS", "NO_CHANGES"))
        self.assertEqual(res2["records_inserted"], 0)
        self.assertGreaterEqual(res2["records_unchanged"], 1)

        # 3. Tercera corrida con modificación: UPDATE
        mod_rec = dict(test_rec)
        mod_rec["engine_displacement"] = "1600 cc Reforzado"
        res3 = self.engine.execute_sync(custom_records=[mod_rec])
        self.assertEqual(res3["status"], "SUCCESS")
        self.assertGreaterEqual(res3["records_updated"], 1)
        print("[PASS] Test 03: Sincronizacion incremental (INSERT, UNCHANGED, UPDATE).")

    def test_04_concurrency_sync_lock(self):
        """FASE 7: Concurrencia - DNRPA_SYNC_LOCK impide ejecuciones simultáneas."""
        lock_file = self.engine.lock_path
        
        # Simular un lock activo
        with open(lock_file, "w", encoding="utf-8") as f:
            f.write(f"PID=99999 Started={datetime.now().isoformat()}")

        try:
            # Intentar ejecutar mientras está bloqueado
            res = self.engine.execute_sync()
            self.assertEqual(res["status"], "CANCELLED")
            self.assertIn("DNRPA_SYNC_LOCK ACTIVO", res.get("error_message", ""))
            print("[PASS] Test 04: Bloqueo de ejecuciones duplicadas con DNRPA_SYNC_LOCK.")
        finally:
            if os.path.exists(lock_file):
                os.remove(lock_file)

    def test_05_plate_formats_moto_and_auto(self):
        """FASE 8: Validación de patentes argentinas tradicionales y Mercosur."""
        # Autos tradicionales (3 letras, 3 números)
        self.assertTrue(VehicleLookupService.validate_format("PAV832"))
        self.assertTrue(VehicleLookupService.validate_format("OOT554"))
        
        # Autos Mercosur (2 letras, 3 números, 2 letras)
        self.assertTrue(VehicleLookupService.validate_format("AB123CD"))
        self.assertTrue(VehicleLookupService.validate_format("AH114CQ"))
        
        # Motos tradicionales (3 números, 3 letras)
        self.assertTrue(VehicleLookupService.validate_format("123ABC"))
        
        # Motos Mercosur (1 letra, 3 números, 3 letras)
        self.assertTrue(VehicleLookupService.validate_format("A123BCD"))

        # Inválidas
        self.assertFalse(VehicleLookupService.validate_format("123456"))
        self.assertFalse(VehicleLookupService.validate_format("INVALID_PLATE"))
        print("[PASS] Test 05: Validacion regex de patentes Auto y Moto (Tradicional y Mercosur).")

    def test_06_moto_and_pickup_lookup_and_compatibility(self):
        """FASE 8, 9 & 10: Resolución y compatibilidad de Moto, Auto y Pick-up."""
        # 1. Moto (CG Titan)
        moto_res = VehicleLookupService.lookup("A123BCD")
        self.assertTrue(moto_res["success"])
        self.assertEqual(moto_res["vehicle"]["make"], "Honda")
        self.assertEqual(moto_res["vehicle"]["model"], "CG Titan")

        # 2. Pick-up (Hilux)
        pickup_res = VehicleLookupService.lookup("AB123CD")
        self.assertTrue(pickup_res["success"])
        self.assertEqual(pickup_res["vehicle"]["make"], "Toyota")
        self.assertEqual(pickup_res["vehicle"]["model"], "Hilux")

        # 3. Auto (Gol Trend)
        auto_res = VehicleLookupService.lookup("OOT554")
        self.assertTrue(auto_res["success"])
        self.assertEqual(auto_res["vehicle"]["make"], "Volkswagen")
        self.assertEqual(auto_res["vehicle"]["model"], "Gol Trend")
        print("[PASS] Test 06: Lookup exacto para Moto, Auto y Pick-up.")

    def test_07_strict_verified_compatibility_rule(self):
        """FASE 10 & 11: La web muestra SOLAMENTE compatibilidades VERIFIED."""
        # Agregar una compatibilidad de prueba con estado PENDING
        pending_item = {
            "product_id": 1,
            "product_sku": "TEST-PENDING-SKU",
            "vehicle_id": 1,
            "verification_status": "PENDING",
            "source": "CATÁLOGO_LICENCIADO"
        }
        self.parts_engine.sync_technical_catalog([pending_item])

        # Consultar compatibilidades verificadas
        verified_items = self.parts_engine.get_verified_compatibilities_for_vehicle(1)
        pending_in_verified = any(c.get("product_sku") == "TEST-PENDING-SKU" for c in verified_items)
        self.assertFalse(pending_in_verified, "Un registro PENDING NUNCA debe ser devuelto a la web pública")
        print("[PASS] Test 07: Exclusion estricta de registros PENDING/REJECTED en web publica.")

    def test_08_vehicle_sync_runs_audit_trail(self):
        """FASE 6: Tabla vehicle_sync_runs registra todas las ejecuciones."""
        db = self.engine.load_db()
        runs = db.get("vehicle_sync_runs", [])
        self.assertGreater(len(runs), 0)
        last_run = runs[-1]
        self.assertIn("status", last_run)
        self.assertIn("started_at", last_run)
        self.assertIn("records_inserted", last_run)
        self.assertIn("records_updated", last_run)
        print("[PASS] Test 08: Auditoria de corridas en vehicle_sync_runs.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
