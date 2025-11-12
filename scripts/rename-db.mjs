/**
 * Rename Database - Renombra BD de 'postgres' a 'gestorpyme'
 *
 * Ejecutar con: node rename-db.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'
import readline from 'readline'

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

async function renameDatabase() {
  header('🔄 RENOMBRAR BASE DE DATOS')

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  }

  console.log(`Renombrando BD: postgres → gestorpyme\n`)

  try {
    // Conectar a la BD de sistema (postgres)
    const pool = new Pool({
      ...dbConfig,
      database: 'postgres'
    })

    console.log('📡 Conectando a PostgreSQL...')
    await pool.query('SELECT NOW()')
    success('Conectado')

    // Verificar si 'gestorpyme' ya existe
    console.log('\n🔍 Verificando si la BD "gestorpyme" ya existe...')
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      ['gestorpyme']
    )

    if (checkResult.rowCount > 0) {
      error('La BD "gestorpyme" ya existe')
      console.log('\n¿Deseas eliminarla?')
      const confirm = await question('Escribir "si" para confirmar: ')

      if (confirm.toLowerCase() === 'si') {
        console.log('\n🗑️  Eliminando "gestorpyme"...')
        // Desconectar todas las conexiones
        await pool.query(
          `SELECT pg_terminate_backend(pg_stat_activity.pid)
           FROM pg_stat_activity
           WHERE pg_stat_activity.datname = $1`,
          ['gestorpyme']
        )
        await pool.query('DROP DATABASE IF EXISTS "gestorpyme"')
        success('BD "gestorpyme" eliminada')
      } else {
        error('Operación cancelada')
        await pool.end()
        rl.close()
        process.exit(0)
      }
    }

    // Desconectar todas las conexiones a 'postgres'
    console.log('\n📭 Desconectando todas las conexiones a "postgres"...')
    await pool.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
       FROM pg_stat_activity
       WHERE pg_stat_activity.datname = 'postgres' AND pid <> pg_backend_pid()`
    )
    success('Conexiones terminadas')

    // Cerrar nuestra propia conexión
    await pool.end()

    // Conectar nuevamente a 'template1' (no a 'postgres')
    console.log('\n📡 Reconectando para renombrar...')
    const pool2 = new Pool({
      ...dbConfig,
      database: 'template1'
    })

    // Renombrar 'postgres' a 'gestorpyme'
    console.log('\n🔄 Renombrando BD...')
    await pool2.query('ALTER DATABASE postgres RENAME TO "gestorpyme"')
    success('BD renombrada: postgres → gestorpyme')

    await pool2.end()

    header('✅ RENOMBRAMIENTO COMPLETADO')

    console.log(`
La base de datos ha sido renombrada exitosamente.

Configuración en .env:
  DB_NAME=gestorpyme ✅

Próximo paso:
  node reset-db.mjs

O directamente prueba:
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

renameDatabase()
