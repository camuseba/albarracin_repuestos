#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
PARTS COMPATIBILITY SYNC & TECHNICAL MATRIX ENGINE
Albarracín Motos y Repuestos - Chabás, Santa Fe
=============================================================================
Implementa:
1. Proceso desacoplado PARTS_COMPATIBILITY_SYNC.
2. Separación estricta:
   - DNRPA -> Identificación Vehicular.
   - Fabricante / OEM / Distribuidores -> Catálogos Técnicos de Repuestos.
3. Sincronización de códigos OEM, equivalencias, aplicaciones y compatibilidad
   con estado estricto: VERIFIED, PENDING, REJECTED.
=============================================================================
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "compatibility_db.json")

logger = logging.getLogger("PARTS_COMPATIBILITY_SYNC")

class PartsCompatibilityEngine:
    """Motor de compatibilidad técnica Many-to-Many entre repuestos y vehículos."""

    VALID_SOURCES = [
        "FABRICANTE",
        "OEM",
        "DISTRIBUIDOR_OFICIAL",
        "CATÁLOGO_LICENCIADO",
        "BASE_INTERNA_VERIFICADA"
    ]

    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path

    def load_db(self) -> Dict[str, Any]:
        if os.path.exists(self.db_path):
            with open(self.db_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"vehicles": [], "product_vehicle_compatibility": [], "product_oem_references": []}

    def save_db(self, db: Dict[str, Any]) -> bool:
        tmp_path = self.db_path + ".tmp"
        try:
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(db, f, indent=2, ensure_ascii=False)
            os.replace(tmp_path, self.db_path)
            return True
        except Exception as e:
            logger.error(f"Error al guardar base de datos: {e}")
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return False

    def sync_technical_catalog(self, catalog_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Sincroniza un lote de compatibilidades técnicas provistas por fabricantes u OEMs.
        """
        db = self.load_db()
        compatibilities = db.setdefault("product_vehicle_compatibility", [])
        oem_refs = db.setdefault("product_oem_references", [])
        vehicles = db.get("vehicles", [])

        added = 0
        updated = 0
        rejected = 0
        now_str = datetime.now(timezone.utc).isoformat()

        for item in catalog_items:
            product_sku = item.get("product_sku")
            product_id = item.get("product_id")
            vehicle_id = item.get("vehicle_id")
            source = item.get("source", "CATÁLOGO_LICENCIADO")
            source_ref = item.get("source_reference", "Catálogo Técnico Fabricante")
            status = item.get("verification_status", "VERIFIED") # VERIFIED, PENDING, REJECTED
            oem_code = item.get("oem_code")
            manufacturer = item.get("manufacturer", "Fabricante Homologado")

            if source not in self.VALID_SOURCES:
                source = "CATÁLOGO_LICENCIADO"

            # Validar existencia del vehículo en base maestra
            vehicle_exists = any(v["id"] == vehicle_id for v in vehicles)
            if not vehicle_exists and vehicle_id is not None:
                # Si el vehículo no existe en base maestra, no asociar directamente como VERIFIED
                status = "PENDING"

            # Buscar vínculo Many-to-Many existente
            existing = next((c for c in compatibilities if c.get("product_id") == product_id and c.get("vehicle_id") == vehicle_id), None)
            if not existing and product_sku:
                existing = next((c for c in compatibilities if c.get("product_sku") == product_sku and c.get("vehicle_id") == vehicle_id), None)

            if existing:
                existing["compatibility_type"] = item.get("compatibility_type", existing.get("compatibility_type", "EXACTA"))
                existing["compatibility_scope"] = item.get("compatibility_scope", existing.get("compatibility_scope", "MOTOR_CHASIS"))
                existing["position"] = item.get("position", existing.get("position", "General"))
                existing["year_from"] = item.get("year_from", existing.get("year_from"))
                existing["year_to"] = item.get("year_to", existing.get("year_to"))
                existing["engine_code"] = item.get("engine_code", existing.get("engine_code"))
                existing["engine_displacement"] = item.get("engine_displacement", existing.get("engine_displacement"))
                existing["notes"] = item.get("notes", existing.get("notes", ""))
                existing["source"] = source
                existing["source_reference"] = source_ref
                existing["verification_status"] = status
                existing["verified"] = (status == "VERIFIED")
                existing["verified_at"] = now_str if status == "VERIFIED" else None
                existing["updated_at"] = now_str
                updated += 1
            else:
                new_id = max([c.get("id", 0) for c in compatibilities], default=0) + 1
                compatibilities.append({
                    "id": new_id,
                    "product_id": product_id,
                    "product_sku": product_sku,
                    "vehicle_id": vehicle_id,
                    "compatibility_type": item.get("compatibility_type", "EXACTA"),
                    "compatibility_scope": item.get("compatibility_scope", "MOTOR_CHASIS"),
                    "position": item.get("position", "General"),
                    "year_from": item.get("year_from"),
                    "year_to": item.get("year_to"),
                    "engine_code": item.get("engine_code"),
                    "engine_displacement": item.get("engine_displacement"),
                    "notes": item.get("notes", ""),
                    "source": source,
                    "source_reference": source_ref,
                    "confidence": float(item.get("confidence", 1.0)),
                    "verification_status": status,
                    "verified": (status == "VERIFIED"),
                    "verified_by": "PARTS_COMPATIBILITY_ENGINE",
                    "verified_at": now_str if status == "VERIFIED" else None,
                    "created_at": now_str,
                    "updated_at": now_str
                })
                added += 1

            # Registrar código OEM si está presente
            if oem_code and product_id:
                oem_exist = next((o for o in oem_refs if o.get("product_id") == product_id and o.get("reference_code") == oem_code), None)
                if not oem_exist:
                    o_id = max([o.get("id", 0) for o in oem_refs], default=0) + 1
                    oem_refs.append({
                        "id": o_id,
                        "product_id": product_id,
                        "manufacturer": manufacturer,
                        "reference_type": "OEM",
                        "reference_code": str(oem_code).strip().upper(),
                        "source": source,
                        "verified": True,
                        "created_at": now_str
                    })

        self.save_db(db)
        return {
            "success": True,
            "added": added,
            "updated": updated,
            "rejected": rejected,
            "total_verified": len([c for c in compatibilities if c.get("verification_status") == "VERIFIED"]),
            "total_pending": len([c for c in compatibilities if c.get("verification_status") == "PENDING"])
        }

    def get_verified_compatibilities_for_vehicle(self, vehicle_id: int) -> List[Dict[str, Any]]:
        """
        Retorna EXCLUSIVAMENTE los registros con estado VERIFIED para un vehículo dado.
        REGLA DE LA WEB PÚBLICA: Nunca mostrar PENDING como compatible confirmado.
        """
        db = self.load_db()
        compatibilities = db.get("product_vehicle_compatibility", [])
        return [
            c for c in compatibilities 
            if c.get("vehicle_id") == vehicle_id and c.get("verification_status") == "VERIFIED"
        ]
