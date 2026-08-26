-- =============================================================================
-- SISTEMA ECOMMERCE & ERP LOCAL ALBARRACÍN REPUESTOS
-- Esquema de Base de Datos Relacional PostgreSQL (v15+)
-- =============================================================================

-- Habilitar extensión para UUIDs si es necesario
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: productos
-- Almacena el inventario maestro con costos, PVPs y niveles de stock.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(60) NOT NULL UNIQUE, -- Código OEM o referencia proveedor
    marca VARCHAR(80) NOT NULL,      -- Bosch, SKF, Fras-le, DID, Mann Filter, etc.
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    costo_proveedor NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pvp_final NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- (Costo * 1.35) * 1.21
    stock_real INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 2,
    catalogo_oficial VARCHAR(120) DEFAULT 'Catálogo Oficial Albarracín',
    link_ml VARCHAR(255) DEFAULT 'https://listado.mercadolibre.com.ar/_CustId_3530277724',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_productos_sku ON productos(sku);
CREATE INDEX idx_productos_marca ON productos(marca);

-- -----------------------------------------------------------------------------
-- 2. TABLA: historial_precios
-- Registra la trazabilidad completa de cambios de costo y PVP para auditoría.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historial_precios (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    costo_anterior NUMERIC(12, 2) NOT NULL,
    costo_nuevo NUMERIC(12, 2) NOT NULL,
    pvp_anterior NUMERIC(12, 2) NOT NULL,
    pvp_nuevo NUMERIC(12, 2) NOT NULL,
    variacion_porcentaje NUMERIC(6, 2) NOT NULL,
    estado_aprobacion VARCHAR(30) NOT NULL DEFAULT 'APROBADO', -- 'APROBADO', 'PENDIENTE_ALERTA'
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historial_producto ON historial_precios(producto_id);

-- -----------------------------------------------------------------------------
-- 3. TABLA: compatibilidad_vehiculos
-- Vincula productos con marcas, modelos y años específicos de vehículos.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compatibilidad_vehiculos (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    marca_auto VARCHAR(80) NOT NULL, -- VW, Ford, Chevrolet, Toyota, Honda, etc.
    modelo VARCHAR(100) NOT NULL,
    anio_inicio INT NOT NULL,
    anio_fin INT NOT NULL,
    motorizacion VARCHAR(100)
);

CREATE INDEX idx_compatibilidad_auto ON compatibilidad_vehiculos(marca_auto, modelo);
CREATE INDEX idx_compatibilidad_producto ON compatibilidad_vehiculos(producto_id);

-- -----------------------------------------------------------------------------
-- 4. TABLA: cross_selling_rules
-- Reglas de Venta Cruzada (Complementos y Up-sells).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cross_selling_rules (
    id SERIAL PRIMARY KEY,
    producto_principal_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    producto_sugerido_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL DEFAULT 'COMPLEMENTO', -- 'COMPLEMENTO', 'UPSELL'
    descuento_porcentaje NUMERIC(5, 2) DEFAULT 0.00
);

CREATE INDEX idx_cross_selling_principal ON cross_selling_rules(producto_principal_id);

-- -----------------------------------------------------------------------------
-- 5. TABLA: club_beneficios_puntos
-- Puntos y beneficios para clientes y mecánicos afiliados.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_beneficios_puntos (
    id SERIAL PRIMARY KEY,
    usuario_id VARCHAR(100) NOT NULL UNIQUE,
    puntos_acumulados INT NOT NULL DEFAULT 0,
    nivel VARCHAR(20) NOT NULL DEFAULT 'BRONCE', -- 'BRONCE', 'PLATA', 'ORO', 'PLATINO'
    codigo_afiliado_mecanico VARCHAR(40) UNIQUE,
    repuestopesos_acumulados NUMERIC(12, 2) DEFAULT 0.00
);

CREATE INDEX idx_club_afiliado ON club_beneficios_puntos(codigo_afiliado_mecanico);

-- -----------------------------------------------------------------------------
-- 6. TABLA: recompra_programada
-- Recordatorio y automatización de mantenimiento preventivo.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recompra_programada (
    id SERIAL PRIMARY KEY,
    cliente_id VARCHAR(100) NOT NULL,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dias_intervalo_recompra INT NOT NULL DEFAULT 180,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' -- 'PENDIENTE', 'ENVIADO'
);

CREATE INDEX idx_recompra_estado ON recompra_programada(estado, fecha_compra);

-- -----------------------------------------------------------------------------
-- DATOS SEMILLA: REPUESTOS REALES CON CATÁLOGOS OFICIALES Y STOCK MERCADOLIBRE
-- -----------------------------------------------------------------------------
INSERT INTO productos (sku, marca, nombre, descripcion, costo_proveedor, pvp_final, stock_real, stock_minimo, catalogo_oficial, link_ml)
VALUES
('INJ-70014', 'Inyección', 'Módulo Bomba de Combustible 70014 VW Gol Trend / Fox / Suran 1.6', 'Bomba de nafta completa inyección electrónica. Presión 4.2 Bar.', 51770.00, 84500.00, 14, 2, 'Catálogo Oficial Inyección', 'https://listado.mercadolibre.com.ar/_CustId_3530277724'),
('INJ-20045', 'Encendido', 'Bobina de Encendido 20045 Chevrolet Corsa / Classic 1.4 8V', 'Bobina 4 pines encendido directo. Máximo rendimiento térmico.', 29530.00, 48200.00, 18, 3, 'Catálogo Oficial Encendido', 'https://listado.mercadolibre.com.ar/_CustId_3530277724'),
('AUTOCENTRAL-DIST-GATES', 'Gates', 'Kit de Distribución Gates + Tensor VW Gol Trend / Voyage 1.6 8V', 'Kit de distribución completo. Correa dentada reforzada y tensor.', 40300.00, 65800.00, 12, 2, 'AutoCentral.ar', 'https://listado.mercadolibre.com.ar/_CustId_3530277724'),
('ALMA-EMB-SACHS', 'Sachs', 'Kit de Embrague Completo Sachs 190mm VW Gol / Voyage / Fox', 'Placa, disco y crapodina de empuje original.', 113260.00, 185000.00, 8, 1, 'Alma Repuestos Listas', 'https://listado.mercadolibre.com.ar/_CustId_3530277724'),
('ACARA-HONDA-TORNADO', 'Honda', 'Honda XR 250 Tornado 0km', 'Enduro legendario 249cc DOHC. Valor oficial Guía ACARA.', 3346500.00, 5467000.00, 4, 1, 'Guía Oficial de Precios ACARA', 'https://listado.mercadolibre.com.ar/_CustId_3530277724')
ON CONFLICT (sku) DO NOTHING;

-- =============================================================================
-- MÓDULO MERCADO LIBRE ARGENTINA (MLA) - TABLAS DE PERSISTENCIA Y SINCRONIZACIÓN
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 7. TABLA: mercadolibre_config
-- Almacena el estado de la conexión OAuth y tokens oficiales del vendedor.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercadolibre_config (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(50) NOT NULL UNIQUE,
    nickname VARCHAR(100) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type VARCHAR(20) DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'CONECTADO', -- 'CONECTADO', 'DESCONECTADO', 'ERROR'
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. TABLA: mercadolibre_publicaciones
-- Mapeo directo y persistente entre producto local y publicación oficial MLA.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercadolibre_publicaciones (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    ml_item_id VARCHAR(50) NOT NULL UNIQUE, -- Ej: 'MLA1428591044'
    titulo_ml VARCHAR(255) NOT NULL,
    precio_ml NUMERIC(12, 2) NOT NULL,
    stock_ml INT NOT NULL DEFAULT 0,
    estado_ml VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'closed'
    permalink VARCHAR(255) NOT NULL,
    categoria_id VARCHAR(50) NOT NULL,
    ultima_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_pub_producto ON mercadolibre_publicaciones(producto_id);
CREATE INDEX idx_ml_pub_item_id ON mercadolibre_publicaciones(ml_item_id);

-- -----------------------------------------------------------------------------
-- 9. TABLA: mercadolibre_stock_log
-- Auditoría y trazabilidad completa de variaciones de stock físico vs Mercado Libre.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercadolibre_stock_log (
    id SERIAL PRIMARY KEY,
    producto_id INT REFERENCES productos(id) ON DELETE SET NULL,
    sku VARCHAR(60) NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    origen_cambio VARCHAR(50) NOT NULL, -- 'VENTA_WEB', 'VENTA_TALLER', 'MERCADOLIBRE', 'AJUSTE_ETL'
    resultado_sync VARCHAR(30) NOT NULL DEFAULT 'EXITOSO',
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_stock_sku ON mercadolibre_stock_log(sku);
CREATE INDEX idx_ml_stock_fecha ON mercadolibre_stock_log(fecha_movimiento);

-- -----------------------------------------------------------------------------
-- 10. TABLA: mercadolibre_sync_log
-- Registro de eventos y diagnósticos técnicos de sincronización.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercadolibre_sync_log (
    id SERIAL PRIMARY KEY,
    tipo_proceso VARCHAR(50) NOT NULL, -- 'STOCK_SYNC', 'PRICE_SYNC', 'BULK_IMPORT', 'WEBHOOK_EVENT'
    detalle TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'WARNING', 'ERROR'
    duracion_ms INT DEFAULT 0,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_sync_fecha ON mercadolibre_sync_log(fecha_registro);

-- -----------------------------------------------------------------------------
-- 11. TABLA: mercadolibre_webhook_events
-- Control de idempotencia para notificaciones IPN oficiales de Mercado Libre.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercadolibre_webhook_events (
    id SERIAL PRIMARY KEY,
    evento_id VARCHAR(100) NOT NULL UNIQUE,
    topic VARCHAR(50) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    payload JSONB,
    procesado BOOLEAN DEFAULT TRUE,
    fecha_recepcion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_webhook_topic ON mercadolibre_webhook_events(topic);

-- =============================================================================
-- SECCIÓN V: MATRIZ RELACIONAL DE COMPATIBILIDAD VEHICULAR REAL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 12. TABLA: vehicle_types
-- Tipos de vehículos (Motos, Autos, Pick-ups, Camiones).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 13. TABLA: vehicle_makes
-- Marcas de vehículos (Honda, Yamaha, Toyota, Volkswagen, etc.).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_makes (
    id SERIAL PRIMARY KEY,
    vehicle_type_id INT REFERENCES vehicle_types(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(100) DEFAULT 'BASE_INTERNA_VERIFICADA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_makes_type ON vehicle_makes(vehicle_type_id);
CREATE INDEX idx_makes_slug ON vehicle_makes(slug);

-- -----------------------------------------------------------------------------
-- 14. TABLA: vehicle_models
-- Modelos de vehículos (CG Titan, Hilux, Gol Trend, Corsa, etc.).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_models (
    id SERIAL PRIMARY KEY,
    vehicle_make_id INT REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    vehicle_type_id INT REFERENCES vehicle_types(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(100) DEFAULT 'BASE_INTERNA_VERIFICADA',
    external_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_models_make ON vehicle_models(vehicle_make_id);
CREATE INDEX idx_models_type ON vehicle_models(vehicle_type_id);

-- -----------------------------------------------------------------------------
-- 15. TABLA: vehicle_versions
-- Versiones, motorizaciones y generaciones concretas.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_versions (
    id SERIAL PRIMARY KEY,
    vehicle_model_id INT REFERENCES vehicle_models(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    year_from INT NOT NULL,
    year_to INT NOT NULL,
    engine_code VARCHAR(100),
    engine_displacement VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    body_type VARCHAR(50),
    external_id VARCHAR(100),
    source VARCHAR(100) DEFAULT 'CATÁLOGO_TÉCNICO',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_versions_model ON vehicle_versions(vehicle_model_id);
CREATE INDEX idx_versions_years ON vehicle_versions(year_from, year_to);

-- -----------------------------------------------------------------------------
-- 16. TABLA: vehicles
-- Configuración técnica individualizada de vehículo.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_type_id INT REFERENCES vehicle_types(id),
    make_id INT REFERENCES vehicle_makes(id),
    model_id INT REFERENCES vehicle_models(id),
    version_id INT REFERENCES vehicle_versions(id),
    year INT NOT NULL,
    engine_code VARCHAR(100),
    engine_displacement VARCHAR(50),
    fuel_type VARCHAR(50),
    source VARCHAR(100) DEFAULT 'BASE_INTERNA_VERIFICADA',
    external_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_vehicles_lookup ON vehicles(make_id, model_id, version_id, year);

-- -----------------------------------------------------------------------------
-- 17. TABLA: product_vehicle_compatibility
-- Matriz Many-to-Many de compatibilidad real con auditoría de origen.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_vehicle_compatibility (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES productos(id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
    compatibility_type VARCHAR(50) DEFAULT 'EXACTA', -- 'EXACTA', 'MODELO', 'GENERACIÓN', 'VERSIÓN', 'MOTOR', 'AÑO', 'UNIVERSAL', 'REQUIERE_VERIFICACIÓN'
    position VARCHAR(100),
    notes TEXT,
    source VARCHAR(100) NOT NULL, -- 'FABRICANTE', 'DISTRIBUIDOR_OFICIAL', 'CATÁLOGO_TÉCNICO', 'MERCADO_LIBRE', 'BASE_INTERNA_VERIFICADA'
    source_reference VARCHAR(255),
    confidence NUMERIC(3, 2) DEFAULT 1.0,
    verified BOOLEAN DEFAULT TRUE,
    verified_by VARCHAR(150),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_prod_veh UNIQUE (product_id, vehicle_id)
);

CREATE INDEX idx_comp_product ON product_vehicle_compatibility(product_id);
CREATE INDEX idx_comp_vehicle ON product_vehicle_compatibility(vehicle_id);
CREATE INDEX idx_comp_verified ON product_vehicle_compatibility(verified);

-- -----------------------------------------------------------------------------
-- 18. TABLA: product_oem_references
-- Códigos originales de fábrica y referencias técnicas de catálogo.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_oem_references (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES productos(id) ON DELETE CASCADE,
    manufacturer VARCHAR(150) NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- 'OEM', 'EQUIVALENCIA', 'SKU', 'PART_NUMBER', 'CÓDIGO_FABRICANTE'
    reference_code VARCHAR(150) NOT NULL,
    source VARCHAR(100) DEFAULT 'FABRICANTE',
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oem_code ON product_oem_references(reference_code);
CREATE INDEX idx_oem_product ON product_oem_references(product_id);

-- -----------------------------------------------------------------------------
-- 19. TABLA: vehicle_plate_cache
-- Caché técnico indexado por hash seguro para búsquedas por dominio (sin datos personales).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_plate_cache (
    id SERIAL PRIMARY KEY,
    plate_hash VARCHAR(64) NOT NULL UNIQUE,
    vehicle_id INT REFERENCES vehicles(id),
    make_name VARCHAR(100),
    model_name VARCHAR(100),
    version_name VARCHAR(100),
    year INT,
    engine VARCHAR(100),
    provider VARCHAR(100) DEFAULT 'INTERNAL_CACHE',
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_plate_hash ON vehicle_plate_cache(plate_hash);



