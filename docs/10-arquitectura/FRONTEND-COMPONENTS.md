# 📦 Componentes Frontend de GestorPyME

Documentación de la arquitectura de componentes compartidos (shared components) para el frontend de GestorPyME Desktop.

## 🎯 Resumen General

Se han creado componentes reutilizables que forman la base de toda la aplicación frontend. Estos componentes están organizados en:

- **Componentes Comunes** (`src/components/Common/`) - Elementos reutilizables
- **Componentes de Layout** (`src/components/Layout/`) - Estructura de páginas
- **Hooks Personalizados** (`src/hooks/`) - Lógica de negocio
- **Servicios de API** (`src/api/`) - Comunicación con backend
- **Estilos Compartidos** (`styles/components/`) - CSS centralizado

---

## 📂 Estructura de Carpetas

```
src/
├── components/
│   ├── Common/
│   │   ├── Button.tsx           ✓ Botón versátil
│   │   ├── Card.tsx             ✓ Tarjeta contenedora
│   │   ├── FormInput.tsx         ✓ Input de formulario
│   │   ├── FormSelect.tsx        ✓ Select/Dropdown
│   │   ├── Table.tsx             ✓ Tabla con features
│   │   └── README.md             ✓ Documentación
│   ├── Layout/
│   │   ├── DashboardLayout.tsx   ✓ Layout principal
│   │   ├── Header.tsx            ✓ Encabezado superior
│   │   └── Sidebar.tsx           ✓ Barra lateral navegación
│   ├── LoginForm.tsx             (existente)
│   ├── MainApp.tsx               (existente)
│   └── App.tsx                   (existente)
├── api/
│   ├── httpClient.ts             ✓ Cliente HTTP para IPC
│   ├── turnoService.ts           ✓ Servicios de Turnos
│   ├── transaccionService.ts     ✓ Servicios de Transacciones
│   ├── catalogoService.ts        ✓ Servicios de Catálogos
│   └── index.ts                  ✓ Exportaciones centrales
├── hooks/
│   ├── useAuth.ts                (existente)
│   ├── useTurno.ts               ✓ Hook para Turnos
│   ├── useTransacciones.ts       ✓ Hook para Transacciones
│   ├── useAuditoria.ts           ✓ Hook para Auditoría
│   └── README.md                 ✓ Documentación
└── types/
    └── index.ts                  (existente con tipos completos)

styles/
├── components/
│   ├── Button.css                ✓
│   ├── Card.css                  ✓
│   ├── DashboardLayout.css        ✓
│   ├── FormInput.css              ✓
│   ├── FormSelect.css             ✓
│   ├── Header.css                 ✓
│   ├── Sidebar.css                ✓
│   └── Table.css                  ✓
```

---

## 🎨 Componentes Comunes

### 1. Button
**Archivo:** `src/components/Common/Button.tsx`

Botón versátil con múltiples variantes y tamaños.

```tsx
import Button from '../components/Common/Button';

<Button variant="primary" size="medium" onClick={handleClick}>
  Acción
</Button>
```

**Variantes:**
- `primary` (azul) - Acciones principales
- `danger` (rojo) - Eliminar, logout
- `success` (amarillo) - Confirmar, guardar
- `secondary` (gris) - Acciones secundarias

**Tamaños:**
- `small` (32px)
- `medium` (40px)
- `large` (48px)

**Características:**
- Loading spinner automático
- Full width opcional
- Disabled state
- Transiciones suaves

---

### 2. FormInput
**Archivo:** `src/components/Common/FormInput.tsx`

Input de texto con validación integrada.

```tsx
<FormInput
  label="Usuario"
  type="email"
  error={errors.email}
  helperText="Usa tu correo de empresa"
  required
/>
```

**Props principales:**
- `label` - Etiqueta del campo
- `error` - Mensaje de error
- `helperText` - Texto de ayuda
- `required` - Marca como requerido

---

### 3. FormSelect
**Archivo:** `src/components/Common/FormSelect.tsx`

Dropdown con opciones personalizadas.

```tsx
<FormSelect
  label="Tipo de Gasto"
  options={[
    { value: 1, label: 'Compra a Proveedor' },
    { value: 2, label: 'Gasto General' }
  ]}
  value={selectedId}
  onChange={handleChange}
/>
```

**Props:**
- `options` - Array de {value, label}
- `placeholder` - Texto inicial
- `label`, `error`, `helperText` - Como FormInput

---

### 4. Table
**Archivo:** `src/components/Common/Table.tsx`

