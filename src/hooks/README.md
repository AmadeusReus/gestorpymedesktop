# Custom Hooks

Esta carpeta contiene custom hooks reutilizables para la aplicación.

## Hooks Disponibles

### useAuth
Hook para gestionar la autenticación del usuario.

```tsx
const { user, isLoading, error, login, logout } = useAuth();

if (!user) {
  return <LoginForm onLogin={login} />;
}

return <Dashboard user={user} onLogout={logout} />;
```

**Retorna:**
- `user: User | null` - Usuario autenticado
- `isLoading: boolean` - Cargando login/logout
- `error: string | null` - Mensaje de error
- `login(username, password): Promise<void>` - Iniciar sesión
- `logout(): void` - Cerrar sesión

### useTurno
Hook para gestionar turnos del usuario.

```tsx
const { turno, isLoading, error, initTurno, closeTurno } = useTurno();

// Iniciar turno
await turno.initTurno();

// Cerrar turno
await turno.closeTurno(efectivoCotado, ventaPosReportada);
```

**Retorna:**
- `turno: Turno | null` - Turno actual
- `isLoading: boolean`
- `error: string | null`
- `success: boolean`
- `initTurno(): Promise<void>` - Crear nuevo turno
- `getCurrentTurno(): Promise<void>` - Obtener turno actual
- `closeTurno(efectivo, venta): Promise<void>` - Cerrar turno
- `refresh(): Promise<void>` - Actualizar datos
- `clearError(): void` - Limpiar error
- `reset(): void` - Resetear estado

### useTransacciones
Hook para gestionar transacciones.

```tsx
const { transacciones, createTransaccion, getTransaccionesByTurno } = useTransacciones();

// Obtener transacciones del turno
await getTransaccionesByTurno(turnoId);

// Crear nueva transacción
await createTransaccion(
  turnoId,
  100,
  'GASTO_CAJA',
  'Compra de papel',
  null,
  tipoGastoId
);
```

**Retorna:**
- `transacciones: Transaccion[]` - Lista de transacciones
- `isLoading: boolean`
- `error: string | null`
- `success: boolean`
- `total: number` - Total de transacciones
- `createTransaccion(...): Promise<void>` - Crear transacción
- `getTransaccionesByTurno(turnoId): Promise<void>` - Obtener por turno
- `getTransacciones(limit, offset): Promise<void>` - Obtener todas
- `updateTransaccion(...): Promise<void>` - Actualizar
- `deleteTransaccion(id): Promise<void>` - Eliminar
- `confirmTransaccionAudit(id, auditorId): Promise<void>` - Confirmar auditoría

### useAuditoria
Hook para gestionar auditoría de turnos y transacciones.

```tsx
const { turnos, stats, confirmTurnoAudit } = useAuditoria();

// Obtener turnos del día
await getTurnosByDay(diaContableId);

// Confirmar auditoría
await confirmTurnoAudit(turnoId, auditorId);
```

**Retorna:**
- `turnos: Turno[]` - Turnos bajo auditoría
- `transacciones: Transaccion[]` - Transacciones bajo auditoría
- `stats: AuditoriaStats` - Estadísticas de auditoría
  - `totalTransacciones: number`
  - `transaccionesConfirmadas: number`
  - `transaccionesPendientes: number`
  - `diferenciasEncontradas: number`
  - `totalAuditado: number`
- `isLoading: boolean`
- `error: string | null`
- `success: boolean`
- `getTurnosByDay(diaContableId): Promise<void>`
- `getTransaccionesByTurno(turnoId): Promise<void>`
- `confirmTurnoAudit(turnoId, auditorId): Promise<void>`
- `confirmTransaccionAudit(id, auditorId): Promise<void>`

## Patrones Comunes

### Usar en un componente

```tsx
import { useTurno } from '../hooks/useTurno';
import Button from '../components/Common/Button';

const MiComponente: React.FC = () => {
  const { turno, isLoading, error, initTurno } = useTurno();

  const handleInitTurno = async () => {
    await initTurno();
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <Button onClick={handleInitTurno} isLoading={isLoading}>
        Iniciar Turno
      </Button>
      {turno && <p>Turno: {turno.numero_turno}</p>}
    </div>
  );
};
```

### Combinar múltiples hooks

```tsx
const { turno, initTurno } = useTurno();
const { transacciones, getTransaccionesByTurno } = useTransacciones();

useEffect(() => {
  if (turno) {
    getTransaccionesByTurno(turno.id);
  }
}, [turno]);
```

## Gestión de Errores

Todos los hooks manejan errores automáticamente:

```tsx
const { error, clearError } = useTurno();

if (error) {
  return (
    <div>
      <p>{error}</p>
      <Button onClick={clearError}>Limpiar Error</Button>
    </div>
  );
}
```

## Mejores Prácticas

1. **Uno por responsabilidad**: Cada hook maneja un aspecto específico
2. **Estados claros**: isLoading, error, success están siempre disponibles
3. **Acciones reset**: Usar `reset()` para limpiar el estado completo
4. **Errores limpios**: Usar `clearError()` para limpiar solo el error
5. **Callbacks memoizados**: Usar `useCallback` para prevenir re-renders innecesarios
