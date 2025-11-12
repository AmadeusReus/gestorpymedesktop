# Componentes Comunes (Shared Components)

Esta carpeta contiene componentes reutilizables que se utilizan en toda la aplicación.

## Componentes Disponibles

### Button
Botón versátil con múltiples variantes y tamaños.

```tsx
import Button from './Button';

<Button variant="primary" size="medium" onClick={handler}>
  Guardar
</Button>
```

**Props:**
- `variant`: 'primary' | 'danger' | 'success' | 'secondary'
- `size`: 'small' | 'medium' | 'large'
- `isLoading`: boolean - Muestra spinner mientras está cargando
- `fullWidth`: boolean - Ancho completo del contenedor
- `disabled`: boolean

### FormInput
Input de formulario con label, validación y mensajes de error.

```tsx
import FormInput from './FormInput';

<FormInput
  label="Usuario"
  type="text"
  error={errors.username}
  helperText="Ingresa tu nombre de usuario"
  required
/>
```

**Props:**
- `label`: string
- `error`: string - Mensaje de error
- `helperText`: string - Texto de ayuda
- `required`: boolean
- `fullWidth`: boolean

### FormSelect
Select/dropdown con label, validación y opciones.

```tsx
import FormSelect from './FormSelect';

<FormSelect
  label="Tipo de Gasto"
  options={tiposGasto}
  value={selectedId}
  onChange={(e) => setSelected(e.target.value)}
  required
/>
```

**Props:**
- `label`: string
- `options`: SelectOption[] - Array de {value, label}
- `placeholder`: string
- `error`: string
- `helperText`: string
- `required`: boolean

### Table
Tabla versátil con soporte para sorting, selección múltiple y custom rendering.

```tsx
import Table, { TableColumn } from './Table';

const columns: TableColumn<Transaccion>[] = [
  { key: 'id', header: 'ID', width: '80px' },
  { key: 'valor', header: 'Monto', render: (val) => `$${val.toLocaleString()}` },
  { key: 'categoria', header: 'Categoría' }
];

<Table
  columns={columns}
  data={transacciones}
  selectable
  sortable
  onSort={(col) => handleSort(col)}
/>
```

**Props:**
- `columns`: TableColumn<T>[] - Definición de columnas
- `data`: T[] - Datos a mostrar
- `isLoading`: boolean
- `emptyMessage`: string
- `selectable`: boolean
- `onRowClick`: (row, index) => void
- `sortable`: boolean
- `onSort`: (column) => void

### Card
Componente de tarjeta para agrupar contenido.

```tsx
import Card from './Card';

<Card title="Resumen del Turno" elevated>
  <p>Contenido aquí</p>
  <Card.Footer>
    <Button>Guardar</Button>
  </Card.Footer>
</Card>
```

**Props:**
- `title`: string
- `subtitle`: string
- `footer`: ReactNode
- `noPadding`: boolean
- `elevated`: boolean - Sombra más prominente

## Estilos y Temas

Todos los componentes utilizan variables CSS (CSS custom properties) para mantener consistencia:

- **Colores**: `--color-primary`, `--color-danger`, `--color-success`, `--color-secondary`
- **Espacios**: `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`
- **Bordes**: `--border-radius`
- **Sombras**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

Ver `styles/components/Button.css` para el tema completo.

## Convenciones

1. Usar BEM para las clases CSS (ej: `btn`, `btn--primary`, `btn__icon`)
2. Siempre incluir tipos TypeScript
3. Componentes funcionales con React.FC
4. Props con interfaz clara
5. Documentar con JSDoc

## Agregar un Nuevo Componente

1. Crear archivo `NuevoComponente.tsx` en esta carpeta
2. Crear estilos en `styles/components/NuevoComponente.css`
3. Exportar desde `index.ts` (si se necesita)
4. Documentar en este README
