# 📐 Arquitectura Backend - GestorPyME

## 🎯 Objetivo
Evitar el patrón "monolito" donde todo el código de backend vive en `main.ts`. 
Esta arquitectura separa responsabilidades en capas modulares.

## 🏗️ Estructura de Capas

```
electron/
├── main.ts                    # 🎬 Orquestador: Crea ventana y registra handlers
├── database.ts                # 🔌 Conexión a PostgreSQL (Singleton)
├── security.ts                # 🔐 Utilidades de seguridad (bcrypt)
├── handlers/                  # 📨 CAPA 1: Recibe requests IPC del frontend
│   └── authHandlers.ts        # Handler para autenticación
├── services/                  # 💼 CAPA 2: Lógica de negocio
│   └── authService.ts         # Servicio de autenticación
└── repositories/              # 🗄️ CAPA 3: Acceso a datos (SQL)
    └── userRepository.ts      # Repositorio de usuarios
```

## 📋 Responsabilidades por Capa

### CAPA 1: Handlers (`handlers/`)
- **Entrada:** Recibe requests del renderer process (IPC)
- **Responsabilidad:** 
  - Validar formato de entrada
  - Delegar al servicio correspondiente
  - Retornar respuesta al frontend
- **NO debe:** Contener lógica de negocio, ejecutar SQL directamente

**Ejemplo:**
```typescript
// handlers/authHandlers.ts
ipcMain.handle('auth:login', async (_event, args) => {
  // Validar entrada
  if (!args.username || !args.password) {
    return { success: false, error: 'Datos incompletos' }
  }
  // Delegar al servicio
  return await authenticateUser(args.username, args.password)
})
```

---

### CAPA 2: Services (`services/`)
- **Entrada:** Llamado desde handlers
- **Responsabilidad:**
  - Implementar reglas de negocio
  - Coordinar múltiples repositorios si es necesario
  - Transformar datos entre capas
- **NO debe:** Ejecutar SQL directamente, manejar IPC

**Ejemplo:**
```typescript
// services/authService.ts
export const authenticateUser = async (username, password) => {
  // 1. Buscar usuario
  const user = await findUserByUsername(username)
  if (!user) return { success: false, error: 'Usuario no encontrado' }
  
  // 2. Verificar contraseña
  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return { success: false, error: 'Contraseña incorrecta' }
  
  // 3. Obtener rol
  const member = await findMemberByUserId(user.id)
  
  return { success: true, user: {...} }
}
```

---

### CAPA 3: Repositories (`repositories/`)
- **Entrada:** Llamado desde servicios
- **Responsabilidad:**
  - Ejecutar queries SQL
  - Retornar datos "crudos" de la BD
- **NO debe:** Contener lógica de negocio, validaciones complejas

**Ejemplo:**
```typescript
// repositories/userRepository.ts
export const findUserByUsername = async (username: string) => {
  const result = await query(
    'SELECT * FROM usuarios WHERE username = $1',
    [username]
  )
  return result.rowCount > 0 ? result.rows[0] : null
}
```

---

## ✅ Ventajas de esta Arquitectura

1. **Escalabilidad:** Agregar funcionalidad no hace crecer `main.ts`
2. **Mantenibilidad:** Cada archivo tiene responsabilidad única
3. **Testeo:** Puedes probar cada capa independientemente
4. **Reutilización:** Los servicios pueden llamar a múltiples repositorios
5. **Claridad:** El flujo de datos es predecible: Handler → Service → Repository

---

## 🔮 Próximos Módulos a Crear

Cuando necesites agregar funcionalidad de turnos o transacciones, sigue este patrón:

```
handlers/
  ├── authHandlers.ts          ✅ (Hecho)
  ├── turnoHandlers.ts          🔜 (Por hacer)
  └── transaccionHandlers.ts    🔜 (Por hacer)

services/
  ├── authService.ts            ✅ (Hecho)
  ├── turnoService.ts           🔜 (Por hacer)
  └── transaccionService.ts     🔜 (Por hacer)

repositories/
  ├── userRepository.ts         ✅ (Hecho)
  ├── turnoRepository.ts        🔜 (Por hacer)
  └── transaccionRepository.ts  🔜 (Por hacer)
```

Luego registra los nuevos handlers en `main.ts`:
```typescript
app.whenReady().then(() => {
  createWindow()
  registerAuthHandlers()        // ✅ Ya está
  registerTurnoHandlers()       // 🔜 Agregar cuando lo necesites
  registerTransaccionHandlers() // 🔜 Agregar cuando lo necesites
})
```

---

## 📝 Convenciones de Naming

- **Handlers:** `[dominio]Handlers.ts` (plural)
- **Services:** `[dominio]Service.ts` (singular)
- **Repositories:** `[entidad]Repository.ts` (singular)
- **Funciones de repositorio:** Verbos descriptivos (`findUserByUsername`, `createTurno`, `updateTransaccion`)

---

## 🚀 Ejemplo de Flujo Completo (Login)

```
Frontend (React)
  ↓ window.electronAPI.login({ username, password })
  
Preload (preload.ts)
  ↓ ipcRenderer.invoke('auth:login', args)
  
Handler (authHandlers.ts)
  ↓ Valida entrada
  ↓ Llama a authenticateUser()
  
Service (authService.ts)
  ↓ Llama a findUserByUsername()
  ↓ Llama a verifyPassword()
  ↓ Llama a findMemberByUserId()
  ↓ Retorna LoginResult
  
Repositories (userRepository.ts)
  ↓ Ejecuta SQL queries
  ↓ Retorna datos crudos
  
Database (database.ts)
  ↓ Pool de PostgreSQL
  
PostgreSQL (Railway/Local)
```

---

**Creado:** 2025-05-11  
**Autor:** GestorPyME Development Team
