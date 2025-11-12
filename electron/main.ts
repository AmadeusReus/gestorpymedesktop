import { app, BrowserWindow, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Importar handlers modulares
import { registerAuthHandlers } from './handlers/authHandlers'
import { registerTurnoHandlers } from './handlers/turnoHandlers';
import { registerTransaccionHandlers } from './handlers/transaccionHandlers';
import { registerCatalogoHandlers } from './handlers/catalogoHandlers';
import { registerNegocioHandlers } from './handlers/negocioHandlers';
import { registerDiaContableHandlers } from './handlers/diaContableHandlers';
// Importar sesiones para limpiar al cerrar ventana
import { endSessionsByWindow } from './services/sessionService';
// Setup para ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

const windows = new Set<BrowserWindow>()

function createWindow() {
  const newWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC ?? RENDERER_DIST, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,  // ✅ Agregado: Aísla el contexto del renderer
      nodeIntegration: false,  // ✅ Agregado: Desactiva Node.js en el renderer (seguridad)
      sandbox: false           // Necesario para acceder a Node APIs en preload
    }
  })

  windows.add(newWindow)

  // Evento cuando termina de cargar la página
  newWindow.webContents.on('did-finish-load', () => {
    console.log(`✅ [Main] Ventana ${newWindow.id} cargada correctamente`)
  })

  // Evento cuando se cierra la ventana: limpiar sesiones activas
  const windowId = newWindow.id
  newWindow.on('closed', () => {
    console.log(`🔚 [Main] Ventana ${windowId} cerrada`)
    endSessionsByWindow(windowId)
    windows.delete(newWindow)
  })

  if (VITE_DEV_SERVER_URL) {
    newWindow.loadURL(VITE_DEV_SERVER_URL)
    newWindow.webContents.openDevTools() // ✅ Habilitado para debugging
  } else {
    newWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  return newWindow
}

// Ciclo de vida de la aplicación
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Registrar handlers IPC cuando la app esté lista
app.whenReady().then(() => {
  // 1. Crear ventana principal
  createWindow()

  // 2. Crear menú con atajo Ctrl+N para abrir nueva ventana
  const menu = Menu.buildFromTemplate([
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva Ventana',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            console.log('📱 [Menu] Abriendo nueva ventana (Ctrl+N)')
            createWindow()
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
  console.log('✅ [Main] Menú configurado (Ctrl+N para nueva ventana)')

  // 3. Registrar todos los handlers IPC
  registerAuthHandlers()
  registerTurnoHandlers()
  registerTransaccionHandlers()
  registerCatalogoHandlers()
  registerNegocioHandlers()
  registerDiaContableHandlers()
  console.log('✅ [Main] Todos los handlers IPC registrados')
})
