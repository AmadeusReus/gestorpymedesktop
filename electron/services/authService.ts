// electron/services/authService.ts
/**
 * CAPA DE LÓGICA DE NEGOCIO: Autenticación
 * Responsabilidad: Validar reglas de negocio, coordinar repositorios
 */

import { verifyPassword } from '../security'
import { findUserByUsername, findMemberByUserId } from '../repositories/userRepository'

export interface LoginResult {
  success: boolean
  error?: string
  user?: {
    id: number
    username: string
    nombreCompleto: string
    rol: string
    negocioId: number
  }
}

/**
 * Autentica un usuario y retorna su información
 * Reglas de negocio:
 * 1. Usuario debe existir
 * 2. Usuario debe estar activo
 * 3. Contraseña debe ser válida
 * 4. Usuario debe tener un rol asignado (ser miembro de un negocio)
 */
export const authenticateUser = async (
  username: string,
  password: string
): Promise<LoginResult> => {
  try {
    // 1. Buscar al usuario
    const userRecord = await findUserByUsername(username)

    if (!userRecord) {
      console.warn(`[AuthService] Login fallido: Usuario no encontrado (${username})`)
      return { 
        success: false, 
        error: 'Credenciales incorrectas.' 
      }
    }

    // 2. Verificar si el usuario está activo
    if (!userRecord.activo) {
      console.warn(`[AuthService] Login fallido: Usuario inactivo (${username})`)
      return { 
        success: false, 
        error: 'Esta cuenta ha sido desactivada.' 
      }
    }

    // 3. Verificar la contraseña
    const isValidPassword = await verifyPassword(password, userRecord.password_hash)

    if (!isValidPassword) {
      console.warn(`[AuthService] Login fallido: Contraseña incorrecta para ${username}`)
      return { 
        success: false, 
        error: 'Credenciales incorrectas.' 
      }
    }

    // 4. Obtener el rol y negocio del usuario
    const memberRecord = await findMemberByUserId(userRecord.id)

    if (!memberRecord) {
      console.error(
        `[AuthService] Error: Usuario ${username} válido pero no es miembro de ningún negocio.`
      )
      return {
        success: false,
        error: 'Usuario válido pero no asignado a un negocio.'
      }
    }

    // 5. Login exitoso
    console.log(
      `✅ [AuthService] Login exitoso: ${username} | Rol: ${memberRecord.rol}`
    )

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
  } catch (error: unknown) {
    console.error('❌ [AuthService] Error en authenticateUser:', error)
    return {
      success: false,
      error: 'Error del servidor. Verifique la conexión a la base de datos.'
    }
  }
}
