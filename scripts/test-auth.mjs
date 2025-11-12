/**
 * Script de Pruebas para Autenticación (Sin Electron)
 *
 * Simula las llamadas IPC directamente para testear login.
 * Ejecutar con: node test-auth.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'

// ============================================================
// 1. SETUP DE DATABASE
// ============================================================

const require = createRequire(import.meta.url)
const { Pool } = require('pg')
const bcryptjs = require('bcryptjs')

let pool = null

const getPool = () => {
  if (pool) return pool

  const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }

  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('❌ Error: Faltan variables de entorno')
    throw new Error('Configuración incompleta')
  }

  console.log(`📡 Conectando a PostgreSQL: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`)
  pool = new Pool(dbConfig)
  return pool
}

const query = async (text, params = []) => {
  const poolInst = getPool()
  try {
    const start = Date.now()
    const res = await poolInst.query(text, params)
    const duration = Date.now() - start
    console.log(`  [DB] Ejecutada en ${duration}ms (${res.rowCount} filas)`)
    return res
  } catch (error) {
    console.error(`  ❌ [DB Error] ${error.message}`)
    throw error
  }
}

// ============================================================
// 2. FUNCIONES DE SEGURIDAD
// ============================================================

async function verifyPassword(password, hash) {
  return await bcryptjs.compare(password, hash)
}

// ============================================================
// 3. REPOSITORIO (USER)
// ============================================================

async function findUserByUsername(username) {
  console.log(`  🔍 Buscando usuario: ${username}`)
  const res = await query(
    'SELECT id, username, nombre_completo, password_hash, activo FROM usuarios WHERE username = $1',
    [username]
  )
  return res.rowCount > 0 ? res.rows[0] : null
}

async function findMemberByUserId(userId) {
  console.log(`  🔍 Buscando pertenencia de usuario ID: ${userId}`)
  const res = await query(
    'SELECT id, usuario_id, negocio_id, rol FROM miembros WHERE usuario_id = $1',
    [userId]
  )
  return res.rowCount > 0 ? res.rows[0] : null
}

// ============================================================
// 4. SERVICIO DE AUTENTICACIÓN
// ============================================================

async function authenticateUser(username, password) {
  console.log(`[AuthService] Autenticando usuario: ${username}`)

  try {
    // 1. Buscar usuario
    const userRecord = await findUserByUsername(username)

    if (!userRecord) {
      console.warn(`  ❌ Usuario no encontrado`)
      return { success: false, error: 'Credenciales incorrectas.' }
    }

    // 2. Verificar si está activo
    if (!userRecord.activo) {
      console.warn(`  ❌ Usuario inactivo`)
      return { success: false, error: 'Esta cuenta ha sido desactivada.' }
    }

    // 3. Verificar contraseña
    console.log(`  🔐 Verificando contraseña...`)
    const isValidPassword = await verifyPassword(password, userRecord.password_hash)

    if (!isValidPassword) {
      console.warn(`  ❌ Contraseña incorrecta`)
      return { success: false, error: 'Credenciales incorrectas.' }
    }

    // 4. Obtener rol y negocio
    const memberRecord = await findMemberByUserId(userRecord.id)

    if (!memberRecord) {
      console.error(`  ❌ Usuario no asignado a ningún negocio`)
      return { success: false, error: 'Usuario válido pero no asignado a un negocio.' }
    }

    // 5. Éxito
    console.log(`  ✅ Login exitoso | Rol: ${memberRecord.rol}`)

    return {
      success: true,
      user: {
        id: userRecord.id,
        username: userRecord.username,
        nombreCompleto: userRecord.nombre_completo,
        rol: memberRecord.rol,
        negocioId: memberRecord.negocio_id
      }
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message)
    return { success: false, error: 'Error del servidor. Verifique la conexión a la base de datos.' }
  }
}

// ============================================================
// 5. CASOS DE PRUEBA
// ============================================================

async function runTests() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 SUITE DE PRUEBAS: AUTENTICACIÓN')
  console.log('='.repeat(70))

  try {
    // TEST 1: Login con credenciales correctas
    console.log('\n\n📌 TEST 1: Login con credenciales válidas')
    console.log('-'.repeat(70))
    const test1 = await authenticateUser('admin', 'admin123')
    console.log(`Resultado:`, JSON.stringify(test1, null, 2))

    // TEST 2: Login con contraseña incorrecta
    console.log('\n\n📌 TEST 2: Login con contraseña incorrecta')
    console.log('-'.repeat(70))
    const test2 = await authenticateUser('admin', 'contraseña_incorrecta')
    console.log(`Resultado:`, JSON.stringify(test2, null, 2))

    // TEST 3: Login con usuario inexistente
    console.log('\n\n📌 TEST 3: Login con usuario inexistente')
    console.log('-'.repeat(70))
    const test3 = await authenticateUser('usuario_fantasma', 'password123')
    console.log(`Resultado:`, JSON.stringify(test3, null, 2))

    // TEST 4: Login con otro usuario (si existe)
    console.log('\n\n📌 TEST 4: Login con usuario empleado')
    console.log('-'.repeat(70))
    const test4 = await authenticateUser('empleado1', 'empleado123')
    console.log(`Resultado:`, JSON.stringify(test4, null, 2))

    console.log('\n' + '='.repeat(70))
    console.log('✅ PRUEBAS COMPLETADAS')
    console.log('='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error)
  } finally {
    if (pool) {
      await pool.end()
      console.log('📴 Conexión a base de datos cerrada')
    }
    process.exit(0)
  }
}

// ============================================================
// EJECUTAR
// ============================================================

runTests()
