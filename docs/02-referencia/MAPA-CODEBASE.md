# 🗺️ Mapa Completo de la Codebase - GestorPyME Desktop

**Documento de referencia rápida para entender la estructura del código**

---

## 📁 ESTRUCTURA PRINCIPAL

```
gestorpymedesktop/
├── src/                    # FRONTEND (React + TypeScript)
├── electron/               # BACKEND (Electron + Node.js)
├── public/                 # Assets públicos
├── docs/                   # Documentación
├── scripts/                # Setup y test scripts
├── cypress/                # Tests E2E
├── styles/                 # Estilos globales
├── package.json            # Dependencias
├── vite.config.ts          # Config Vite
├── tsconfig.json           # Config TypeScript
└── electron-builder.json5  # Config Electron builder
```

---

## 🎨 FRONTEND (src/)

### 🔐 Root Components

```
src/
├── App.tsx                 # Root component - Maneja renderizado de LoginForm o MainApp
├── main.tsx                # Punto de entrada de Vite
└── vite-env.d.ts           # Type definitions para Vite
```

**Lógica:**
- App.tsx obtiene el usuario del localStorage
- Si está logueado → renderiza MainApp
- Si no → renderiza LoginForm

---

### 📝 Pantalla de Login

```
src/components/
├── LoginForm.tsx           # Formulario de login username/password
└── MainApp.tsx             # Router/Switcher principal para pantallas
```

**LoginForm.tsx:**
- Input para username
- Input para password
- Botón Login (llama a useAuth.login())
- Almacena user en localStorage

---

### 📱 Componentes Comunes (src/components/Common/)

| Archivo | Propósito | Props |
|---------|-----------|-------|
| **Button.tsx** | Botón reutilizable | variant, size, disabled, onClick, isLoading |
| **Card.tsx** | Contenedor/tarjeta | title, subtitle, footer, noPadding, elevated |
| **FormInput.tsx** | Input de texto | label, error, helperText, required, type |
| **FormSelect.tsx** | Select dropdown | label, options, placeholder, onChange, error |
| **Table.tsx** | Tabla con features | columns, data, sortable, selectable, onSort |
| **Tooltip.tsx** | Info tooltip | text, position |
| **Pagination.tsx** | Controles de página | currentPage, totalPages, onPageChange, itemsPerPage |
| **ConfirmDialog.tsx** | Modal de confirmación | isOpen, title, message, onConfirm, onCancel |
| **index.ts** | Exportaciones | Exporta todos los componentes |

**CSS asociado:** `src/styles/components/`

---

### 🏗️ Componentes de Layout (src/components/Layout/)

```
DashboardLayout.tsx
├── Header.tsx              # Barra superior (user, rol, logout)
├── Sidebar.tsx             # Navegación lateral (menú por rol)
└── Content Area            # Donde va el contenido (propiedades children)
```

**DashboardLayout Props:**
```typescript
{
  user: User;
  title: string;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}
```

**Menú del Sidebar por Rol:**
- **Empleado**: Mi Turno, Transacciones
- **Supervisor**: Mi Turno, Transacciones, Revisión, Auditoría
- **Administrador**: Todos + Gestión, Catálogos

---

### 📺 Pantallas (src/screens/)

#### TurnoScreen.tsx
**Rol:** Empleado, Supervisor, Admin
**Funcionalidades:**
- EMPLEADO sin turno → Botón crear turno
- EMPLEADO con turno propio → Ver transacciones, botón cerrar turno
- EMPLEADO con turno ajeno → Solo lectura + alerta
- SUPERVISOR → Ver todos los turnos, botón revisar día
- ADMIN → Modo recuperación (crear turno manual)

**Lógica de Cálculo:**
```
Efectivo Esperado = Venta POS + Pagos Digitales - Gastos/Compras
Diferencia = Efectivo Contado - Efectivo Esperado
```

**Hooks usados:** `useTurno()`, `useTransacciones()`

---

#### TransaccionesScreen.tsx
**Rol:** Empleado, Supervisor, Admin
**Funcionalidades:**
- Crear transacción (solo empleado/admin si turno activo)
- Listar transacciones con paginación
- Filtrar por categoría y concepto
- Confirmar en auditoría (supervisor/admin)
- Eliminar (empleado, solo si no auditada)
- Ver resumen de totales

