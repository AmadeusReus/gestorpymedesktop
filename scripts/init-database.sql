/**
 * SCRIPT DE INICIALIZACIÓN - GestorPyME Desktop
 *
 * Este script:
 * 1. Elimina las tablas existentes (para empezar en ceros)
 * 2. Crea el schema completo
 * 3. Inserta datos de prueba
 *
 * IMPORTANTE: Este script es destructivo. Usalo solo en desarrollo.
 *
 * Ejecución:
 *   psql -U postgres -d gestorpyme -f init-database.sql
 *   O desde psql:
 *   \i init-database.sql
 */

-- ============================================================
-- PARTE 1: ELIMINAR TABLAS EXISTENTES (EN ORDEN INVERSO)
-- ============================================================

DROP TABLE IF EXISTS transacciones CASCADE;
DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS dias_contables CASCADE;
DROP TABLE IF EXISTS tipos_pago_digital CASCADE;
DROP TABLE IF EXISTS tipos_gasto CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS miembros CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS negocios CASCADE;

-- ============================================================
-- PARTE 2: CREAR TABLAS (EN ORDEN CORRECTO)
-- ============================================================

-- Tabla: Negocios
CREATE TABLE negocios (
  id SERIAL PRIMARY KEY,
  nombre_negocio TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Usuarios (Credenciales)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Miembros (Usuario + Negocio + Rol)
CREATE TABLE miembros (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  rol TEXT NOT NULL CHECK (rol IN ('empleado', 'supervisor', 'administrador')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, negocio_id)
);

-- Tabla: Proveedores
CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Tipos de Gasto
CREATE TABLE tipos_gasto (
  id SERIAL PRIMARY KEY,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Tipos de Pago Digital
CREATE TABLE tipos_pago_digital (
  id SERIAL PRIMARY KEY,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Días Contables
CREATE TABLE dias_contables (
  id SERIAL PRIMARY KEY,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  venta_total_pos DECIMAL(10, 2),
  diferencia_final_dia DECIMAL(10, 2),
  estado TEXT NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'REVISADO')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(negocio_id, fecha)
);

-- Tabla: Turnos
CREATE TABLE turnos (
  id SERIAL PRIMARY KEY,
  dia_contable_id INT NOT NULL REFERENCES dias_contables(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  numero_turno INT NOT NULL CHECK (numero_turno IN (1, 2)),
  efectivo_contado_turno DECIMAL(10, 2),
  venta_reportada_pos_turno DECIMAL(10, 2),
  diferencia_calculada_turno DECIMAL(10, 2),
  estado TEXT NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO', 'REVISADO')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Transacciones
CREATE TABLE transacciones (
  id SERIAL PRIMARY KEY,
  turno_id INT REFERENCES turnos(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('PAGO_DIGITAL', 'GASTO_CAJA', 'COMPRA_PROV', 'GASTO_GENERAL', 'AJUSTE_CAJA')),
  concepto TEXT,
  proveedor_id INT REFERENCES proveedores(id) ON DELETE SET NULL,
  tipo_gasto_id INT REFERENCES tipos_gasto(id) ON DELETE SET NULL,
  tipo_pago_digital_id INT REFERENCES tipos_pago_digital(id) ON DELETE SET NULL,
  confirmado_auditoria BOOLEAN NOT NULL DEFAULT FALSE,
  auditor_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PARTE 3: INSERTAR DATOS DE PRUEBA
-- ============================================================

-- 3.1 Crear Negocios
INSERT INTO negocios (nombre_negocio) VALUES
  ('Farmacia Test'),
  ('Farmacia Central');

-- 3.2 Crear Usuarios
-- Nota: Los hashes son para las contraseñas mostradas entre comillas
-- admin123: $2b$12$a1ltcoJlfXoJ2.wTdeQAJOWloZqa7lymGSlpp4n5ShJULakL5RSdO
-- empleado123: $2b$12$ROJcNZVdO8rt6uh2YreRv.ln6GoY11VY88.ozpDNI2zqni5Bu8xyO
-- supervisor123: $2b$12$J7wzhVP/cQ05LiNQ0U8/VOyMkJw3duASOp.EznA7lfGW64FbBA7Su

INSERT INTO usuarios (nombre_completo, username, password_hash, activo) VALUES
  ('Admin User', 'admin', '$2b$12$a1ltcoJlfXoJ2.wTdeQAJOWloZqa7lymGSlpp4n5ShJULakL5RSdO', TRUE),
  ('Empleado Uno', 'empleado1', '$2b$12$ROJcNZVdO8rt6uh2YreRv.ln6GoY11VY88.ozpDNI2zqni5Bu8xyO', TRUE),
  ('Empleado Dos', 'empleado2', '$2b$12$ROJcNZVdO8rt6uh2YreRv.ln6GoY11VY88.ozpDNI2zqni5Bu8xyO', TRUE),
  ('Supervisor Test', 'supervisor', '$2b$12$J7wzhVP/cQ05LiNQ0U8/VOyMkJw3duASOp.EznA7lfGW64FbBA7Su', TRUE),
  ('Usuario Inactivo', 'inactivo', '$2b$12$a1ltcoJlfXoJ2.wTdeQAJOWloZqa7lymGSlpp4n5ShJULakL5RSdO', FALSE);

-- 3.3 Asignar Usuarios a Negocios (Miembros)
-- REGLA: Solo admin/dueño puede estar en múltiples negocios
-- Empleados y supervisores solo en UN negocio
INSERT INTO miembros (usuario_id, negocio_id, rol) VALUES
  -- FARMACIA TEST (ID=1)
  (1, 1, 'administrador'),  -- admin → Farmacia Test (dueño)
  (2, 1, 'empleado'),       -- empleado1 → Farmacia Test (llena turnos)
  (3, 1, 'empleado'),       -- empleado2 → Farmacia Test
  (4, 1, 'supervisor'),     -- supervisor → Farmacia Test (revisa días)
  (5, 1, 'empleado'),       -- inactivo → Farmacia Test (pero usuario inactivo)

  -- FARMACIA CENTRAL (ID=2)
  (1, 2, 'administrador');  -- admin → Farmacia Central (dueño - único que tiene 2)

-- 3.4 Crear Proveedores
INSERT INTO proveedores (negocio_id, nombre, activo) VALUES
  (1, 'Proveedor A', TRUE),
  (1, 'Proveedor B', TRUE),
  (2, 'Proveedor C', TRUE);

-- 3.5 Crear Tipos de Gasto
INSERT INTO tipos_gasto (negocio_id, nombre, activo) VALUES
  (1, 'Arriendo', TRUE),
  (1, 'Servicios', TRUE),
  (1, 'Personal', TRUE),
  (1, 'Mantenimiento', TRUE),
  (2, 'Arriendo', TRUE),
  (2, 'Servicios', TRUE);

-- 3.6 Crear Tipos de Pago Digital
INSERT INTO tipos_pago_digital (negocio_id, nombre, activo) VALUES
  (1, 'Nequi', TRUE),
  (1, 'Bancolombia', TRUE),
  (1, 'Daviplata', TRUE),
  (2, 'Nequi', TRUE),
  (2, 'Efecty', TRUE);

-- ============================================================
-- PARTE 4: MENSAJES DE CONFIRMACIÓN
-- ============================================================

\echo '✅ Base de datos inicializada correctamente'
\echo ''
\echo '📊 Datos creados:'
\echo '   - Negocios: 2'
\echo '   - Usuarios: 5 (1 inactivo)'
\echo '   - Miembros: 7'
\echo '   - Proveedores: 3'
\echo '   - Tipos de Gasto: 6'
\echo '   - Tipos de Pago Digital: 5'
\echo ''
\echo '👤 Usuarios de Prueba:'
\echo '   username: admin         | password: admin123       | rol: administrador'
\echo '   username: empleado1     | password: empleado123    | rol: empleado'
\echo '   username: empleado2     | password: empleado123    | rol: empleado'
\echo '   username: supervisor    | password: supervisor123  | rol: supervisor'
\echo '   username: inactivo      | password: admin123       | rol: empleado (INACTIVO)'
\echo ''
\echo '🏢 Negocios:'
\echo '   ID 1: Farmacia Test'
\echo '   ID 2: Farmacia Central'
