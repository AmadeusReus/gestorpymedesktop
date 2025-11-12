# 🐛 BUG: TransactionModal - Bloqueo Post-Delete (RESUELTO ✅)

**ID:** BUG-001
**Prioridad:** CRÍTICA
**Estado:** ✅ RESUELTO (Sesión 3)
**Descubierto en:** Sesión 2, Noviembre 2025 (Manual Testing de CU-1)
**Resuelto en:** Sesión 3, Noviembre 2025
**Reproducible:** ✅ Ya no se reproduce

---

## 📋 Descripción del Problema

Cuando se elimina una transacción desde TransactionModal y se intenta agregar una nueva transacción **del mismo tipo** inmediatamente después, el formulario se vuelve irresponsivo:

- El campo de "Valor" no responde a input
- El campo de "Concepto" funciona, pero "Valor" queda bloqueado
- El componente no recibe el evento onChange del input de valor

---

## 🔍 Pasos para Reproducir

1. ✅ Hacer login como empleado1 (empleado123)
2. ✅ Crear un turno
3. ✅ Abrir TransactionModal (botón "Agregar Transacción")
4. ✅ Agregar una transacción PAGO_DIGITAL tipo Nequi
5. ✅ Cerrar modal (click en X)
6. ✅ Abrir modal nuevamente
7. ✅ Intentar agregar OTRA transacción PAGO_DIGITAL
8. ❌ Input "Valor" no responde - **BUG AQUÍ**

---

## 🎯 Causa Raíz

**Archivo:** `src/components/Transactions/TransactionModal.tsx`

El componente no resetea su estado interno (`formData`) cuando la prop `isOpen` cambia. Esto causa que:

1. Primero transacción se crea correctamente
2. Modal se cierra, pero `formData` mantiene el último valor
3. Modal se reabre con datos viejos
4. Input value sigue siendo el viejo valor
5. OnChange handler intenta actualizar state que ya tiene ese valor
6. React no re-renderiza correctamente el input
7. Input queda en estado inconsistente

**Líneas afectadas:**
- Línea 3: Falta `useEffect` en imports
- Línea 46 en adelante: Faltan hooks de limpieza

---

## ✅ Solución - Fix Propuesto

### Paso 1: Importar useEffect

**Archivo:** `src/components/Transactions/TransactionModal.tsx`, línea 3

**Cambiar:**
```typescript
import React, { useState, useCallback } from 'react';
```

**Por:**
```typescript
import React, { useState, useCallback, useEffect } from 'react';
```

### Paso 2: Agregar useEffect para limpiar formData

**Archivo:** `src/components/Transactions/TransactionModal.tsx`, después de línea 46 (después de los useState)

**Agregar:**
```typescript
// Limpiar formulario cuando el modal abre/cierra
useEffect(() => {
  if (isOpen) {
    // Resetear formData al abrir
    setFormData({
      subtipo: subtypes.length > 0 ? subtypes[0].id : '',
      valor: '',
      concepto: '',
    });
    setError(null);
    setShowNewSubtypeForm(false);
    setNewSubtypeName('');
    setFilterSubtypeId('TODOS');
  }
}, [isOpen, subtypes]);
```

**Explicación:**
- `useEffect` se ejecuta cada vez que `isOpen` o `subtypes` cambian
- Cuando `isOpen` es `true`, resetea todos los inputs al estado inicial
- Cuando `isOpen` es `false`, el effect no hace nada
- Esto garantiza que cada vez que se abre el modal, empieza limpio

---

## 🧪 Casos de Prueba

### Test 1: Agregar transacción, cerrar, agregar otra (MISMO TIPO)
```
1. Login empleado1
2. Crear turno
3. Abrir modal
4. Agregar PAGO_DIGITAL tipo Nequi con $50.000
5. Guardar (modal cierra)
6. Abrir modal nuevamente
7. Agregar PAGO_DIGITAL tipo Nequi con $75.000
✅ ESPERADO: Input "Valor" responde correctamente, se guarda $75.000
```

### Test 2: Agregar transacción, cerrar, agregar otra (DIFERENTE TIPO)
```
1. Login empleado1
2. Crear turno
3. Abrir modal
4. Agregar PAGO_DIGITAL tipo Nequi
5. Guardar (modal cierra)
6. Abrir modal nuevamente
7. Agregar GASTO_CAJA tipo "Café"
✅ ESPERADO: Modal muestra nuevos tipos, input limpio
```

### Test 3: Borrar transacción, intentar agregar nueva (EL CASO QUE FALLÓ)
```
1. Login empleado1
2. Crear turno
3. Agregar PAGO_DIGITAL tipo Nequi
4. Abrir modal nuevamente
5. Ver lista de transacciones
6. Click en botón borrar (X) de la transacción
7. Borrar confirmado
8. Intentar agregar nueva PAGO_DIGITAL
❌ ACTUAL: Input "Valor" no responde
✅ DESPUÉS DEL FIX: Funcionará correctamente
```