**Categorías:**
- PAGO_DIGITAL (ingresos)
- GASTO_CAJA, COMPRA_PROV, GASTO_GENERAL, AJUSTE_CAJA (gastos)

**Hooks usados:** `useTurno()`, `useTransacciones()`

---

#### RevisionScreen.tsx
**Rol:** Supervisor, Admin
**Funcionalidades:**
- Ver resumen del día
- Ver todos los turnos del día
- Ver estadísticas de transacciones
- Checklist: turnos cerrados, transacciones auditadas, verificación
- Botón "Revisar y Cerrar Día"

⚠️ **Estado:** Parcialmente implementado (UI completa, backend falta)

**Handlers necesarios:**
- `dia-contable:getCurrent`
- `dia-contable:review`

---

#### AuditoriaScreen.tsx
**Rol:** Supervisor, Admin
**Funcionalidades:**
- Ver estadísticas de auditoría (total, confirmadas, pendientes, montos)
- Filtrar por estado (pending, confirmed, all)
- Filtrar por rango de fechas
- Listar transacciones auditadas
- Confirmar/rechazar transacciones
- Generar reporte

**Hooks usados:** `useAuditoria()`

---

#### CatalogoScreen.tsx
**Rol:** Admin
**Funcionalidades:**
- Gestionar 3 catálogos (Proveedores, Tipos de Gasto, Tipos de Pago)
- Crear, listar, activar/desactivar, eliminar
- Mostrar tabla con estado activo/inactivo
- Resumen de totales

**Hooks usados:** `useCatalogos()`

---

#### GestionScreen.tsx
**Rol:** Admin
**Funcionalidades (por Tab):**
- **Estadísticas**: Turnos hoy, transacciones hoy, movimiento total, diferencia
- **Gestión de Turnos**: Crear/borrar manual (recuperación)
- **Historial**: Tabla con operaciones realizadas
- **Configuración**: Datos del negocio, zona horaria, moneda

⚠️ **Estado:** Parcialmente implementado (UI completa, datos mockeados)

**Handlers necesarios:**
- `negocio:getStats`
- `operacion:getHistorial`

---

#### AdminNegocioSelector.tsx
**Rol:** Admin (cuando tiene múltiples negocios)
**Funcionalidades:**
- Mostrar grid de negocios
- Seleccionar uno
- Guardar selección en user.negocioId
- Ir a TurnoScreen

**Condición de aparición:**
```javascript
if (user.rol === 'administrador' && negocios.length >= 2) {
  mostrar AdminNegocioSelector
}
```

**Hooks usados:** `useNegocios()`

---

### 🎣 Custom Hooks (src/hooks/)

#### useAuth.ts
```typescript
export const useAuth = () => {
  login(username: string, password: string): Promise<void>
  logout(): void
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null
}
```

**Almacena user en localStorage** bajo clave `'user'`

---

#### useTurno.ts
```typescript
export const useTurno = () => {
  turno: Turno | null
  isLoading: boolean
  error: string | null
  success: boolean

  initTurno(negocioId: number): Promise<{ success: boolean }>
  getCurrentTurno(negocioId: number): Promise<void>
  closeTurno(turnoId: number): Promise<{ success: boolean }>
  refresh(): Promise<void>
  clearError(): void
  reset(): void
}
```

---

#### useTransacciones.ts
```typescript
export const useTransacciones = () => {
  transacciones: Transaccion[]
  isLoading: boolean
  error: string | null
  success: boolean

  createTransaccion(turnoId, valor, categoria, concepto?, proveedorId?, tipoGastoId?, tipoPagoId?): Promise<void>
  getTransaccionesByTurno(turnoId: number): Promise<void>
  updateTransaccion(id, ...): Promise<void>
  deleteTransaccion(id: number): Promise<void>
  confirmTransaccionAudit(id: number, auditorId: number): Promise<void>
  clearError(): void
}
```

---

