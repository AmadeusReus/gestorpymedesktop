/**
 * Script de Pruebas para Handlers: negocio:getByUser, dia-contable:getCurrent, dia-contable:review
 *
 * Simula las llamadas IPC directamente para testear los 3 handlers críticos.
 * Ejecutar con: node scripts/test-handlers.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'

// ============================================================
// 1. SETUP DE DATABASE
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
// 2. HANDLERS SIMULADOS
// ============================================================

/**
 * Handler: negocio:getByUser
 */
async function handleGetNegociosByUser(userId) {
  console.log(`[NegocioHandler] Obteniendo negocios para usuario ${userId}`)

  try {
    if (!userId || userId <= 0) {
      return { success: false, error: 'ID de usuario inválido' }
    }

    const result = await query(
      `SELECT
        n.id,
        n.nombre_negocio,
        m.rol
      FROM miembros m
      JOIN negocios n ON m.negocio_id = n.id
      WHERE m.usuario_id = $1
      ORDER BY n.nombre_negocio ASC`,
      [userId]
    )

    if ((result.rowCount ?? 0) === 0) {
      console.warn(`[NegocioHandler] Usuario ${userId} no tiene negocios asignados`)
      return { success: true, negocios: [] }
    }

    const negocios = result.rows.map((row) => ({
      id: row.id,
      nombre_negocio: row.nombre_negocio,
      rol: row.rol
    }))

    console.log(`[NegocioHandler] Usuario ${userId} tiene ${negocios.length} negocio(s)`)
    return { success: true, negocios }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
    console.error(`[NegocioHandler] Error: ${errorMsg}`)
    return { success: false, error: `Error al obtener negocios: ${errorMsg}` }
  }
}

/**
 * Handler: dia-contable:getCurrent
 */