Tabla compleja con soporte para sorting, selección y custom rendering.

```tsx
const columns: TableColumn<Transaccion>[] = [
  { key: 'id', header: 'ID', width: '80px' },
  {
    key: 'valor',
    header: 'Monto',
    render: (val) => `$${val.toLocaleString('es-CO')}`
  },
  { key: 'categoria', header: 'Categoría' }
];

<Table
  columns={columns}
  data={transacciones}
  selectable
  sortable
  onSort={handleSort}
  onRowClick={handleRowClick}
/>
```

**Características:**
- Sorting por columnas
- Selección múltiple con checkboxes
- Rendering personalizado por celda
- Estado de carga
- Mensaje cuando no hay datos
- Responsive

---

### 5. Card
**Archivo:** `src/components/Common/Card.tsx`

Tarjeta contenedora para agrupar contenido.

```tsx
<Card
  title="Resumen del Turno"
  subtitle="Martes, 6 de Noviembre"
  elevated
>
  <p>Contenido aquí</p>
  <Card footer={<Button>Guardar</Button>} />
</Card>
```

**Props:**
- `title` - Título de la tarjeta
- `subtitle` - Subtítulo
- `footer` - Contenido del pie
- `noPadding` - Sin espacios internos
- `elevated` - Sombra más prominente

---

## 🏗️ Componentes de Layout

### 1. DashboardLayout
**Archivo:** `src/components/Layout/DashboardLayout.tsx`

Layout principal que integra Sidebar, Header y contenido.

```tsx
<DashboardLayout
  user={user}
  title="Mi Turno"
  currentScreen="turno"
  onNavigate={handleNavigate}
  onLogout={handleLogout}
>
  {/* Contenido aquí */}
</DashboardLayout>
```

**Estructura:**
```
┌─────────────────────────────┐
│ HEADER (user, status, logout)│
├────────────────────────────┐│
│ SIDEBAR │    CONTENIDO      ││
│ • Mi Turno                  ││
│ • Transacciones             ││
│ • Revision (supervisor)     ││
│ • Auditoría (admin)         ││
│ • Gestión (admin)           ││
└────────────────────────────┘│
```

---

### 2. Header
**Archivo:** `src/components/Layout/Header.tsx`

Encabezado superior con información del usuario y estado del turno.

```tsx
<Header
  user={user}
  title="Mi Turno"
  onLogout={handleLogout}
  showBackButton={true}
  onBack={handleBack}
/>
```

**Muestra:**
- Título de la página
- Estado del turno actual (Abierto/Cerrado/Revisado)
- Nombre y rol del usuario
- Botón para cerrar sesión

---

### 3. Sidebar
**Archivo:** `src/components/Layout/Sidebar.tsx`

Barra lateral con navegación y estado del usuario.

```tsx
<Sidebar
  user={user}
  currentScreen="turno"
  onNavigate={handleNavigate}
  onLogout={handleLogout}
/>
```

**Características:**
- Avatar y nombre de usuario
- Rol y fecha actual
- Estado del turno activo (T1, T2, etc)
- Menú de navegación (diferentes según rol)
- Botón para colapsar/expandir
- Botón de logout

**Menú por rol:**
- **Empleado**: Mi Turno, Transacciones
- **Supervisor**: + Revisión de Día, Auditoría
- **Administrador**: + Gestión Negocio, Catálogos

---

## 🔌 API Services

### httpClient
**Archivo:** `src/api/httpClient.ts`

Cliente HTTP que abstrae comunicación con Electron IPC.

```tsx
import { httpClient } from '../api';

const data = await httpClient.invoke<User>('auth:login', username, password);
```

**Características:**
- Timeout automático (30s)
- Manejo de errores
- Type-safe responses
- Logging de errores

---

### turnoService
**Archivo:** `src/api/turnoService.ts`

Operaciones relacionadas con turnos.

```tsx
await turnoService.initTurno();
await turnoService.closeTurno(turnoId, efectivo, venta);
await turnoService.getTurnosByDay(diaContableId);
```

**Métodos:**
- `initTurno()` - Crear nuevo turno
- `getCurrentTurno()` - Obtener turno actual
- `closeTurno(id, efectivo, venta)` - Cerrar turno
- `getTurnosByDay(id)` - Turnos del día
- `getTurnosHistory(limit, offset)` - Historial
- `confirmTurnoAudit(id, auditorId)` - Confirmar auditoría

---

### transaccionService
**Archivo:** `src/api/transaccionService.ts`

Operaciones con transacciones.