#### useCatalogos.ts
```typescript
export const useCatalogos = () => {
  proveedores: Proveedor[]
  tiposGasto: TipoGasto[]
  tiposPagoDigital: TipoPagoDigital[]
  isLoading: boolean
  error: string | null
  success: boolean

  // Proveedores
  getProveedores(negocioId): Promise<void>
  createProveedor(negocioId, nombre): Promise<void>
  updateProveedor(id, nombre, activo): Promise<void>
  deleteProveedor(id): Promise<void>

  // Tipos de Gasto (similar)
  // Tipos de Pago Digital (similar)

  clearError(): void
}
```

---

#### useAuditoria.ts
```typescript
export const useAuditoria = () => {
  turnos: Turno[]
  transacciones: Transaccion[]
  stats: {
    totalTransacciones: number
    transaccionesConfirmadas: number
    diferenciasEncontradas: number
  }

  getTurnosByDay(diaContableId): Promise<void>
  confirmTurnoAudit(turnoId, auditorId): Promise<void>
  confirmTransaccionAudit(transaccionId, auditorId): Promise<void>
  getAuditoriaStats(): Promise<void>
}
```

---

#### useNegocios.ts
```typescript
export const useNegocios = () => {
  negocios: Negocio[]
  isLoading: boolean
  error: string | null

  getNegociosByUser(userId: number): Promise<void>
  clearError(): void
  reset(): void
}
```

---

### 🔗 API Services (src/api/)

#### httpClient.ts
```typescript
const httpClient = {
  async invoke<T>(channel: string, ...args): Promise<T>
}
```

**Lógica:**
1. Llama `window.electron.ipcRenderer.invoke()`
2. Espera respuesta con timeout de 30s
3. Si respuesta tiene `success` field → retorna todo el objeto
4. Si no → retorna `data`
5. Si hay error → lanza excepción

---

#### turnoService.ts
```typescript
export const turnoService = {
  async initTurno(negocioId): Promise<Turno>
  async getCurrentTurno(negocioId): Promise<Turno | null>
  async getTurno(turnoId): Promise<Turno>
  async closeTurno(turnoId): Promise<Turno>
  async getTurnosByDay(diaContableId): Promise<Turno[]>
  async getTurnosHistory(limit, offset): Promise<Turno[]>
  async confirmTurnoAudit(turnoId, auditorId): Promise<Turno>
}
```

---

#### transaccionService.ts
```typescript
export const transaccionService = {
  async createTransaccion(turnoId, valor, categoria, ...): Promise<Transaccion>
  async getTransaccionesByTurno(turnoId): Promise<Transaccion[]>
  async getTransacciones(limit?, offset?): Promise<Transaccion[]>
  async getTransaccionesByCategory(categoria): Promise<Transaccion[]>
  async updateTransaccion(...): Promise<Transaccion>
  async deleteTransaccion(id): Promise<void>
  async confirmTransaccionAudit(id, auditorId): Promise<Transaccion>
  async getDaySummary(diaContableId): Promise<DaySummary>
}
```

---

#### catalogoService.ts
```typescript
export const catalogoService = {
  // PROVEEDORES
  async getProveedores(negocioId?): Promise<Proveedor[]>
  async createProveedor(negocioId, nombre): Promise<Proveedor>
  async updateProveedor(id, nombre, activo): Promise<Proveedor>
  async deleteProveedor(id): Promise<void>

  // TIPOS DE GASTO
  async getTiposGasto(negocioId?): Promise<TipoGasto[]>
  async createTipoGasto(negocioId, nombre): Promise<TipoGasto>
  async updateTipoGasto(id, nombre, activo): Promise<TipoGasto>
  async deleteTipoGasto(id): Promise<void>

  // TIPOS DE PAGO DIGITAL
  async getTiposPagoDigital(negocioId?): Promise<TipoPagoDigital[]>
  async createTipoPagoDigital(negocioId, nombre): Promise<TipoPagoDigital>
  async updateTipoPagoDigital(id, nombre, activo): Promise<TipoPagoDigital>
  async deleteTipoPagoDigital(id): Promise<void>
}
```

---

### 📐 Types (src/types/index.ts)

