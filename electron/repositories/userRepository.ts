// electron/repositories/userRepository.ts
/**
 * CAPA DE DATOS: Consultas SQL relacionadas con Usuarios
 * Responsabilidad: Solo ejecutar queries, sin lógica de negocio
 */

import { query } from '../database'
import type { QueryResult } from 'pg'

export interface UserRecord {
  id: number
  username: string
  nombre_completo: string
  password_hash: string
  activo: boolean
}

export interface MemberRecord {
  id: number
  usuario_id: number
  negocio_id: number
  rol: 'empleado' | 'supervisor' | 'administrador'
}

/**
 * Busca un usuario por username
 */
export const findUserByUsername = async (
  username: string
): Promise<UserRecord | null> => {
  const result: QueryResult<UserRecord> = await query(
    'SELECT * FROM usuarios WHERE username = $1',
    [username]
  )

  return result.rowCount && result.rowCount > 0 ? result.rows[0] : null
}

/**
 * Busca la membresía (rol y negocio) de un usuario
 */
export const findMemberByUserId = async (
  userId: number
): Promise<MemberRecord | null> => {
  const result: QueryResult<MemberRecord> = await query(
    'SELECT * FROM miembros WHERE usuario_id = $1',
    [userId]
  )

  return result.rowCount && result.rowCount > 0 ? result.rows[0] : null
}
