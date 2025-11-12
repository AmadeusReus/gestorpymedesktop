/**
 * Script de Pruebas para Turnos (Sin Electron)
 *
 * Simula las llamadas IPC directamente para testear la lógica del backend.
 * Ejecutar con: node test-turno.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'

// ============================================================
// 1. SIMULACIÓN DE QUERY (DATABASE)
// ============================================================

const require = createRequire(import.meta.url)
const { Pool } = require('pg')

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
    console.error('❌ Error: Faltan variables de entorno (DB_HOST, DB_USER, DB_NAME, etc.)')
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
// 2. HANDLER DE TURNO (Copiado del código real)
// ============================================================

async function handleInitializeTurno(args) {
  const { usuarioId, negocioId } = args
  console.log(`\n[TurnoHandler] Inicializando para usuarioId: ${usuarioId}, negocioId: ${negocioId}`)

  try {
    // Obtener la fecha de hoy
    const today = new Date().toISOString().split('T')[0]
    console.log(`  📅 Fecha de hoy: ${today}`)

    // 1. Encontrar o crear el Día Contable
    console.log(`  🔍 Buscando Día Contable...`)
    let diaContableRes = await query(
      'SELECT id, estado FROM dias_contables WHERE fecha = $1 AND negocio_id = $2',
      [today, negocioId]
    )

    let diaContableId
    let diaEstado

    if (diaContableRes.rowCount === 0) {
      console.log(`  ✨ Creando nuevo Día Contable...`)
      const newDiaRes = await query(
        'INSERT INTO dias_contables (fecha, negocio_id, estado) VALUES ($1, $2, $3) RETURNING id, estado',
        [today, negocioId, 'ABIERTO']
      )
      diaContableId = newDiaRes.rows[0].id
      diaEstado = newDiaRes.rows[0].estado
      console.log(`  ✅ Día Contable creado: ID ${diaContableId}`)
    } else {
      diaContableId = diaContableRes.rows[0].id
      diaEstado = diaContableRes.rows[0].estado
      console.log(`  ✅ Día Contable encontrado: ID ${diaContableId}, Estado: ${diaEstado}`)

      if (diaEstado === 'REVISADO') {
        return { success: false, error: 'El día contable ya fue revisado y cerrado. No se pueden abrir más turnos.' }
      }
    }

    // 2. Determinar qué turno abrir
    console.log(`  🔍 Buscando Turnos existentes...`)
    let turnoRes = await query(
      'SELECT id, usuario_id, numero_turno, estado FROM turnos WHERE dia_contable_id = $1 ORDER BY numero_turno DESC',
      [diaContableId]
    )

    console.log(`  📊 Turnos encontrados: ${turnoRes.rowCount}`)

    let turnoActivo = null
    let nextTurnoNum = 1

    if (turnoRes.rowCount > 0) {
      turnoActivo = turnoRes.rows.find(t => t.estado === 'ABIERTO')

      if (turnoActivo) {
        console.log(`  🔓 Turno ${turnoActivo.numero_turno} está ABIERTO`)
        if (turnoActivo.usuario_id !== usuarioId) {
          console.log(`  ⚠️  Turno pertenece a otro usuario (ID: ${turnoActivo.usuario_id})`)
          return { success: false, error: `El Turno ${turnoActivo.numero_turno} está abierto por otro empleado.` }
        }
      } else {
        console.log(`  ℹ️  No hay turnos ABIERTOS`)
        const lastTurnoNum = turnoRes.rows[0].numero_turno
        nextTurnoNum = lastTurnoNum + 1
        console.log(`  ➡️  Siguiente turno será: ${nextTurnoNum}`)
      }
    }

    // 3. Abrir o devolver el Turno
    if (turnoActivo) {
      console.log(`  ✅ Devolviendo turno activo ${turnoActivo.numero_turno}`)
      return { success: true, turno: turnoActivo }
    } else if (nextTurnoNum <= 2) {
      console.log(`  ✨ Creando Turno ${nextTurnoNum}...`)
      const newTurnoRes = await query(
        `INSERT INTO turnos (dia_contable_id, usuario_id, numero_turno, estado)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [diaContableId, usuarioId, nextTurnoNum, 'ABIERTO']
      )
      console.log(`  ✅ Turno ${nextTurnoNum} creado exitosamente`)
      return { success: true, turno: newTurnoRes.rows[0] }
    } else {
      console.log(`  ❌ Se intenta crear Turno ${nextTurnoNum} (máximo es 2)`)
      return { success: false, error: 'Ya se han cerrado los dos turnos del día. Contacte al supervisor.' }
    }
  } catch (error) {
    console.error(`  ❌ Error en la inicialización:`, error.message)
    return { success: false, error: 'Error interno de la aplicación. No se pudo iniciar el turno.' }
  }
}

// ============================================================
// 3. CASOS DE PRUEBA
// ============================================================

async function runTests() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 SUITE DE PRUEBAS: INICIALIZACIÓN DE TURNOS')
  console.log('='.repeat(70))

  try {
    // TEST 1: Crear Turno 1 para usuario 1
    console.log('\n\n📌 TEST 1: Crear Turno 1 para usuario 1, negocio 1')
    console.log('-'.repeat(70))
    const test1 = await handleInitializeTurno({ usuarioId: 1, negocioId: 1 })
    console.log(`Resultado:`, test1)

    // TEST 2: Intentar crear Turno 1 nuevamente (debería devolver el mismo turno)
    console.log('\n\n📌 TEST 2: Acceder nuevamente con usuario 1 (debería recuperar el turno)')
    console.log('-'.repeat(70))
    const test2 = await handleInitializeTurno({ usuarioId: 1, negocioId: 1 })
    console.log(`Resultado:`, test2)

    // TEST 3: Crear Turno 2 con usuario 2
    console.log('\n\n📌 TEST 3: Crear Turno 2 con usuario 2 (mismo día)')
    console.log('-'.repeat(70))
    const test3 = await handleInitializeTurno({ usuarioId: 2, negocioId: 1 })
    console.log(`Resultado:`, test3)

    // TEST 4: Intentar crear Turno 3 (debería fallar)
    console.log('\n\n📌 TEST 4: Intentar crear Turno 3 con usuario 3 (debería fallar)')
    console.log('-'.repeat(70))
    const test4 = await handleInitializeTurno({ usuarioId: 3, negocioId: 1 })
    console.log(`Resultado:`, test4)

    // TEST 5: Otro usuario intenta usar el Turno 1 abierto (debería fallar)
    console.log('\n\n📌 TEST 5: Usuario 2 intenta acceder a Turno 1 de usuario 1 (debería fallar)')
    console.log('-'.repeat(70))
    const test5 = await handleInitializeTurno({ usuarioId: 2, negocioId: 1 })
    console.log(`Resultado:`, test5)

    console.log('\n' + '='.repeat(70))
    console.log('✅ PRUEBAS COMPLETADAS')
    console.log('='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error)
  } finally {
    // Cerrar conexión
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
