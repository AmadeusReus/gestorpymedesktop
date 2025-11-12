# 🏛️ Arquitectura Frontend - GestorPyME Desktop

Documentación completa de la arquitectura y patrones del frontend de GestorPyME.

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                     APP.TSX                          │
│            (Orquestador Principal)                   │
└─────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │      useAuth Hook               │
        │   (Gestión de autenticación)    │
        └─────────────────────────────────┘
                          ↓
        ┌──────────────────────────────────────┐
        │  ¿Está autenticado?                  │
        └──────────────────────────────────────┘
          │                           │
      NO  │                           │  SÍ
          ↓                           ↓
   ┌─────────────┐            ┌──────────────────┐
   │  LoginForm  │            │ DashboardLayout  │
   └─────────────┘            ├──────────────────┤
                              │ Sidebar +        │
                              │ Header +         │
                              │ Content Area     │
                              └──────────────────┘
                                      ↓
                    ┌──────────────────────────────────┐
                    │  Page Components                  │
                    │ (TurnoScreen, TransaccionesScreen │
                    │  RevisionScreen, AuditoriaScreen) │
                    └──────────────────────────────────┘
                                      ↓
                    ┌──────────────────────────────────┐
                    │  Custom Hooks                     │
                    │ (useTurno, useTransacciones,      │
                    │  useAuditoria)                    │
                    └──────────────────────────────────┘
                                      ↓
                    ┌──────────────────────────────────┐
                    │  API Services                     │
                    │ (turnoService, transaccionService │
                    │  catalogoService)                 │
                    └──────────────────────────────────┘
                                      ↓
                    ┌──────────────────────────────────┐
                    │  httpClient (IPC)                │
                    │  → Electron Main Process         │
                    └──────────────────────────────────┘
```

---

## 🎯 Principios de Diseño

### 1. **Separación de Responsabilidades**

Cada capa tiene una responsabilidad clara:

| Capa | Responsabilidad | Ejemplos |
|------|-----------------|----------|
| **Components** | Render UI | Button, Card, Table |
| **Hooks** | Lógica de estado | useTurno, useTransacciones |
| **Services** | Comunicación con backend | turnoService, transaccionService |
| **Types** | Definiciones de tipos | User, Turno, Transaccion |

### 2. **Composición sobre Herencia**

Los componentes se construyen combinando componentes más pequeños:

```tsx
// ❌ Evitar: Componentes monolíticos
<TurnoScreenWithEverything />

// ✅ Preferir: Composición
<DashboardLayout>
  <Card>
    <Table data={transacciones} />
  </Card>
</DashboardLayout>
```

### 3. **Props de Controlado**

Los componentes son controlados por sus padres:

```tsx
// ✅ Componente controlado
<FormInput
  value={turno.numero_turno}
  onChange={(e) => setTurno({ ...turno, numero_turno: e.target.value })}