```typescript
// Autenticación
interface User {
  id: number
  username: string
  nombreCompleto: string
  rol: 'empleado' | 'supervisor' | 'administrador'
  negocioId: number
  turno?: Turno
}

// Turnos
interface Turno {
  id: number
  dia_contable_id: number
  usuario_id: number
  numero_turno: 1 | 2
  estado: 'ABIERTO' | 'CERRADO' | 'REVISADO'
  efectivo_contado?: number
  venta_reportada?: number
  diferencia?: number
  created_at?: string
  updated_at?: string
}

interface DiaContable {
  id: number
  negocio_id: number
  fecha: string
  estado: 'ABIERTO' | 'CERRADO' | 'REVISADO'
}

// Transacciones
type CategoriaTxn = 'PAGO_DIGITAL' | 'GASTO_CAJA' | 'COMPRA_PROV' | 'GASTO_GENERAL' | 'AJUSTE_CAJA'

interface Transaccion {
  id: number
  turno_id: number
  usuario_id: number
  valor: number
  categoria: CategoriaTxn
  concepto?: string
  proveedor_id?: number
  tipo_gasto_id?: number
  tipo_pago_digital_id?: number
  confirmado_auditoria: boolean
  auditor_id?: number
  created_at?: string
  updated_at?: string
}

// Catálogos
interface Proveedor {
  id: number
  negocio_id: number
  nombre: string
  activo: boolean
}

interface TipoGasto {
  id: number
  negocio_id: number
  nombre: string
  activo: boolean
}

interface TipoPagoDigital {
  id: number
  negocio_id: number
  nombre: string
  activo: boolean
}

// Negocio
interface Negocio {
  id: number
  nombre_negocio: string
  direccion?: string
}

interface Miembro {
  usuario_id: number
  negocio_id: number
  rol: 'empleado' | 'supervisor' | 'administrador'
}
```

---

### 🎨 Estilos (src/styles/)

```
src/styles/
├── index.css               # Global reset + fonts
├── App.css                 # Estilos generales
├── components/
│   ├── Button.css
│   ├── Card.css
│   ├── ConfirmDialog.css
│   ├── FormInput.css
│   ├── FormSelect.css
│   ├── Pagination.css
│   ├── Table.css
│   ├── Tooltip.css
│   ├── Header.css
│   ├── Sidebar.css
│   └── DashboardLayout.css
└── screens/
    ├── AdminNegocioSelector.css
    ├── TurnoScreen.css
    ├── TransaccionesScreen.css
    ├── CatalogoScreen.css
    ├── AuditoriaScreen.css
    ├── RevisionScreen.css
    └── GestionScreen.css
```

---

## ⚙️ BACKEND (electron/)

### 📌 Main Process

```
electron/
├── main.ts                 # Electron main process entry
├── preload.ts              # IPC bridge seguro
├── handlers/               # IPC request handlers
├── services/               # Business logic
├── repositories/           # Data access layer
├── database.ts             # PostgreSQL connection
└── security.ts             # Password hashing
```

---

### main.ts
```typescript
// 1. Crea ventana Electron
// 2. Registra todos los handlers (auth, turno, transaccion, catalogo)
// 3. Maneja eventos de app (ready, window-all-closed, etc.)
// 4. En dev: conecta a Vite dev server
// 5. En prod: carga index.html
```

**Handlers registrados:**
- `registerAuthHandlers()` - auth:login
- `registerTurnoHandlers()` - turno:*
- `registerTransaccionHandlers()` - transaccion:*
- `registerCatalogoHandlers()` - catalogo:*

---

### preload.ts
```typescript
// Puente seguro entre renderer (React) e main (Node)
// Context isolation habilitado

export const electronAPI = {
  login(username, password) // wrapper para auth:login
}

// También exporta ipcApi genérico:
ipcRenderer.invoke(channel, ...args)
ipcRenderer.send(channel, ...args)
ipcRenderer.on(channel, callback)
```

---

### handlers/ (Todos en electron/handlers/)

#### authHandlers.ts
```typescript
// Registra: auth:login
async handleLogin(event, { username, password })
  → llama authService.authenticateUser()
  → retorna { success, user, error }
```

---

