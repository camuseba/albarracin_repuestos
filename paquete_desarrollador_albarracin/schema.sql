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

