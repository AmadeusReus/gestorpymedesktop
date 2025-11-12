// src/api/httpClient.ts

/**
 * Cliente HTTP para comunicación con Electron IPC
 * Abstrae la comunicación entre renderer y main process
 */

const API_TIMEOUT = 30000; // 30 segundos

interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class HttpClient {
  private ipcApi: any;

  constructor() {
    // Obtener la API segura del preload
    if (typeof window !== 'undefined' && (window as any).ipcApi) {
      this.ipcApi = (window as any).ipcApi;
    }
  }

  /**
   * Realiza una llamada IPC al main process
   */
  async invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    if (!this.ipcApi) {
      throw new Error('IPC API no disponible. ¿Está corriendo en Electron?');
    }

    try {
      const response = await Promise.race([
        this.ipcApi.invoke(channel, ...args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout en IPC')), API_TIMEOUT)
        )
      ]);

      // Manejo de respuestas con estructura IPC: { success, error?, data? }
      if (typeof response === 'object' && response !== null && 'success' in response) {
        if (response.success === false) {
          throw new Error(response.error || 'Error desconocido');
        }
        // Si tiene 'data', retorna data
        if (response.data !== undefined) {
          return response.data as T;
        }
        // Si tiene 'turno', retorna turno (para handlers de turno)
        if ('turno' in response) {
          return response.turno as T;
        }
        // Si tiene 'user', retorna user (para handlers de auth)
        if ('user' in response) {
          return response.user as T;
        }
        // Si tiene 'transaccion', retorna transaccion (para handlers que crean transacciones)
        if ('transaccion' in response) {
          return response.transaccion as T;
        }
        // Si tiene 'transacciones', retorna transacciones (para handlers de transacciones)
        if ('transacciones' in response) {
          return response.transacciones as T;
        }
        // Si tiene 'turnos', retorna turnos (para handlers que retornan arrays de turnos)
        if ('turnos' in response) {
          return response.turnos as T;
        }
        // Si no tiene data/turno/user/transaccion/transacciones/turnos, retorna la respuesta completa
        return response as T;
      }

      // Si no es una respuesta IPC, retorna directamente
      return response as T;
    } catch (error) {
      console.error(`Error en IPC (${channel}):`, error);
      throw error;
    }
  }

  /**
   * Verifica si el cliente está disponible
   */
  isAvailable(): boolean {
    return !!this.ipcApi;
  }
}

export const httpClient = new HttpClient();
export type { IpcResponse };