---

## 📊 Impacto

- **Severidad:** MEDIA-ALTA (bloquea workflow)
- **Alcance:** Usuarios que agregan múltiples transacciones del mismo tipo
- **Workaround:** Cerrar modal (X) y reabrirlo
- **Tiempo de Fix:** 2-3 minutos
- **Testing:** 5-10 minutos manual

---

## ✅ SOLUCIÓN IMPLEMENTADA (Sesión 3)

### Causa Raíz CORREGIDA

El problema NO era state management de React. Era **un problema de Electron con `window.confirm()`**:

- `confirm()` es una llamada **síncrona y bloqueante**
- Congela TODO el JavaScript mientras está abierto
- En Electron, congela la **cola de eventos de todo el main thread**
- Los inputs quedan en la queue pero sin procesarse
- Se arregla al clickear FUERA de la app (desenfoque despierta la cola)

### Solución Implementada

**Reemplazar `window.confirm()` con componente React `<ConfirmDialog>`**

**Archivos Modificados:**

1. **`src/components/Transactions/TransactionModal.tsx`**
   - Importar `ConfirmDialog` (línea 5)
   - Agregar estado `deleteConfirmId` (línea 50)
   - Reescribir `handleDeleteTransaction()` (líneas 209-211)
   - Crear `handleConfirmDelete()` y `handleCancelDelete()` (líneas 214-229)
   - Agregar `<ConfirmDialog>` en JSX (líneas 384-395)
   - Envolver return en Fragment `<>...</>` (línea 237, 396)

2. **`src/components/Transactions/TransactionTable.tsx`**
   - Invertir orden para mostrar transacciones más recientes primero (línea 52)

3. **`src/components/Transactions/TransactionModal.tsx` (UX mejorada)**
   - Mantener subtipo seleccionado al limpiar solo concepto/valor
   - Focus automático en campo Valor con `useEffect`
   - Remover label "Transacciones Registradas" redundante
   - Cambiar resumen a una línea (Transacciones: X | Total: $Y)

### Cambios de Código

```typescript
// ANTES: Bloqueante
const handleDeleteTransaction = async (id: number) => {
  if (!confirm('¿Estás seguro?')) return;  // 🔴 BLOQUEA TODO
  await onDeleteTransaction(id);
};

// DESPUÉS: No-bloqueante
const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

const handleDeleteTransaction = (id: number) => {
  setDeleteConfirmId(id);  // ✅ Solo guarda, no bloquea
};

const handleConfirmDelete = async () => {
  if (deleteConfirmId === null) return;
  await onDeleteTransaction(deleteConfirmId);
  setDeleteConfirmId(null);
};
```

```jsx
// Agregar ConfirmDialog en JSX (no-bloqueante)
<ConfirmDialog
  isOpen={deleteConfirmId !== null}
  title="Confirmar eliminación"
  message="¿Estás seguro de que quieres borrar esta transacción?"
  confirmText="Sí, borrar"
  cancelText="Cancelar"
  variant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteConfirmId(null)}
/>
```

### Testing Post-Fix ✅

- ✅ Se abre dialogo de confirmación visual (no bloqueante)
- ✅ Inputs responden INMEDIATAMENTE después de borrar
- ✅ Sin necesidad de clickear afuera de la app
- ✅ Subtipo se mantiene seleccionado para agregar múltiples
- ✅ Focus automático en campo Valor
- ✅ Tabla muestra transacciones más recientes primero
- ✅ Sin duplicación de concepto en columna Subtipo

---

## 🔗 Referencias

- **Documento padre:** `docs/12-estado-proyecto/PROXIMO-TRABAJO.md`
- **Componente:** `src/components/Transactions/TransactionModal.tsx` (v0.9.0)
- **Use Case:** CU-1 (Empleado cierra turno con transacciones)
- **Descubierto en:** Manual testing Sesión 2
- **Resuelto en:** Sesión 3, Noviembre 2025

---

## 📝 Lecciones Aprendidas

1. **Electron Event Loop**: `confirm()` bloqueante congela la cola de eventos del main thread
2. **No-Blocking UI**: Siempre usar componentes React en lugar de APIs nativas bloqueantes
3. **Debugging**: El problema no era React state, era el IPC/Electron + bloqueante
4. **UX Wins**: Al resolver el bug, mejoramos otros aspectos (transacciones por fecha, focus auto, etc.)

---

**Última actualización:** Noviembre 2025 (Sesión 3)
**Estado:** ✅ RESUELTO Y TESTEADO
**Tiempo total:** ~25 minutos (análisis + implementación + testing)
