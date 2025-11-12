// electron/services/sessionService.ts
/**
 * SERVICIO DE SESIONES: Gestiona sesiones activas por usuario
 * Responsabilidad: Evitar múltiples sesiones simultáneas del mismo usuario
 *
 * Política: Un usuario solo puede tener UNA sesión activa en una ventana Electron.
 * Si intenta login en otra ventana, se rechaza y se le avisa que cierre la otra sesión.
 */

import { BrowserWindow } from 'electron'

interface ActiveSession {
  userId: number
  username: string
  windowId: number
  startTime: Date
}

/**
 * Registry global de sesiones activas
 * Key: userId
 * Value: { userId, username, windowId, startTime }
 */
const activeSessions = new Map<number, ActiveSession>()

/**
 * Registra una nueva sesión activa
 * Retorna true si se registró exitosamente
 * Retorna false si el usuario ya tiene una sesión activa (multi-sesión bloqueada)
 */
export const registerSession = (
  userId: number,
  username: string,
  windowId: number
): { success: boolean; message?: string } => {
  // Si el usuario ya tiene una sesión activa, rechazar
  if (activeSessions.has(userId)) {
    const existingSession = activeSessions.get(userId)!
    return {
      success: false,
      message: `Este usuario ya tiene una sesión activa en otra ventana (Abierta hace ${Math.round((Date.now() - existingSession.startTime.getTime()) / 1000)}s). Por favor, cierra esa sesión primero.`
    }
  }

  // Registrar la nueva sesión
  activeSessions.set(userId, {
    userId,
    username,
    windowId,
    startTime: new Date()
  })

  console.log(`✅ [SessionService] Sesión registrada para ${username} (ID: ${userId}) en ventana ${windowId}`)
  return { success: true }
}

/**
 * Finaliza una sesión activa
 */
export const endSession = (userId: number): void => {
  if (activeSessions.has(userId)) {
    const session = activeSessions.get(userId)!
    activeSessions.delete(userId)
    console.log(`🔚 [SessionService] Sesión finalizada para usuario ${userId} (${session.username})`)
  }
}

/**
 * Verifica si un usuario tiene una sesión activa
 */
export const hasActiveSession = (userId: number): boolean => {
  return activeSessions.has(userId)
}

/**
 * Obtiene la sesión activa de un usuario
 */
export const getActiveSession = (userId: number): ActiveSession | undefined => {
  return activeSessions.get(userId)
}

/**
 * Limpia todas las sesiones de una ventana (cuando se cierra)
 * Esto se llama cuando la ventana Electron se cierra
 */
export const endSessionsByWindow = (windowId: number): void => {
  const usersToDelete: number[] = []

  for (const [userId, session] of activeSessions.entries()) {
    if (session.windowId === windowId) {
      usersToDelete.push(userId)
    }
  }

  usersToDelete.forEach(userId => {
    endSession(userId)
  })

  if (usersToDelete.length > 0) {
    console.log(`🧹 [SessionService] Limpiadas ${usersToDelete.length} sesiones de ventana ${windowId}`)
  }
}

/**
 * Obtiene todas las sesiones activas (para debugging)
 */
export const getAllActiveSessions = (): ActiveSession[] => {
  return Array.from(activeSessions.values())
}