#### turnoHandlers.ts
```typescript
// Registra:
ipcMain.handle('turno:init', handleInitializeTurno)
ipcMain.handle('turno:current', handleGetCurrentTurno)
ipcMain.handle('turno:get', handleGetTurno)
ipcMain.handle('turno:close', handleCloseTurno)
ipcMain.handle('turno:getByDay', handleGetTurnosByDay)
ipcMain.handle('turno:history', handleGetTurnosHistory)
ipcMain.handle('turno:confirmAudit', handleConfirmTurnoAudit)

// Lógica:
// - Obtener/crear día contable
// - Validar usuario pertenece al negocio
// - Crear/obtener turno
// - Validar reglas de negocio (solo 2 turnos/día, etc.)
```

---

#### transaccionHandlers.ts
```typescript
// Registra:
ipcMain.handle('transaccion:create', handleCreateTransaccion)
ipcMain.handle('transaccion:getByTurno', handleGetTransaccionesByTurno)
ipcMain.handle('transaccion:list', handleListTransacciones)
ipcMain.handle('transaccion:update', handleUpdateTransaccion)
ipcMain.handle('transaccion:delete', handleDeleteTransaccion)
ipcMain.handle('transaccion:confirmAudit', handleConfirmTransaccionAudit)

// Lógica:
// - Validar turno existe y pertenece a usuario
// - Validar valores
// - Insertar/actualizar/eliminar en BD
```

---

#### catalogoHandlers.ts
```typescript
// Registra (9 handlers en total):
// catalogo:getProveedores
// catalogo:createProveedor
// catalogo:updateProveedor
// catalogo:deleteProveedor
// catalogo:getTiposGasto
// catalogo:createTipoGasto
// catalogo:updateTipoGasto
// catalogo:deleteTipoGasto
// catalogo:getTiposPagoDigital
// catalogo:createTipoPagoDigital
// catalogo:updateTipoPagoDigital
// catalogo:deleteTipoPagoDigital

// Lógica:
// - Validar usuario es admin
// - Validar negocioId
// - CRUD en catálogos correspondientes
```

---

### services/ (Lógica de Negocio)

#### authService.ts
```typescript
export const authService = {
  async authenticateUser(username: string, password: string) {
    // 1. Buscar usuario por username (userRepository.findUserByUsername)
    // 2. Validar existe
    // 3. Validar activo
    // 4. Validar contraseña (security.verifyPassword)
    // 5. Obtener membresía (userRepository.findMemberByUserId)
    // 6. Retornar { success, user, error }
  }
}
```

---

### repositories/

#### userRepository.ts
```typescript
export const userRepository = {
  async findUserByUsername(username: string): Promise<UserRecord | null> {
    // SELECT * FROM usuarios WHERE username = $1
  },

  async findMemberByUserId(userId: number): Promise<MemberRecord | null> {
    // SELECT * FROM miembros WHERE usuario_id = $1
  }
}
```

---

### database.ts
```typescript
// Exporta:
query(sql: string, params?: any[])
  → Ejecuta query en PostgreSQL
  → Retorna { rows, rowCount }

// Maneja:
// - Pool connection
// - Error handling
// - Connection lifecycle
```

---

### security.ts
```typescript
// Exporta:
hashPassword(password: string): Promise<string>
  → Usa bcryptjs con 12 rounds

verifyPassword(password: string, hash: string): Promise<boolean>
  → Compara password con hash
```

---

## 🧪 TESTING

### Unit Tests (src/)

```
src/
├── hooks/__tests__/
│   ├── useAuth.test.ts
│   ├── useTurno.test.ts
│   ├── useTransacciones.test.ts
│   └── useCatalogos.test.ts
└── components/Common/__tests__/
    ├── Button.test.tsx
    ├── Card.test.tsx
    ├── Pagination.test.tsx
    └── Tooltip.test.tsx
```

**Config:** `src/setupTests.ts` y `jest.config.js`

---

### E2E Tests (cypress/)

```
cypress/
├── e2e/
│   ├── auth.cy.ts          # Login flow
│   ├── turnos.cy.ts        # Shift management
│   ├── transacciones.cy.ts # Transaction CRUD
│   └── catalogs.cy.ts      # Catalog management
├── fixtures/               # Test data
├── support/                # Custom commands
└── config.ts               # Cypress config
```

