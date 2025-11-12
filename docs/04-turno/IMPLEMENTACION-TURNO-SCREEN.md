# 📋 Implementación - TurnoScreen y Admin Negocio Selector

## Resumen Ejecutivo

Se ha implementado la lógica completa de negocio para la pantalla de turnos con diferentes flujos según el rol del usuario y un selector de negocio para administradores con múltiples sucursales.

## Componentes Creados

### 1. TurnoScreen (`src/screens/TurnoScreen.tsx`)

Pantalla principal que muestra la información del turno según el rol del usuario.

**Lógica de Negocio:**

#### EMPLEADO
- **Sin turno**: Mostrar botón "Crear Turno"
- **Con turno propio**:
  - Ver detalles (efectivo, POS, diferencia)
  - Botón "Cerrar Turno" (si está ABIERTO)
  - Botón "Ver Transacciones"
- **Turno de otro empleado**:
  - Mostrar alerta "Turno ya creado por otro empleado"
  - Solo lectura
  - Botón "Ver Transacciones"

#### SUPERVISOR
- Ver todos los turnos del día
- Ver detalles de cada turno
- Botón "Revisar Día" (solo si turno está CERRADO)
- Botón "Ver Transacciones"

#### ADMIN
- **Modo Recuperación** (sin datos):
  - Mostrar botón "Crear Turno Manual"
  - Permite inicializar si no hay turnos ese día
- **Con datos**:
  - Ver solo lectura
  - Botón "Ver Transacciones"
  - Información de quien creó el turno

**Props:**
```typescript
interface TurnoScreenProps {
  user: User;                    // Usuario autenticado con negocioId
  onNavigate?: (screen: string) => void;  // Callback para cambiar de pantalla
}
```

**Estados Manejados:**
- `turno`: Turno actual o null
- `isLoading`: Estado de carga
- `error`: Mensajes de error
- `success`: Mensajes de éxito

### 2. AdminNegocioSelector (`src/screens/AdminNegocioSelector.tsx`)

Pantalla de selección de negocio para administradores con múltiples sucursales.

**Cuándo se muestra:**
- El usuario tiene rol `administrador`
- Está asignado a 2 o más negocios
- No ha seleccionado un negocio aún

**Características:**
- Grid responsivo de tarjetas (cada una con nombre de negocio + rol)
- Botón "Seleccionar" para cada negocio
- Carga asincrónica de negocios
- Estados: cargando, error, vacío

**Props:**
```typescript
interface AdminNegocioSelectorProps {
  user: User;                          // Usuario autenticado
  onSelect: (negocioId: number) => void;  // Callback con negocioId seleccionado
}
```

### 3. useNegocios Hook (`src/hooks/useNegocios.ts`)

Hook personalizado para obtener los negocios de un usuario.

**Métodos:**
```typescript
getNegociosByUser(userId: number): Promise<void>
clearError(): void
reset(): void
```

**Estado:**
```typescript
{
  negocios: Negocio[],  // Array de negocios asignados
  isLoading: boolean,
  error: string | null
}
```

## Actualizaciones a Componentes Existentes

### 1. MainApp (`src/components/MainApp.tsx`)

**Cambios principales:**
- Integración de `AdminNegocioSelector` y `TurnoScreen`
- Gestión de `selectedNegocioId` (estado local)
- Routing por `currentScreen`
- Carga de negocios si es admin

**Flujo:**
1. Admin loguea → Si tiene 2+ negocios → Mostrar selector
2. Selecciona negocio → Mostrar dashboard
3. Dashboard muestra TurnoScreen por defecto
4. Navegación entre pantallas según rol

### 2. useTurno Hook (`src/hooks/useTurno.ts`)

**Cambios:**
- `initTurno(negocioId)` - Requiere negocioId
- `getCurrentTurno(negocioId)` - Requiere negocioId
- `closeTurno(turnoId)` - Simplificado (solo turnoId)
- Devuelve `{ success: boolean, message?: string }` en init/close

### 3. turnoService (`src/api/turnoService.ts`)

**Cambios:**
- `initTurno(negocioId)` - Pasa negocioId al backend
- `getCurrentTurno(negocioId)` - Pasa negocioId al backend
- `closeTurno(turnoId)` - Simplificado

## Estilos CSS

### TurnoScreen.css (`src/styles/screens/TurnoScreen.css`)
- Layout flexbox por rol
- Tarjetas de información con fondo secundario
- Mensajes de error y éxito con colores destacados
- Alerta especial para "turno ya creado por otro"
- Responsivo (768px breakpoint)

### AdminNegocioSelector.css (`src/styles/screens/AdminNegocioSelector.css`)
- Pantalla full-screen con gradiente de fondo
- Grid de negocio responsivo (auto-fit, minmax 280px)
- Tarjetas con efecto hover (borde color primario, sombra)
- Responsive (768px breakpoint)
- Centrado vertical y horizontal

## Integración con el Sistema

### Flujo Completo de Login

```
1. LoginForm (username + password)
   ↓
2. useAuth hook (verifica credenciales en BD)
   ↓
3. App.tsx muestra MainApp
   ↓
4. MainApp verifica si es admin con múltiples negocios
   ├─ SI → Mostrar AdminNegocioSelector
   │  └─ Usuario selecciona negocio → setSelectedNegocioId
   │
   └─ NO → Mostrar DashboardLayout + TurnoScreen
      ↓
5. DashboardLayout contiene:
   - Sidebar (menú según rol)
   - Header (título + usuario)
   - Contenido (diferentes pantallas según currentScreen)
      ↓
6. TurnoScreen maneja:
   - Carga de turno actual (useTurno hook)
   - Renderizado según rol
   - Acciones (crear, cerrar, ver transacciones)
```

