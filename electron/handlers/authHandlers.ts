// electron/handlers/authHandlers.ts
/**
 * CAPA DE HANDLERS IPC: Autenticación
 * Responsabilidad: Recibir requests del renderer, validar entrada, delegar a servicios
 */

import { ipcMain, BrowserWindow } from 'electron'
import { authenticateUser } from '../services/authService'
import { registerSession, endSession } from '../services/sessionService'
import type { LoginResult } from '../services/authService'

/**
 * Registra todos los handlers IPC relacionados con autenticación
 */
export const registerAuthHandlers = (): void => {
  /**
   * Handler: auth:login
   * Descripción: Autentica un usuario con username y password
   * Política: Bloquea multi-sesión (un usuario solo puede estar logueado en una ventana)
   */
  ipcMain.handle(
    'auth:login',
    async (
      event,
      args: { username: string; password: string }
    ): Promise<LoginResult> => {
      const { username, password } = args
      console.log(`[AuthHandler] Intento de login para: ${username}`)

      // Validación básica de entrada
      if (!username || !password) {
        return {
          success: false,
          error: 'Usuario y contraseña son requeridos.'
        }
      }

      // Delegar al servicio de autenticación
      const authResult = await authenticateUser(username, password)

      // Si la autenticación fue exitosa, registrar la sesión
      if (authResult.success && authResult.user) {
        const senderWindow = BrowserWindow.fromWebContents(event.sender)
        const windowId = senderWindow?.id ?? -1

        const sessionResult = registerSession(authResult.user.id, authResult.user.username, windowId)

        if (!sessionResult.success) {
          // Multi-sesión bloqueada
          console.warn(`[AuthHandler] Multi-sesión rechazada para ${username}`)
          return {
            success: false,
            error: sessionResult.message || 'Ya tienes una sesión activa en otra ventana.'
          }
        }
      }

      return authResult
    }
  )

  /**
   * Handler: auth:logout
   * Descripción: Cierra la sesión del usuario actual
   */
  ipcMain.handle(
    'auth:logout',
    async (event, args: { userId: number }): Promise<{ success: boolean }> => {
      const { userId } = args
      console.log(`[AuthHandler] Logout para usuario ID: ${userId}`)
      endSession(userId)
      return { success: true }
    }
  )

  console.log('✅ [AuthHandlers] Handlers de autenticación registrados')
}