/>
```

### 4. **Hooks para Lógica Compartida**

Reutilizar lógica a través de hooks:

```tsx
// En múltiples componentes
const { transacciones, createTransaccion } = useTransacciones();
```

---

## 📁 Estructura de Capas

### Capa 1: Presentación (Componentes)

```
src/components/
├── Common/          # Componentes reutilizables
│   ├── Button.tsx
│   ├── Table.tsx
│   ├── FormInput.tsx
│   ├── FormSelect.tsx
│   ├── Card.tsx
│   └── index.ts
├── Layout/          # Estructura de páginas
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── index.ts
├── Pages/           # Pantallas completas (a crear)
│   ├── TurnoScreen.tsx
│   ├── TransaccionesScreen.tsx
│   ├── RevisionScreen.tsx
│   ├── AuditoriaScreen.tsx
│   └── CatalogoScreen.tsx
├── LoginForm.tsx    # Pantalla de login
├── MainApp.tsx      # Enrutador
└── App.tsx          # Root component
```

**Responsabilidades:**
- Render de UI
- Manejo de eventos del usuario
- Llamadas a hooks para obtener estado

---

### Capa 2: Lógica de Estado (Hooks)

```
src/hooks/
├── useAuth.ts            # Autenticación
├── useTurno.ts           # Lógica de turnos
├── useTransacciones.ts   # Lógica de transacciones
├── useAuditoria.ts       # Lógica de auditoría
├── index.ts              # Exportaciones
└── README.md
```

**Responsabilidades:**
- Gestión de estado (`useState`)
- Efectos secundarios (`useEffect`)
- Callbacks memoizados (`useCallback`)
- Llamadas a servicios de API

**Patrón:**
```tsx
const useMiHook = () => {
  const [state, setState] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const action = useCallback(async () => {
    setLoading(true);
    try {
      const result = await miService.hacerAlgo();
      setState(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, error, action };
};
```

---

### Capa 3: Acceso a Datos (API Services)

```
src/api/
├── httpClient.ts         # Cliente HTTP (IPC)
├── turnoService.ts       # Operaciones de turnos
├── transaccionService.ts # Operaciones de transacciones
├── catalogoService.ts    # Operaciones de catálogos
└── index.ts
```

**Responsabilidades:**
- Comunicación con Electron IPC
- Llamadas a handlers del main process
- Manejo de timeouts
- Formateo de respuestas

**Patrón:**
```tsx
const miService = {
  async getRecurso(id: number): Promise<Recurso> {
    return httpClient.invoke<Recurso>('recurso:get', id);
  },

  async createRecurso(data: unknown): Promise<Recurso> {
    return httpClient.invoke<Recurso>('recurso:create', data);
  }
};
```

---

### Capa 4: Tipos (Type Definitions)

```
src/types/
└── index.ts  # Todas las interfaces TypeScript
```

**Define:**
- Tipos de datos (User, Turno, Transaccion, etc.)
- Respuestas de API
- Props de componentes
- Estados del UI

---

## 🔄 Flujo de Datos

### Flujo Típico: Crear una Transacción

```
Usuario hace click en "Crear Transacción"
           ↓
   TransaccionesScreen.tsx
   (Componente de página)
           ↓
   <FormInput value={...} onChange={...} />
           ↓
   setFormData() - Actualiza estado local
           ↓
   onClick={handleCreate}
           ↓
   transaccionService.createTransaccion(...)
   (Llamada a servicio)
           ↓
   httpClient.invoke('transaccion:create', ...)
   (Comunicación con Electron IPC)
           ↓
   Main Process maneja 'transaccion:create'
   (Backend - Node.js)
           ↓
   Ejecuta lógica en BD
           ↓
   Retorna respuesta al Renderer
           ↓
   useTransacciones hook actualiza estado
           ↓
   Componente re-renderiza con nuevos datos
           ↓
   Usuario ve la transacción creada
```

---

## 🎨 Patrones de Componentes

### Patrón 1: Componente Presentacional

```tsx
interface MiComponenteProps {
  titulo: string;
  datos: Dato[];
  onAction: (id: number) => void;
}

const MiComponente: React.FC<MiComponenteProps> = ({
  titulo,
  datos,
  onAction
}) => (
  <div className="mi-componente">
    <h2>{titulo}</h2>
    <ul>
      {datos.map(d => (
        <li key={d.id} onClick={() => onAction(d.id)}>
          {d.nombre}
        </li>
      ))}
    </ul>
  </div>
);
```

**Características:**
- Sin lógica, solo render
- Todo viene por props
- Completamente reutilizable
- Fácil de testear

---

### Patrón 2: Componente Contenedor

```tsx
const MiContenedor: React.FC = () => {
  const { datos, loading, error, obtenerDatos } = useMiHook();

  useEffect(() => {
    obtenerDatos();
  }, []);

  if (error) return <ErrorMessage error={error} />;
  if (loading) return <LoadingSpinner />;

  return <MiComponente datos={datos} onAction={handleAction} />;
};
```

**Características:**
- Maneja lógica
- Usa hooks
- Pasa datos a componentes presentacionales
- Orquesta el flujo

---

## 📊 Estado Global vs Local

### Estado Local (Preferido)

```tsx
// En el componente que lo necesita
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({ ...initialData });
```

✅ **Usar para:**
- Estados UI locales (expandido/colapsado)
- Datos de formularios
- Estados de hover/focus

---

### Estado Compartido (Hooks)

```tsx
// En un hook que se reutiliza
const { turno, initTurno } = useTurno();

// Usado en múltiples componentes
```

✅ **Usar para:**
- Datos que múltiples componentes necesitan
- Datos que persisten entre rutas
- Datos del usuario autenticado

---

## 🚀 Mejores Prácticas

### 1. Props Tipadas

```tsx
// ❌ Evitar
function MiComponente(props: any) { }

// ✅ Hacer
interface MiComponenteProps {
  titulo: string;
  count: number;
  onClose: () => void;
}

function MiComponente({ titulo, count, onClose }: MiComponenteProps) { }
```

### 2. useCallback para Callbacks

```tsx
// ❌ Evitar - Se crea nueva función en cada render
const handleClick = () => { ... }

// ✅ Hacer - Se memoiza
const handleClick = useCallback(() => { ... }, [dependencies])
```

### 3. Manejo de Errores Consistente

```tsx
const { error, clearError } = useTurno();

if (error) {
  return (
    <div className="error">
      <p>{error}</p>
      <Button onClick={clearError}>Aceptar</Button>
    </div>
  );
}
```

### 4. Loading States

```tsx
<Button isLoading={isLoading} onClick={handleClick}>
  Guardar
</Button>
```

### 5. Nombres Descriptivos

```tsx
// ❌ Evitar
const data = await getData();
const d = data.map(x => x.name);

// ✅ Hacer
const transacciones = await transaccionService.getTransacciones();
const descripciones = transacciones.map(t => t.concepto);
```

---

## 🧪 Cómo Testear

### Test de Componente

```tsx
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Test de Hook

```tsx
import { renderHook, act } from '@testing-library/react';
import { useTurno } from '../useTurno';

describe('useTurno Hook', () => {
  it('should initialize turno', async () => {
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      await result.current.initTurno();
    });

    expect(result.current.turno).toBeDefined();
  });
});
```

---

## 📈 Escalabilidad

### Cuando agregues nuevas funcionalidades:

1. **Define tipos** en `src/types/index.ts`
2. **Crea servicio** en `src/api/miNuevaService.ts`
3. **Crea hook** en `src/hooks/useMiNueva.ts`
4. **Crea componentes comunes** si se reutilizan
5. **Crea página** en `src/components/Pages/MiNuevaScreen.tsx`
6. **Agrega rutas** en MainApp.tsx
7. **Testa todo** según el rol del usuario

---

## 🔗 Conexión con Backend

### El flujo completo:

1. **Frontend** llama a `httpClient.invoke()`
2. **Electron Preload** recibe la llamada
3. **IPC** transmite al Main Process
4. **Handler** en `/electron/handlers/` procesa
5. **Service** en `/electron/services/` ejecuta lógica
6. **Repository** en `/electron/repositories/` accede BD
7. **Respuesta** viaja de vuelta al Frontend

**Importante:**
- Los handlers deben estar en `/electron/handlers/`
- Los nombres deben coincidir: `'transaccion:create'` → handler `'transaccion:create'`
- Las respuestas deben tener formato: `{ success, data, error }`

---

## 📚 Documentación Relacionada

- **Componentes**: `docs/FRONTEND-COMPONENTS.md`
- **Tipos**: `src/types/index.ts`
- **Hooks**: `src/hooks/README.md`
- **API Services**: `src/api/index.ts`

