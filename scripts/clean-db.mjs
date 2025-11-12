/**
 * Clean Database - Limpia las tablas de la BD actual
 *
 * Elimina TODAS las tablas y reinicia los datos de prueba
 * sin necesidad de renombrar la BD.
 *
 * Ejecutar con: node clean-db.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'
import readline from 'readline'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { Pool } = require('pg')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (q) => new Promise((resolve) => rl.question(q, resolve))

function header(title) {
  console.log('\n' + '='.repeat(70))
  console.log(title)
  console.log('='.repeat(70) + '\n')
}

function success(msg) {
  console.log(`✅ ${msg}`)
}

function error(msg) {
  console.log(`❌ ${msg}`)
}

function warning(msg) {
  console.log(`⚠️  ${msg}`)
}

async function cleanDatabase() {
  header('🧹 LIMPIAR BASE DE DATOS - GestorPyME')

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres'
  }

  console.log(`Configuración:`)
  console.log(`  Host:     ${dbConfig.host}`)
  console.log(`  Puerto:   ${dbConfig.port}`)
  console.log(`  Usuario:  ${dbConfig.user}`)
  console.log(`  BD:       ${dbConfig.database}`)

  warning('⚠️  ADVERTENCIA: Este proceso eliminará TODOS los datos de la BD')

  const confirm = await question('\n¿Estás seguro de que deseas continuar? (s/n): ')

  if (confirm.toLowerCase() !== 's') {
    console.log('\n❌ Operación cancelada')
    rl.close()
    process.exit(0)
  }

  try {
    const pool = new Pool(dbConfig)

    console.log('\n📡 Conectando a PostgreSQL...')
    await pool.query('SELECT NOW()')
    success('Conectado')

    console.log('\n🗑️  Eliminando todas las tablas...')

    // Obtener todas las tablas
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name DESC
    `)

    for (const row of tablesResult.rows) {
      try {
        await pool.query(`DROP TABLE IF EXISTS "${row.table_name}" CASCADE`)
        console.log(`  ✓ Tabla '${row.table_name}' eliminada`)
      } catch (e) {
        console.log(`  ✗ Error eliminando '${row.table_name}': ${e.message}`)
      }
    }

    success('Todas las tablas eliminadas')

    // Crear tablas manualmente
    console.log('\n📝 Recreando schema...')

    const createTableStatements = [
      `CREATE TABLE negocios (
        id SERIAL PRIMARY KEY,
        nombre_negocio TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre_completo TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE miembros (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        rol TEXT NOT NULL CHECK (rol IN ('empleado', 'supervisor', 'administrador')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(usuario_id, negocio_id)
      )`,

      `CREATE TABLE proveedores (
        id SERIAL PRIMARY KEY,
        negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        nombre TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE tipos_gasto (
        id SERIAL PRIMARY KEY,
        negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        nombre TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE tipos_pago_digital (
        id SERIAL PRIMARY KEY,
        negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        nombre TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE dias_contables (
        id SERIAL PRIMARY KEY,
        negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        fecha DATE NOT NULL,
        venta_total_pos DECIMAL(10, 2),
        diferencia_final_dia DECIMAL(10, 2),
        estado TEXT NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'REVISADO')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(negocio_id, fecha)
      )`,

      `CREATE TABLE turnos (
        id SERIAL PRIMARY KEY,
        dia_contable_id INT NOT NULL REFERENCES dias_contables(id) ON DELETE CASCADE,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
        numero_turno INT NOT NULL CHECK (numero_turno IN (1, 2)),
        efectivo_contado_turno DECIMAL(10, 2),
        venta_reportada_pos_turno DECIMAL(10, 2),
        diferencia_calculada_turno DECIMAL(10, 2),
        estado TEXT NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO', 'REVISADO')),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE transacciones (
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
      )`
    ]

    for (const stmt of createTableStatements) {
      await pool.query(stmt)
    }
    success('Tablas creadas')

    // Insertar datos de prueba
    console.log('\n📊 Insertando datos de prueba...')

    await pool.query(`INSERT INTO negocios (nombre_negocio) VALUES ('Farmacia Test'), ('Farmacia Central')`)
    console.log(`  ✓ Negocios insertados`)

    await pool.query(`
      INSERT INTO usuarios (nombre_completo, username, password_hash, activo) VALUES
        ('Admin User', 'admin', '$2b$12$a1ltcoJlfXoJ2.wTdeQAJOWloZqa7lymGSlpp4n5ShJULakL5RSdO', TRUE),
        ('Empleado Uno', 'empleado1', '$2b$12$ROJcNZVdO8rt6uh2YreRv.ln6GoY11VY88.ozpDNI2zqni5Bu8xyO', TRUE),
        ('Empleado Dos', 'empleado2', '$2b$12$ROJcNZVdO8rt6uh2YreRv.ln6GoY11VY88.ozpDNI2zqni5Bu8xyO', TRUE),
        ('Supervisor Test', 'supervisor', '$2b$12$J7wzhVP/cQ05LiNQ0U8/VOyMkJw3duASOp.EznA7lfGW64FbBA7Su', TRUE),
        ('Usuario Inactivo', 'inactivo', '$2b$12$a1ltcoJlfXoJ2.wTdeQAJOWloZqa7lymGSlpp4n5ShJULakL5RSdO', FALSE)
    `)
    console.log(`  ✓ Usuarios insertados`)

    await pool.query(`
      INSERT INTO miembros (usuario_id, negocio_id, rol) VALUES
        (1, 1, 'administrador'),
        (2, 1, 'empleado'),
        (3, 1, 'empleado'),
        (4, 1, 'supervisor'),
        (5, 1, 'empleado'),
        (1, 2, 'administrador')
    `)
    console.log(`  ✓ Miembros insertados`)

    await pool.query(`
      INSERT INTO proveedores (negocio_id, nombre, activo) VALUES
        (1, 'Proveedor A', TRUE),
        (1, 'Proveedor B', TRUE),
        (2, 'Proveedor C', TRUE)
    `)
    console.log(`  ✓ Proveedores insertados`)

    await pool.query(`
      INSERT INTO tipos_gasto (negocio_id, nombre, activo) VALUES
        (1, 'Arriendo', TRUE),
        (1, 'Servicios', TRUE),
        (1, 'Personal', TRUE),
        (1, 'Mantenimiento', TRUE),
        (2, 'Arriendo', TRUE),
        (2, 'Servicios', TRUE)
    `)
    console.log(`  ✓ Tipos de gasto insertados`)

    await pool.query(`
      INSERT INTO tipos_pago_digital (negocio_id, nombre, activo) VALUES
        (1, 'Nequi', TRUE),
        (1, 'Bancolombia', TRUE),
        (1, 'Daviplata', TRUE),
        (2, 'Nequi', TRUE),
        (2, 'Efecty', TRUE)
    `)
    console.log(`  ✓ Tipos de pago digital insertados`)

    success('Datos de prueba insertados')

    await pool.end()

    header('✅ LIMPIEZA COMPLETADA')

    console.log(`
👤 Usuarios disponibles:
  admin       | Contraseña: admin123       | Rol: administrador
  empleado1   | Contraseña: empleado123    | Rol: empleado
  empleado2   | Contraseña: empleado123    | Rol: empleado
  supervisor  | Contraseña: supervisor123  | Rol: supervisor
  inactivo    | Contraseña: admin123       | Rol: empleado (INACTIVO)

🏢 Negocios:
  1: Farmacia Test
  2: Farmacia Central

🧪 Próximo paso:
  node run-tests.mjs all
    `)

    rl.close()
    process.exit(0)
  } catch (err) {
    error(`Error: ${err.message}`)
    console.error(err)
    rl.close()
    process.exit(1)
  }
}

cleanDatabase()