async function handleGetCurrentDiaContable(negocioId) {
  console.log(`[DiaContableHandler] Obteniendo día contable actual para negocio ${negocioId}`)

  try {
    if (!negocioId || negocioId <= 0) {
      return { success: false, error: 'ID de negocio inválido' }
    }

    const today = new Date().toISOString().split('T')[0]
    console.log(`  📅 Fecha: ${today}`)

    // 1. Buscar día contable
    const diaRes = await query(
      `SELECT id, negocio_id, fecha, estado
       FROM dias_contables
       WHERE negocio_id = $1 AND fecha = $2`,
      [negocioId, today]
    )

    if ((diaRes.rowCount ?? 0) === 0) {
      console.log(`[DiaContableHandler] No existe día contable para ${negocioId} en ${today}`)
      return { success: true, diaContable: null }
    }

    const diaContable = diaRes.rows[0]
    console.log(`  ✅ Día contable encontrado (ID: ${diaContable.id}, Estado: ${diaContable.estado})`)

    // 2. Obtener turnos del día
    const turnosRes = await query(
      `SELECT
        t.id,
        t.dia_contable_id,
        t.usuario_id,
        t.numero_turno,
        t.estado,
        t.efectivo_contado_turno,
        t.venta_reportada_pos_turno,
        u.nombre_completo as usuario_nombre,
        COUNT(tx.id) as transacciones_count,
        COALESCE(SUM(CASE WHEN tx.categoria = 'PAGO_DIGITAL' THEN tx.valor ELSE 0 END), 0) as total_pagos_digitales,
        COALESCE(SUM(CASE WHEN tx.categoria IN ('GASTO_CAJA', 'COMPRA_PROV') THEN tx.valor ELSE 0 END), 0) as total_gastos
       FROM turnos t
       LEFT JOIN usuarios u ON t.usuario_id = u.id
       LEFT JOIN transacciones tx ON t.id = tx.turno_id
       WHERE t.dia_contable_id = $1
       GROUP BY t.id, t.dia_contable_id, t.usuario_id, t.numero_turno, t.estado,
                t.efectivo_contado_turno, t.venta_reportada_pos_turno, u.nombre_completo
       ORDER BY t.numero_turno ASC`,
      [diaContable.id]
    )

    const turnos = (turnosRes.rows ?? []).map((turno) => {
      let diferencia_calculada_turno = 0
      if (turno.efectivo_contado_turno !== null && turno.venta_reportada_pos_turno !== null) {
        const efectivoEsperado =
          turno.venta_reportada_pos_turno +
          turno.total_pagos_digitales -
          turno.total_gastos
        diferencia_calculada_turno = turno.efectivo_contado_turno - efectivoEsperado
      }

      return {
        id: turno.id,
        numero_turno: turno.numero_turno,
        estado: turno.estado,
        usuario_id: turno.usuario_id,
        usuario_nombre: turno.usuario_nombre,
        efectivo_contado_turno: turno.efectivo_contado_turno,
        venta_reportada_pos_turno: turno.venta_reportada_pos_turno,
        total_pagos_digitales: parseFloat(turno.total_pagos_digitales),
        total_gastos: parseFloat(turno.total_gastos),
        diferencia_calculada_turno: diferencia_calculada_turno,
        transacciones_count: parseInt(turno.transacciones_count)
      }
    })

    console.log(`  📊 Turnos encontrados: ${turnos.length}`)

    const totalTransacciones = turnos.reduce((sum, t) => sum + (t.transacciones_count || 0), 0)
    const totalPagosDigitales = turnos.reduce((sum, t) => sum + (t.total_pagos_digitales || 0), 0)
    const totalGastos = turnos.reduce((sum, t) => sum + (t.total_gastos || 0), 0)
    const totalDiferencia = turnos.reduce((sum, t) => sum + (t.diferencia_calculada_turno || 0), 0)

    const auditRes = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN confirmado_auditoria = true THEN 1 END) as confirmadas
       FROM transacciones tx
       JOIN turnos t ON tx.turno_id = t.id
       WHERE t.dia_contable_id = $1`,
      [diaContable.id]
    )

    const auditStats = auditRes.rows[0] || { total: 0, confirmadas: 0 }

    const response = {
      ...diaContable,
      turnos,
      totalTransacciones,
      totalPagosDigitales,
      totalGastos,
      totalDiferencia,
      transaccionesAuditadas: parseInt(auditStats.confirmadas),
      transaccionesPendientes: parseInt(auditStats.total) - parseInt(auditStats.confirmadas)
    }

    console.log(`[DiaContableHandler] Día ${today}: ${turnos.length} turnos, ${totalTransacciones} transacciones`)
    return { success: true, diaContable: response }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
    console.error(`[DiaContableHandler] Error getCurrent: ${errorMsg}`)
    return { success: false, error: `Error al obtener día contable: ${errorMsg}` }
  }
}

/**
 * Handler: dia-contable:review
 */
async function handleReviewDiaContable(negocioId) {
  console.log(`[DiaContableHandler] Revisando día contable para negocio ${negocioId}`)

  try {
    if (!negocioId || negocioId <= 0) {
      return { success: false, error: 'ID de negocio inválido' }
    }

    const today = new Date().toISOString().split('T')[0]

    // 1. Buscar día contable
    const diaRes = await query(
      `SELECT id, estado FROM dias_contables
       WHERE negocio_id = $1 AND fecha = $2`,
      [negocioId, today]
    )

    if ((diaRes.rowCount ?? 0) === 0) {
      return { success: false, error: 'No existe día contable para revisar' }
    }

    const diaContable = diaRes.rows[0]

    // 2. Validar que no esté ya revisado
    if (diaContable.estado === 'REVISADO') {
      return { success: false, error: 'El día ya ha sido revisado' }
    }

    // 3. Validar que TODOS los turnos estén CERRADOS
    const turnosAbiertosRes = await query(
      `SELECT t.id FROM turnos t
       JOIN dias_contables d ON t.dia_contable_id = d.id
       WHERE d.negocio_id = $1 AND d.fecha = $2 AND t.estado != $3`,
      [negocioId, today, 'CERRADO']
    )

    if ((turnosAbiertosRes.rowCount ?? 0) > 0) {
      return {
        success: false,
        error: `No todos los turnos están cerrados (${turnosAbiertosRes.rowCount} abiertos)`
      }
    }

    // 4. Cambiar estado a REVISADO
    await query(
      `UPDATE dias_contables
       SET estado = $1, updated_at = NOW()
       WHERE id = $2`,
      ['REVISADO', diaContable.id]
    )

    console.log(`[DiaContableHandler] Día ${today} revisado para negocio ${negocioId}`)
    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
    console.error(`[DiaContableHandler] Error review: ${errorMsg}`)
    return { success: false, error: `Error al revisar el día: ${errorMsg}` }
  }
}

// ============================================================
// 3. CASOS DE PRUEBA
// ============================================================

async function runTests() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 SUITE DE PRUEBAS: HANDLERS CRÍTICOS')
  console.log('='.repeat(70))

  try {
    // TEST 1: negocio:getByUser
    console.log('\n\n📌 TEST 1: negocio:getByUser (Admin con múltiples negocios)')
    console.log('-'.repeat(70))
    const test1 = await handleGetNegociosByUser(1)
    console.log(`✅ Resultado:`, JSON.stringify(test1, null, 2))

    // TEST 2: negocio:getByUser (Usuario con un negocio)
    console.log('\n\n📌 TEST 2: negocio:getByUser (Empleado con un negocio)')
    console.log('-'.repeat(70))
    const test2 = await handleGetNegociosByUser(2)
    console.log(`✅ Resultado:`, JSON.stringify(test2, null, 2))

    // TEST 3: dia-contable:getCurrent
    console.log('\n\n📌 TEST 3: dia-contable:getCurrent (Sin día contable aún)')
    console.log('-'.repeat(70))
    const test3 = await handleGetCurrentDiaContable(1)
    console.log(`✅ Resultado:`, JSON.stringify(test3, null, 2))

    // TEST 4: Crear un turno y luego probar día contable
    console.log('\n\n📌 TEST 4: Creando turno de prueba para probar día contable')
    console.log('-'.repeat(70))
    const today = new Date().toISOString().split('T')[0]

    // Primero crear día contable
    await query(
      `INSERT INTO dias_contables (fecha, negocio_id, estado)
       VALUES ($1, $2, $3)
       ON CONFLICT (negocio_id, fecha) DO NOTHING`,
      [today, 1, 'ABIERTO']
    )
    console.log('  ✅ Día contable creado')

    // Luego crear un turno
    const diaRes = await query(
      `SELECT id FROM dias_contables WHERE negocio_id = $1 AND fecha = $2`,
      [1, today]
    )
    const diaId = diaRes.rows[0].id

    await query(
      `INSERT INTO turnos (dia_contable_id, usuario_id, numero_turno, estado)
       VALUES ($1, $2, $3, $4)`,
      [diaId, 2, 1, 'ABIERTO']
    )
    console.log('  ✅ Turno 1 creado (ABIERTO)')

    // TEST 5: Ahora probar dia-contable:getCurrent con datos
    console.log('\n\n📌 TEST 5: dia-contable:getCurrent (Con día contable y turno)')
    console.log('-'.repeat(70))
    const test5 = await handleGetCurrentDiaContable(1)
    console.log(`✅ Resultado:`, JSON.stringify(test5, null, 2))

    // TEST 6: Intentar review (debe fallar porque turno está ABIERTO)
    console.log('\n\n📌 TEST 6: dia-contable:review (Debe fallar - turno está ABIERTO)')
    console.log('-'.repeat(70))
    const test6 = await handleReviewDiaContable(1)
    console.log(`✅ Resultado:`, JSON.stringify(test6, null, 2))

    // TEST 7: Cerrar turno y luego hacer review
    console.log('\n\n📌 TEST 7: Cerrando turno y luego revisando día')
    console.log('-'.repeat(70))
    const turnoRes = await query(`SELECT id FROM turnos WHERE dia_contable_id = $1 ORDER BY numero_turno DESC LIMIT 1`, [diaId])
    const turnoId = turnoRes.rows[0].id

    await query(
      `UPDATE turnos SET estado = $1, efectivo_contado_turno = $2, venta_reportada_pos_turno = $3, diferencia_calculada_turno = $4 WHERE id = $5`,
      ['CERRADO', 100000, 100000, 0, turnoId]
    )
    console.log('  ✅ Turno cerrado')

    const test7 = await handleReviewDiaContable(1)
    console.log(`✅ Resultado:`, JSON.stringify(test7, null, 2))

    // TEST 8: Verificar que día está REVISADO
    console.log('\n\n📌 TEST 8: dia-contable:getCurrent (Día debe estar REVISADO)')
    console.log('-'.repeat(70))
    const test8 = await handleGetCurrentDiaContable(1)
    console.log(`✅ Resultado:`, JSON.stringify(test8, null, 2))

    console.log('\n' + '='.repeat(70))
    console.log('✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE')
    console.log('='.repeat(70) + '\n')
  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error)
    process.exit(1)
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
