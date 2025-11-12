import { contextBridge, ipcRenderer } from 'electron'

console.log('✅ [Preload] Script cargado.')

interface LoginArgs {
  username: string;
  password: string;
}

interface InitializeTurnoArgs {
  usuarioId: number;
  negocioId: number;
}

interface LogoutArgs {
  userId: number;
}

/**
 * API segura expuesta al renderer process (React)
 * Usa ipcRenderer.invoke para comunicarse con main process
 */
const ipcApi = {
  invoke: (channel: string, ...args: any[]) => {
    console.log('[Preload] Llamando a IPC:', channel, 'con args:', args)
    return ipcRenderer.invoke(channel, ...args)
  },
  send: (channel: string, ...args: any[]) => {
    console.log('[Preload] Enviando a IPC:', channel, 'con args:', args)
    return ipcRenderer.send(channel, ...args)
  },
  on: (channel: string, callback: any) => {
    return ipcRenderer.on(channel, callback)
  },
  once: (channel: string, callback: any) => {
    return ipcRenderer.once(channel, callback)
  },
}

const electronAPI = {
  login: (args: LoginArgs) => {
    console.log('[Preload] Llamando a "auth:login" con:', args.username)
    return ipcRenderer.invoke('auth:login', args)
  },
  logout: (args: LogoutArgs) => {
    console.log('[Preload] Llamando a "auth:logout" para usuario ID:', args.userId)
    return ipcRenderer.invoke('auth:logout', args)
  },
  initializeTurno: (args: InitializeTurnoArgs): Promise<Record<string, unknown>> => {
    return ipcRenderer.invoke('turno:initialize', args);
  },
}

try {
  contextBridge.exposeInMainWorld('ipcApi', ipcApi)
  console.log('✅ [Preload] "ipcApi" expuesta correctamente.')
  contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  console.log('✅ [Preload] "electronAPI" expuesta correctamente.')
} catch (error) {
  console.error('❌ [Preload] Error al exponer APIs:', error)
}