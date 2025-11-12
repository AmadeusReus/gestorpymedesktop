/**
 * Setup Wizard Interactivo
 *
 * Guía paso a paso para:
 * 1. Verificar PostgreSQL
 * 2. Crear la base de datos
 * 3. Inicializar el schema
 * 4. Ejecutar pruebas
 *
 * Ejecutar con: node setup-wizard.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'
import readline from 'readline'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { Pool } = require('pg')
const execAsync = promisify(exec)

// ============================================================
// UTILIDADES
// ============================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (q) => new Promise((resolve) => rl.question(q, resolve))

function clearScreen() {
  console.clear()
}

function header(title) {
  console.log('\n' + '='.repeat(70))
  console.log(title)
  console.log('='.repeat(70) + '\n')
}

function section(title) {
  console.log('\n' + title)
  console.log('-'.repeat(70))
}

function success(msg) {
  console.log(`✅ ${msg}`)
}

function error(msg) {
  console.log(`❌ ${msg}`)
}

function info(msg) {
  console.log(`ℹ️  ${msg}`)
}

function warning(msg) {
  console.log(`⚠️  ${msg}`)
}

// ============================================================
// PASOS DEL SETUP
// ============================================================

async function step1_Bienvenida() {
  clearScreen()
  header('👋 BIENVENIDO AL SETUP DE GestorPyME')

  console.log(`
Este asistente te guiará para:
  1. Verificar PostgreSQL
  2. Crear la base de datos
  3. Inicializar el schema
  4. Ejecutar pruebas

Todo lo que necesitas es tener PostgreSQL corriendo.
  `)

  await question('Presiona ENTER para continuar...')
}

async function step2_PostgreSQL() {
  clearScreen()
  header('📡 VERIFICAR POSTGRESQL')

  section('Verificando conexión a PostgreSQL...')

  // Credenciales por defecto
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  }

  console.log(`
Intentando conectar a:
  Host:     ${dbConfig.host}
  Puerto:   ${dbConfig.port}
  Usuario:  ${dbConfig.user}
  `)

  try {
    const pool = new Pool(dbConfig)
    const result = await pool.query('SELECT NOW()')
    await pool.end()
    success(`PostgreSQL está corriendo (${result.rows[0].now})`)
    return true
  } catch (err) {
    error('No se pudo conectar a PostgreSQL')
    console.log(`\nError: ${err.message}`)
    console.log(`\nSoluciones:`)
    console.log(`  1. Si usas Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`)
    console.log(`  2. Si PostgreSQL está en otro puerto: actualiza .env (DB_PORT=5433, etc.)`)
    console.log(`  3. Si no existe el usuario: asegúrate de crear un usuario en PostgreSQL`)

    const retry = await question('\n¿Intentar de nuevo? (s/n): ')
    if (retry.toLowerCase() === 's') {
      return await step2_PostgreSQL()
    }
    return false
  }
}

async function step3_BD() {
  clearScreen()
  header('🗄️  VERIFICAR BASE DE DATOS')

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  }

  const dbName = process.env.DB_NAME || 'gestorpyme'

  section(`Verificando si la base de datos '${dbName}' existe...`)

  try {
    const pool = new Pool(dbConfig)

    // Verificar si existe
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    )

    if (result.rowCount > 0) {
      success(`La base de datos '${dbName}' ya existe`)

      console.log(`\nOpciones:`)
      console.log(`  1. Mantener la BD actual (solo inicializar schema)`)
      console.log(`  2. Eliminar y recrear todo (empezar en ceros)`)

      const choice = await question(`\n¿Qué deseas hacer? (1/2): `)

      if (choice === '2') {
        console.log(`\nEliminando '${dbName}'...`)
        // Desconectar todas las conexiones
        await pool.query(
          `SELECT pg_terminate_backend(pg_stat_activity.pid)
           FROM pg_stat_activity
           WHERE pg_stat_activity.datname = $1`,
          [dbName]
        )
        await pool.query(`DROP DATABASE "${dbName}"`)
        success(`'${dbName}' eliminado`)

        // Crear la BD nueva
        console.log(`\nCreando base de datos '${dbName}'...`)
        await pool.query(`CREATE DATABASE "${dbName}"`)
        success(`Base de datos '${dbName}' creado`)
      } else {
        info('Se mantendrá la base de datos existente')
      }
    } else {
      // Crear la BD
      console.log(`\nCreando base de datos '${dbName}'...`)
      await pool.query(`CREATE DATABASE "${dbName}"`)
      success(`Base de datos '${dbName}' creado`)
    }

    await pool.end()
    return true
  } catch (err) {
    error(`Error: ${err.message}`)

    const retry = await question('\n¿Intentar de nuevo? (s/n): ')
    if (retry.toLowerCase() === 's') {
      return await step3_BD()
    }
    return false
  }
}

async function step4_Env() {
  clearScreen()
  header('⚙️  CONFIGURAR ARCHIVO .ENV')

  section('Verificando archivo .env...')

  const envPath = path.join(__dirname, '.env')

  if (fs.existsSync(envPath)) {
    success('Archivo .env existe')
    console.log('\nContenido:')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    console.log(envContent)

    const overwrite = await question(
      '\n¿Deseas cambiar la configuración? (s/n): '
    )

    if (overwrite.toLowerCase() !== 's') {
      return true
    }
  }

  console.log(
    '\nIngresa los parámetros de conexión a PostgreSQL:'
  )

  const host = await question('DB_HOST (default: localhost): ')
  const port = await question('DB_PORT (default: 5432): ')
  const user = await question('DB_USER (default: postgres): ')
  const password = await question('DB_PASSWORD (default: postgres): ')
  const name = await question('DB_NAME (default: gestorpyme): ')

  const envContent = `DB_HOST=${host || 'localhost'}
DB_PORT=${port || '5432'}
DB_USER=${user || 'postgres'}
DB_PASSWORD=${password || 'postgres'}
DB_NAME=${name || 'gestorpyme'}
`

  fs.writeFileSync(envPath, envContent)
  success('Archivo .env guardado')

  return true
}

async function step5_Init() {
  clearScreen()
  header('🔄 INICIALIZAR SCHEMA Y DATOS')

  section('Preparando para inicializar...')

  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'gestorpyme'
    }

    const pool = new Pool(dbConfig)

    // Verificar si hay tablas existentes
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public'
    `)

    const hasExistingTables = tablesResult.rows[0].count > 0

    if (hasExistingTables) {
      warning(`La base de datos ya contiene tablas`)

      console.log(`\nOpciones:`)
      console.log(`  1. Mantener schema y datos existentes`)
      console.log(`  2. Eliminar todo y reinicializar (empezar en ceros)`)

      const choice = await question(`\n¿Qué deseas hacer? (1/2): `)

      if (choice === '2') {
        console.log(`\nEliminando todas las tablas y recreando schema...`)
      } else {
        info('Se mantiene el schema existente')
        await pool.end()
        return true
      }
    }

    console.log(`\nEjecutando init-database.sql...`)
    const sqlPath = path.join(__dirname, 'init-database.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    await pool.query(sql)
    await pool.end()

    success('Schema y datos inicializados correctamente')

    return true
  } catch (err) {
    error(`Error: ${err.message}`)

    const retry = await question('\n¿Reintentar? (s/n): ')
    if (retry.toLowerCase() === 's') {
      return await step5_Init()
    }
    return false
  }
}

async function step6_Resumen() {
  clearScreen()
  header('✅ SETUP COMPLETADO')

  console.log(`
¡Tu base de datos está lista para pruebas!

👤 Usuarios disponibles:
  admin       | Contraseña: admin123       | Rol: administrador
  empleado1   | Contraseña: empleado123    | Rol: empleado
  empleado2   | Contraseña: empleado123    | Rol: empleado
  supervisor  | Contraseña: supervisor123  | Rol: supervisor
  inactivo    | Contraseña: admin123       | Rol: empleado (INACTIVO)

🏢 Negocios:
  1: Farmacia Test
  2: Farmacia Central

🧪 Próximos pasos:

  1. Ejecutar pruebas de autenticación:
     node run-tests.mjs auth

  2. Ejecutar pruebas de turnos:
     node run-tests.mjs turno

  3. Ejecutar todas las pruebas:
     node run-tests.mjs all

  4. Iniciar la aplicación en desarrollo:
     npm run dev
  `)

  await question('\nPresiona ENTER para salir...')
}

// ============================================================
// FLUJO PRINCIPAL
// ============================================================

async function main() {
  try {
    // Paso 1: Bienvenida
    await step1_Bienvenida()

    // Paso 2: Verificar PostgreSQL
    if (!(await step2_PostgreSQL())) {
      error('No se pudo conectar a PostgreSQL. Abortar.')
      process.exit(1)
    }

    // Paso 3: Crear/verificar BD
    if (!(await step3_BD())) {
      error('Error al crear la base de datos. Abortar.')
      process.exit(1)
    }

    // Paso 4: Configurar .env
    if (!(await step4_Env())) {
      error('Error al configurar .env. Abortar.')
      process.exit(1)
    }

    // Paso 5: Inicializar
    if (!(await step5_Init())) {
      error('Error al inicializar la base de datos. Abortar.')
      process.exit(1)
    }

    // Paso 6: Resumen final
    await step6_Resumen()

    console.log('\n¡Hasta pronto! 👋\n')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error inesperado:', err.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