```tsx
await transaccionService.createTransaccion(
  turnoId,
  valor,
  'GASTO_CAJA',
  'Compra de papel',
  null,
  tipoGastoId
);
```

**Métodos:**
- `createTransaccion(...)` - Crear transacción
- `getTransaccionesByTurno(id)` - Obtener por turno
- `updateTransaccion(...)` - Actualizar
- `deleteTransaccion(id)` - Eliminar
- `confirmTransaccionAudit(id, auditorId)` - Auditoría

---

### catalogoService
**Archivo:** `src/api/catalogoService.ts`

Operaciones con catálogos (Proveedores, Gastos, Pagos).

```tsx
const proveedores = await catalogoService.getProveedores();
const tiposGasto = await catalogoService.getTiposGasto();
const tiposPago = await catalogoService.getTiposPagoDigital();
```

---

## 🪝 Custom Hooks

### useTurno
**Archivo:** `src/hooks/useTurno.ts`

Gestión de estado y lógica de turnos.

```tsx
const { turno, isLoading, error, initTurno, closeTurno } = useTurno();

await initTurno();
await closeTurno(efectivo, venta);
```

**Retorna:**
- `turno: Turno | null`
- `isLoading: boolean`
- `error: string | null`
- `success: boolean`
- Métodos: `initTurno()`, `closeTurno()`, `refresh()`, `reset()`

---

### useTransacciones
**Archivo:** `src/hooks/useTransacciones.ts`

Gestión de transacciones.

```tsx
const { transacciones, createTransaccion, getTransaccionesByTurno } = useTransacciones();

await getTransaccionesByTurno(turnoId);
await createTransaccion(turnoId, 100, 'GASTO_CAJA');
```

---

### useAuditoria
**Archivo:** `src/hooks/useAuditoria.ts`

Gestión de auditoría para supervisores y admins.

```tsx
const { turnos, stats, confirmTurnoAudit } = useAuditoria();

// stats contiene:
// - totalTransacciones
// - transaccionesConfirmadas
// - diferenciasEncontradas
// - totalAuditado
```

---

## 🎨 Sistema de Estilos

### Variables CSS Globales
Definidas en cada archivo CSS con `:root`:

```css
--color-primary: #007bff      /* Azul */
--color-danger: #dc3545        /* Rojo */
--color-success: #ffc107       /* Amarillo */
--color-secondary: #6c757d     /* Gris */

--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem

--border-radius: 4px
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

### Responsive Design
Todos los componentes incluyen media queries:
- `@media (max-width: 1200px)` - Desktop grande
- `@media (max-width: 768px)` - Tablet
- `@media (max-width: 480px)` - Mobile

---

## 📋 Ejemplos de Uso Completo

### Pantalla de Transacciones

```tsx
import { useTurno } from '../hooks/useTurno';
import { useTransacciones } from '../hooks/useTransacciones';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Table from '../components/Common/Table';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';

export const TransaccionesScreen: React.FC<{
  user: User;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const { turno } = useTurno();
  const { transacciones, createTransaccion, getTransaccionesByTurno } = useTransacciones();

  useEffect(() => {
    if (turno) {
      getTransaccionesByTurno(turno.id);
    }
  }, [turno]);

  return (
    <DashboardLayout
      user={user}
      title="Transacciones"
      currentScreen="transacciones"
      onLogout={onLogout}
    >
      <Card title="Registro de Transacciones" elevated>
        <Table
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'valor', header: 'Monto' },
            { key: 'categoria', header: 'Tipo' }
          ]}
          data={transacciones}
        />
      </Card>
    </DashboardLayout>
  );
};
```

---

## 🚀 Próximos Pasos

1. **Crear Pantallas Específicas:**
   - `TurnoScreen` - Ver y manejar turno actual
   - `TransaccionesScreen` - Crear y ver transacciones
   - `RevisionScreen` - Revisar día (supervisor)
   - `AuditoriaScreen` - Auditar datos (admin)
   - `CatalogoScreen` - Gestionar catálogos (admin)

2. **Mejorar LoginForm:**
   - Usar FormInput
   - Mejor diseño
   - Validación mejorada

3. **Implementar Enrutamiento:**
   - React Router para navegación
   - Proteger rutas según rol

4. **Testing:**
   - Tests unitarios de componentes
   - Tests de hooks
   - Tests de integración

---

## 📚 Documentación Adicional

- **Componentes**: Ver `src/components/Common/README.md`
- **Hooks**: Ver `src/hooks/README.md`
- **Tipos**: Ver `src/types/index.ts`

