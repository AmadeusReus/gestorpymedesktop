/**
 * Reset BD Prueba - Limpia datos operacionales manteniendo estructura
 *
 * BORRA:
 * - Transacciones
 * - Turnos
 * - Días Contables
 *
 * MANTIENE:
 * - Usuarios (credenciales para login)
 * - Negocios
 * - Miembros (roles)
 * - Proveedores
 * - Tipos de Gasto
 * - Tipos de Pago Digital
 *
 * Perfecta para: Pruebas manuales, demos, reseteos entre ciclos de prueba
 *
 * Ejecutar con: node scripts/reset-bd-prueba.mjs
 */

import 'dotenv/config'
import { createRequire } from 'node:module'

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
    console.error('   Verifica: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME en .env')
    throw new Error('Configuración incompleta')
  }

  pool = new Pool(dbConfig)
  return pool
}

const query = async (text, params = []) => {
  const poolInst = getPool()
  try {
    const res = await poolInst.query(text, params)
    return res
  } catch (error) {
    throw error
  }
}

async function resetBDPrueba() {
  console.log('\n' + '='.repeat(75))
  console.log('🔄 RESET BD PARA PRUEBA - GestorPyME Desktop')
  console.log('='.repeat(75) + '\n')

  try {
    // 1. Conectar
    console.log('📡 Conectando a PostgreSQL...')
    const pool = getPool()
    await pool.query('SELECT NOW()')
    console.log('   ✅ Conexión exitosa\n')

    // 2. Borrar datos operacionales
    console.log('🗑️  PASO 1: Borrando datos operacionales\n')

    console.log('   • Borrando Transacciones...')
    const txRes = await query('DELETE FROM transacciones')
    console.log(`     ✅ ${txRes.rowCount} registros eliminados`)

    console.log('   • Borrando Turnos...')
    const turnRes = await query('DELETE FROM turnos')
    console.log(`     ✅ ${turnRes.rowCount} registros eliminados`)

    console.log('   • Borrando Días Contables...')
    const diaRes = await query('DELETE FROM dias_contables')
    console.log(`     ✅ ${diaRes.rowCount} registros eliminados`)

    // 3. Resetear secuencias
    console.log('\n🔢 PASO 2: Reseteando secuencias\n')

    console.log('   • Secuencia: transacciones_id_seq')
    await query('ALTER SEQUENCE transacciones_id_seq RESTART WITH 1')
    console.log('     ✅ Completado')

    console.log('   • Secuencia: turnos_id_seq')
    await query('ALTER SEQUENCE turnos_id_seq RESTART WITH 1')
    console.log('     ✅ Completado')

    console.log('   • Secuencia: dias_contables_id_seq')
    await query('ALTER SEQUENCE dias_contables_id_seq RESTART WITH 1')
    console.log('     ✅ Completado')

    // 4. Verificación
    console.log('\n✅ VERIFICACIÓN: Datos Borrados\n')

    const countTx = await query('SELECT COUNT(*) as count FROM transacciones')
    console.log(`   📊 Transacciones: ${countTx.rows[0].count}`)

    const countTur = await query('SELECT COUNT(*) as count FROM turnos')
    console.log(`   📊 Turnos: ${countTur.rows[0].count}`)

    const countDia = await query('SELECT COUNT(*) as count FROM dias_contables')
    console.log(`   📊 Días Contables: ${countDia.rows[0].count}`)

    console.log('\n✅ VERIFICACIÓN: Estructura Intacta\n')

    const countUsr = await query('SELECT COUNT(*) as count FROM usuarios')
    console.log(`   👤 Usuarios: ${countUsr.rows[0].count}`)

    const countNeg = await query('SELECT COUNT(*) as count FROM negocios')
    console.log(`   🏢 Negocios: ${countNeg.rows[0].count}`)

    const countMiem = await query('SELECT COUNT(*) as count FROM miembros')
    console.log(`   👥 Miembros: ${countMiem.rows[0].count}`)

    const countProv = await query('SELECT COUNT(*) as count FROM proveedores')
    console.log(`   📦 Proveedores: ${countProv.rows[0].count}`)

    const countGas = await query('SELECT COUNT(*) as count FROM tipos_gasto')
    console.log(`   💸 Tipos de Gasto: ${countGas.rows[0].count}`)

    const countPago = await query('SELECT COUNT(*) as count FROM tipos_pago_digital')
    console.log(`   💳 Tipos de Pago Digital: ${countPago.rows[0].count}`)

    // 5. Listar usuarios disponibles
    console.log('\n✅ USUARIOS DISPONIBLES PARA PRUEBA\n')

    const usersRes = await query(`
      SELECT
        u.id,
        u.username,
        u.nombre_completo,
        m.rol,
        n.nombre_negocio
      FROM usuarios u
      LEFT JOIN miembros m ON u.id = m.usuario_id
      LEFT JOIN negocios n ON m.negocio_id = n.id
      WHERE u.activo = true
      ORDER BY u.username
    `)

    console.log('   Usuario              | Nombre Completo      | Rol             | Negocio')
    console.log('   ' + '-'.repeat(75))

    usersRes.rows.forEach((row) => {
      const usr = row.username.padEnd(19)
      const nom = row.nombre_completo.padEnd(20)
      const rol = (row.rol || 'sin rol').padEnd(15)
      const neg = row.nombre_negocio || 'sin negocio'
      console.log(`   ${usr} | ${nom} | ${rol} | ${neg}`)
    })

    // 6. Credenciales
    console.log('\n' + '='.repeat(75))
    console.log('📌 CREDENCIALES PARA PRUEBA\n')

    console.log('   👤 EMPLEADO:')
    console.log('      Usuario: empleado1')
    console.log('      Contraseña: empleado123')
    console.log('')
    console.log('   👮 SUPERVISOR:')
    console.log('      Usuario: supervisor')
    console.log('      Contraseña: supervisor123')
    console.log('')
    console.log('   🔧 ADMINISTRADOR:')
    console.log('      Usuario: admin')
    console.log('      Contraseña: admin123')

    console.log('\n' + '='.repeat(75))
    console.log('✅ BD LISTA PARA PRUEBA MANUAL')
    console.log('   Ejecuta: npm run dev')
    console.log('='.repeat(75) + '\n')

  } catch (error) {
    console.error('\n❌ ERROR DURANTE RESET:')
    console.error(`   ${error.message}\n`)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

// Ejecutar
resetBDPrueba().then(() => process.exit(0))
