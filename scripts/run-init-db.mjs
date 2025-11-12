/**
 * Script para Inicializar la Base de Datos
 *
 * Este script ejecuta el archivo init-database.sql en PostgreSQL.
 * Es más fácil que hacerlo manualmente desde psql.
 *
 * Ejecutar con: node run-init-db.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { Pool } = require('pg')

// ============================================================
// VALIDAR CONFIGURACIÓN
// ============================================================

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('Asegúrate de configurar el archivo .env con:')
  console.error('  DB_HOST=localhost')
  console.error('  DB_PORT=5432')
  console.error('  DB_USER=tu_usuario')
  console.error('  DB_PASSWORD=tu_contraseña')
  console.error('  DB_NAME=gestorpyme')
  process.exit(1)
}

// ============================================================
// EJECUTAR INICIALIZACIÓN
// ============================================================

async function initDatabase() {
  console.log('\n' + '='.repeat(70))
  console.log('🗄️  INICIALIZADOR DE BASE DE DATOS - GestorPyME')
  console.log('='.repeat(70) + '\n')

  console.log('📋 Configuración:')
  console.log(`  Host:     ${dbConfig.host}`)
  console.log(`  Puerto:   ${dbConfig.port}`)
  console.log(`  Usuario:  ${dbConfig.user}`)
  console.log(`  Base de datos: ${dbConfig.database}`)
  console.log()

  // Conectar
  console.log('📡 Conectando a PostgreSQL...')
  const pool = new Pool(dbConfig)

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'init-database.sql')
    console.log(`📂 Leyendo script: ${sqlPath}`)

    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Error: No se encontró el archivo ${sqlPath}`)
      process.exit(1)
    }

    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Ejecutar el script
    console.log('\n⏳ Ejecutando script SQL...\n')
    await pool.query(sql)

    console.log('\n' + '='.repeat(70))
    console.log('✅ ¡Base de datos inicializada correctamente!')
    console.log('='.repeat(70) + '\n')

    console.log('👤 Usuarios de Prueba:')
    console.log('   admin       | Contraseña: admin123       | Rol: administrador')
    console.log('   empleado1   | Contraseña: empleado123    | Rol: empleado')
    console.log('   empleado2   | Contraseña: empleado123    | Rol: empleado')
    console.log('   supervisor  | Contraseña: supervisor123  | Rol: supervisor')
    console.log('   inactivo    | Contraseña: admin123       | Rol: empleado (INACTIVO)')
    console.log()

    console.log('🏢 Negocios:')
    console.log('   1: Farmacia Test')
    console.log('   2: Farmacia Central')
    console.log()

    console.log('🧪 Próximo paso: Ejecuta las pruebas')
    console.log('   node run-tests.mjs all')
    console.log()
  } catch (error) {
    console.error('\n❌ Error al ejecutar el script SQL:')
    console.error(error.message)
    console.error()
    console.error('Soluciones comunes:')
    console.error('  1. Verifica que PostgreSQL está corriendo')
    console.error('  2. Verifica las credenciales en .env')
    console.error('  3. Verifica que la base de datos existe')
    console.error()

    process.exit(1)
  } finally {
    await pool.end()
  }
}

initDatabase()