### Integración de Hooks

```
MainApp
├── useNegocios (obtener negocios si es admin)
└── DashboardLayout
    └── TurnoScreen
        └── useTurno (obtener/crear/cerrar turno)
```

## Base de Datos - Consultas Esperadas

### Para getCurrentTurno
```sql
SELECT t.* FROM turnos t
JOIN dias_contables d ON t.dia_contable_id = d.id
WHERE d.negocio_id = ?
  AND d.fecha = CURRENT_DATE
LIMIT 1
```

### Para initTurno
```sql
-- Crear dia_contable si no existe
INSERT INTO dias_contables (negocio_id, fecha, estado)
VALUES (?, CURRENT_DATE, 'ABIERTO')
ON CONFLICT DO NOTHING

-- Crear turno
INSERT INTO turnos (dia_contable_id, usuario_id, numero_turno, estado)
VALUES (?, ?, 1, 'ABIERTO')
```

### Para closeTurno
```sql
UPDATE turnos
SET estado = 'CERRADO'
WHERE id = ?
```

### Para getNegociosByUser
```sql
SELECT
  n.id,
  n.nombre_negocio,
  m.rol
FROM miembros m
JOIN negocios n ON m.negocio_id = n.id
WHERE m.usuario_id = ?
```

## Variables de Ambiente

No se requieren nuevas variables de ambiente.

## Testing Manual

### Caso 1: Empleado sin Turno
1. Login con `empleado1` / `empleado123`
2. Debe mostrar: "No existe turno registrado para hoy"
3. Botón "Crear Turno" disponible
4. Click en "Crear Turno" → Crear nuevo turno
5. Turno debe mostrar estado "ABIERTO"

### Caso 2: Empleado con Turno Propio
1. Login con `empleado1` después de crear turno (caso anterior)
2. Debe mostrar: Detalles del turno + "Cerrar Turno"
3. Click en "Cerrar Turno" → Estado cambia a "CERRADO"

### Caso 3: Segundo Empleado
1. Login con `empleado2` / `empleado123`
2. Debe mostrar: Alerta "Turno ya creado por otro empleado"
3. NO debe haber botón "Crear Turno"
4. Ver detalles del turno creado por empleado1

### Caso 4: Supervisor
1. Login con `supervisor` / `supervisor123`
2. Debe mostrar: Detalles del turno
3. Si turno está CERRADO → Botón "Revisar Día"
4. Puede ver transacciones

### Caso 5: Admin con 1 Negocio
1. Login con `admin` / `admin123`
2. NO debe mostrar selector
3. Ir directamente a TurnoScreen
4. Si no hay turno → "Crear Turno Manual" disponible
5. Puede crear turno para recuperación

### Caso 6: Admin con 2+ Negocios (Futuro)
1. Crear segundo usuario admin con otro negocio en BD
2. Login → Mostrar AdminNegocioSelector
3. Grid con 2 tarjetas
4. Click en una → Ir a TurnoScreen de ese negocio

## Pendiente: Backend

Para que esto funcione completamente, el backend debe implementar estos IPC handlers:

### Handlers esperados

```javascript
// turnoService handlers
ipcMain.handle('turno:init', (event, negocioId) => {})
ipcMain.handle('turno:current', (event, negocioId) => {})
ipcMain.handle('turno:close', (event, turnoId) => {})

// negocioService handlers
ipcMain.handle('negocio:getByUser', (event, userId) => {})
```

## Notas de Desarrollo

1. **negocioId es crítico**: Cada operación de turno necesita saber a qué negocio pertenece
2. **usuario_id en BD**: El campo `usuario_id` en tabla `turnos` es quien creó el turno (empleado)
3. **Validaciones**:
   - Empleado NO puede crear si ya existe turno ese día
   - Admin PUEDE crear si no hay datos ese día
   - Admin NO puede borrar si hay transacciones
4. **Estados de Turno**: ABIERTO, CERRADO, REVISADO
5. **Validación visual**: Usar íconos y colores para estado (✅ cerrado, ⏳ abierto, 🔍 revisado)

## Próximos Pasos

1. ✅ TurnoScreen con lógica por rol
2. ✅ AdminNegocioSelector para múltiples negocios
3. ⏳ TransaccionesScreen (pantalla de transacciones)
4. ⏳ RevisionScreen (revisión de día para supervisor)
5. ⏳ AuditoriaScreen (auditoría para supervisor/admin)
6. ⏳ GestionScreen (gestión de negocio para admin)
7. ⏳ CatalogoScreen (gestión de catálogos para admin)
8. ⏳ Persistencia de negocio seleccionado en localStorage
9. ⏳ Cambiar de negocio desde sidebar (para admin)

## Cambios de Archivo

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `src/screens/TurnoScreen.tsx` | Nuevo | Pantalla principal de turnos |
| `src/screens/AdminNegocioSelector.tsx` | Nuevo | Selector de negocio para admin |
| `src/hooks/useNegocios.ts` | Nuevo | Hook para obtener negocios |
| `src/styles/screens/TurnoScreen.css` | Nuevo | Estilos de TurnoScreen |
| `src/styles/screens/AdminNegocioSelector.css` | Nuevo | Estilos de AdminNegocioSelector |
| `src/hooks/useTurno.ts` | Modificado | Parámetros de negocioId |
| `src/api/turnoService.ts` | Modificado | Parámetros de negocioId |
| `src/components/MainApp.tsx` | Modificado | Integración de screens |
| `src/components/Layout/Sidebar.tsx` | Sin cambios | Ya tiene menú por rol |
