// src/hooks/useAuth.ts

import { useState, useCallback } from 'react';

// Extender tipo Window para electronAPI
declare global {
  interface Window {
    electronAPI: {
      login: (args: { username: string; password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
      logout: (args: { userId: number }) => Promise<{ success: boolean }>;
      initializeTurno?: (args: { usuarioId: number; negocioId: number }) => Promise<{ success: boolean; turno?: unknown; error?: string }>;
    };
  }
}

// =========================================================
// INTERFACES (Definiciones de Tipos para el Estado)
// =========================================================
export interface Turno { // Definimos una interfaz simple para el turno
    id: number;
    dia_contable_id: number;
    numero_turno: number;
    estado: string;
    // Agrega aquí los demás campos que retorna la tabla Turnos si son necesarios
}

export interface User {
    id: number;
    username: string;
    nombreCompleto: string;
    rol: 'empleado' | 'supervisor' | 'administrador';
    negocioId: number;
    turno?: Turno | null; // ⬅️ Opcional - se carga bajo demanda en TurnoScreen
}

interface AuthHook {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    setUserTurno: (turno: Turno | null) => void;
}

// =========================================================
// CUSTOM HOOK: useAuth
// =========================================================
export const useAuth = (): AuthHook => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        console.log(`[Hook] Intentando iniciar sesión para: ${username}`);

        try {
            // 1. Llamada a Autenticación
            const authResult = await window.electronAPI.login({ username, password });

            if (authResult.success && authResult.user) {
                const userPayload = authResult.user;

                // El turno se carga bajo demanda en TurnoScreen
                setUser(userPayload as User);
                // Guardar en localStorage para acceso desde servicios
                localStorage.setItem('user', JSON.stringify(userPayload));
                console.log(`✅ [Hook] Sesión iniciada para: ${userPayload.nombreCompleto}`);

            } else if (authResult.error) {
                // Error de autenticación (Credenciales incorrectas, Usuario inactivo)
                setError(authResult.error);
                console.error('❌ [Hook] Error de autenticación:', authResult.error);
            } else {
                // Error de respuesta inesperada
                setError('Ocurrió un error desconocido durante el inicio de sesión.');
                console.error('❌ [Hook] Respuesta de login inesperada:', authResult);
            }
        } catch (e) {
            // Manejo de errores de comunicación (Red/IPC/DB)
            console.error('❌ [Hook] Error grave en la llamada IPC:', e);
            setError('No se pudo comunicar con el servidor de la aplicación. Verifique su conexión.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Si hay un usuario activo, notificar al main process para finalizar la sesión
            if (user && user.id) {
                await window.electronAPI.logout({ userId: user.id });
                console.log(`✅ [Hook] Sesión ${user.id} finalizada en el main process.`);
            }
        } catch (error) {
            console.error('❌ [Hook] Error al notificar logout al main process:', error);
        } finally {
            // Limpiar estado local sin importar si el IPC falla
            setUser(null);
            setError(null);
            localStorage.removeItem('user');
            console.log('🚪 [Hook] Sesión local cerrada.');
        }
    }, [user]);

    const setUserTurno = useCallback((turno: Turno | null) => {
        setUser((prevUser) => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, turno };
            // Actualizar también en localStorage para persistencia
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log(`📋 [Hook] Turno actualizado:`, turno);
            return updatedUser;
        });
    }, []);

    return { user, isLoading, error, login, logout, setUserTurno };
};