**Config:** `cypress.config.ts`

---

## 📜 Flujos Principales

### 1️⃣ LOGIN
```
LoginForm.tsx
  ↓ useAuth.login()
    ↓ authService.authenticateUser()
      ↓ [Backend] turno:init
        ↓ userRepository.findUserByUsername()
          ↓ userRepository.findMemberByUserId()
      ↓ security.verifyPassword()
  ↓ localStorage.setItem('user', ...)
  ↓ App.tsx renderiza MainApp
```

### 2️⃣ CREAR TURNO
```
TurnoScreen.tsx → handleCreateTurno
  ↓ useTurno.initTurno(negocioId)
    ↓ turnoService.initTurno()
      ↓ [Backend] turno:init
        ↓ Buscar/crear dia_contable
        ↓ Validar reglas (máx 2 turnos)
        ↓ Crear turno
```

### 3️⃣ AGREGAR TRANSACCIÓN
```
TurnoScreen.tsx → handleCreateTransaccion
  ↓ useTransacciones.createTransaccion()
    ↓ transaccionService.createTransaccion()
      ↓ [Backend] transaccion:create
        ↓ Validar turno existe
        ↓ Validar usuario creador
        ↓ Insertar transacción
```

### 4️⃣ CERRAR TURNO
```
TurnoScreen.tsx → handleCloseTurno
  ↓ useTurno.closeTurno(turnoId)
    ↓ turnoService.closeTurno()
      ↓ [Backend] turno:close
        ↓ Validar turno ABIERTO
        ↓ Actualizar estado a CERRADO
```

### 5️⃣ REVISAR DÍA
```
RevisionScreen.tsx → handleReviewDay
  ↓ [Backend] dia-contable:review
    ↓ Validar todos turnos CERRADOS
    ↓ Validar transacciones auditadas
    ↓ Cambiar estado a REVISADO
```

---

## 🔍 Cómo Buscar Cosas

### "¿Dónde está la lógica para crear un turno?"
1. **Frontend:** `src/screens/TurnoScreen.tsx` - línea ~100 `handleCreateTurnoConfirm()`
2. **Hook:** `src/hooks/useTurno.ts` - `initTurno()` method
3. **Service:** `src/api/turnoService.ts` - `initTurno()`
4. **Backend:** `electron/handlers/turnoHandlers.ts` - `handleInitializeTurno()`

### "¿Dónde está la validación de usuario?"
1. **Backend:** `electron/services/authService.ts` - `authenticateUser()`
2. **Security:** `electron/security.ts` - `verifyPassword()`

### "¿Dónde están las reglas de negocio?"
1. **Documentación:** `docs/REGLAS-DE-NEGOCIO-TURNO.md`
2. **Implementación:** `electron/handlers/*.ts`
3. **Frontend:** `src/screens/*.tsx` (renderizado condicional por rol)

### "¿Dónde están los estilos?"
1. **Global:** `src/styles/index.css`, `src/styles/App.css`
2. **Componentes:** `src/styles/components/*.css`
3. **Pantallas:** `src/styles/screens/*.css`

---

## 📋 Checklist Rápido

### Si necesitas agregar una nueva característica:

- [ ] Crear tipo en `src/types/index.ts`
- [ ] Crear servicio en `src/api/` si necesita llamada al backend
- [ ] Crear hook en `src/hooks/` si necesita estado compartido
- [ ] Crear handler en `electron/handlers/` si necesita backend
- [ ] Crear o modificar pantalla en `src/screens/`
- [ ] Crear CSS en `src/styles/screens/`
- [ ] Agregar tests en `src/__tests__/` o `cypress/`
- [ ] Documentar en `docs/`

### Si necesitas debuggear:

1. **Frontend:** Abre DevTools (F12) en Electron
2. **Backend:** Agrega `console.log()` en handlers, verifica en terminal
3. **Database:** Conéctate con `psql` y ejecuta queries
4. **IPC:** Usa DevTools de Electron para ver mensajes IPC

---

**Este documento es una referencia rápida. Para detalles, consulta los documentos específicos en `/docs/`**

**Última actualización:** Noviembre 2025
