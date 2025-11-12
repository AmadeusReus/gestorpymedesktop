import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ❌ REMOVIDO: window.ipcRenderer.on() - Esto era inseguro
// El mensaje de 'main-process-message' no es necesario para nuestra app
// Si lo necesitas, se debe manejar a través de electronAPI en preload.ts