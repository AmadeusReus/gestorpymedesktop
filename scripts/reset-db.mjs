/**
 * Reset Database - Limpia e Inicializa la BD Existente
 *
 * Útil cuando la BD ya existe pero quieres:
 * - Eliminar todas las tablas
 * - Recrear el schema desde cero
 * - Insertar datos de prueba nuevamente
 *
 * Ejecutar con: node reset-db.mjs
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

async function resetDatabase() {
  header('🔄 RESET DATABASE - GestorPyME')

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gestorpyme'
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
    `)

    for (const row of tablesResult.rows) {
      await pool.query(`DROP TABLE IF EXISTS ${row.table_name} CASCADE`)
      console.log(`  ✓ Tabla '${row.table_name}' eliminada`)
    }

    success('Todas las tablas eliminadas')

    console.log('\n📝 Ejecutando init-database.sql...')
    const sqlPath = path.join(__dirname, 'init-database.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    await pool.query(sql)
    success('Schema recreado')

    await pool.end()

    header('✅ RESET COMPLETADO')

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
    rl.close()
    process.exit(1)
  }
}

resetDatabase()
