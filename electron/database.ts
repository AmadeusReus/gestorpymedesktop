// electron/database.ts

import type { Pool, PoolConfig } from 'pg'
// 1. IMPORTA 'createRequire'
import { createRequire } from 'node:module'

/**
 * Variable global para mantener la instancia del Pool (Singleton).
 */
let pool: Pool | null = null

/**
 * Obtiene la instancia del Pool (Singleton).
 */
const getPool = (): Pool => {
  if (pool) {
    return pool
  }

  // 2. CONSTRUIR LA CONFIGURACIÓN DESDE PROCESS.ENV
  const dbConfig: PoolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: process.env.DB_TIMEZONE || 'America/Bogota'
  }

  // 3. Validar que las variables de entorno existan
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error(
      'Error de configuración: Faltan variables de entorno de DB (DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT). Revisa tu .env y vite.config.ts'
    )
    throw new Error(
      'Error de configuración: Faltan variables de entorno de DB.'
    )
  }

  // 4. SOLUCIÓN PARA 'require' EN ES MODULES
  const require = createRequire(import.meta.url)
  console.log("Cargando el módulo 'pg' (lazy load)...")
  const { Pool } = require('pg')
  console.log("Módulo 'pg' cargado.")

  console.log(
    `Creando pool de conexión para: ${dbConfig.database} en ${dbConfig.host}`
  )
  pool = new Pool(dbConfig)

  if (!pool) {
    throw new Error('No se pudo crear el pool de conexión')
  }

  pool.on('error', (err) => {
    console.error('Error inesperado en el cliente del pool', err)
  })

  return pool
}

/**
 * Función genérica para ejecutar consultas en la base de datos.
 */
export const query = async (text: string, params: any[] = []) => {
  const poolInst = getPool()
  try {
    const start = Date.now()
    const res = await poolInst.query(text, params)
    const duration = Date.now() - start
    console.log(`[DB Query] Ejecutada: ${text.substring(0, 50)}...`, {
      duration: `${duration}ms`,
      rows: res.rowCount
    })
    return res
  } catch (error) {
    console.error(`[DB Error] al ejecutar: ${text.substring(0, 50)}...`, error)
    throw error
  }
}