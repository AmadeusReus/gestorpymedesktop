# 🐛 BUGS IDENTIFICADOS - SESIÓN 6 (Pruebas Manuales)

**Fecha:** Noviembre 2025 (Sesión 6)
**Actividad:** Pruebas manuales del flujo de empleado (Turno #1 y #2)
**Estado:** ✅ TODOS LOS BUGS RESUELTOS Y VALIDADOS

---

## 📋 RESUMEN EJECUTIVO

Durante pruebas manuales del flujo completo de CU-1 (empleado registra transacciones y cierra turno), se identificaron **5 bugs críticos** que afectan la funcionalidad esperada según el SRS y la lógica de negocio.

### ✅ Todos los Bugs Resueltos

| # | Bug | Severidad | Estado | Fix Commit |
|---|-----|-----------|--------|-----------|
| 1 | Cálculo POS Incremental | 🔴 CRÍTICA | ✅ RESUELTO | e6c0516 |
| 2 | Modal Resumen $0.00 | 🔴 ALTA | ✅ RESUELTO | 37b9044 |
| 3 | Columna "Cerrado por" N/A | 🟠 ALTA | ✅ RESUELTO | 608469a |
| 4 | Tabla DESC vs ASC | 🟡 MEDIA | ✅ RESUELTO | 88d7fd9 |
| 5 | Inputs prellenados T2 | 🟡 MEDIA | ✅ RESUELTO | 88d7fd9 |

---

## 🔴 BUG #1: CÁLCULO POS INCREMENTAL NO IMPLEMENTADO (CRÍTICA)

### 📌 Descripción
Según el **SRS (RF2.5)**, la fórmula correcta es:
```
Venta del Turno = Venta POS Actual - Venta POS Anterior
```

Pero actualmente se usa la **Venta POS reportada directamente** sin restar el turno anterior.

### 📊 Ejemplo del Problema

**Caso Real de Prueba:**
- **Turno #1:**
  - Venta POS reportada: $500.000
  - Transacciones: Pago Digital +$50.000, Gasto -$10.000
  - Diferencia: Sobrante/Faltante según cálculo

- **Turno #2:**
  - Venta POS reportada: $1.200.000
  - Transacciones: Compra -$20.000, Pago Digital +$80.000
  - **INCORRECTO:** Usa $1.200.000 directamente
  - **CORRECTO:** Debería usar $1.200.000 - $500.000 = $700.000

### 🎯 Impacto
- ❌ Cálculos completamente incorrectos en Turno #2
- ❌ Diferencia calculada no refleja realidad de ese turno
- ❌ Reconciliación final del día será incorrecta

### 🔧 Solución Técnica

**En `electron/handlers/turnoHandlers.ts` (handler `turno:close`):**
1. Obtener turno anterior del mismo día (numero_turno - 1)
2. Si existe, obtener su `venta_reportada_pos_turno`
3. Calcular: `venta_turno_actual = venta_reportada_actual - venta_turno_anterior`
4. Usar `venta_turno_actual` en cálculos de diferencia

**Pseudocódigo:**
```typescript
const turnoAnterior = await getTurnoByNumero(
  dia_contable_id,
  numero_turno - 1
);

let ventaTurnoActual = ventaReportadaPOS;
if (turnoAnterior) {
  ventaTurnoActual = ventaReportadaPOS - turnoAnterior.venta_reportada_pos_turno;
}

// Usar ventaTurnoActual en cálculo de diferencia
const diferencia = calcularDiferencia(
  ventaTurnoActual,  // ← AQUÍ va el valor incremental
  transacciones,
  efectivoContado
);
```

### 📁 Archivos Afectados
- `electron/handlers/turnoHandlers.ts` (handler `turno:close`)
- `src/screens/TurnoScreen.tsx` (lógica de cálculo en frontend)

### ✅ Validación Post-Fix
Crear Turno #1 y #2, verificar que:
- Turno #1 diferencia = Cálculo normal
- Turno #2 diferencia = Basada en Venta incremental (T2 - T1)

---

## 🔴 BUG #2: MODAL RESUMEN MUESTRA $0.00 (ALTA)

### 📌 Descripción
Cuando el usuario hace clic en "VER RESUMEN" en la tabla de Turnos Cerrados, aparece el modal pero los valores mostrados son:
```
Venta Reportada POS: $0.00
Efectivo Contado: $0.00
Diferencia Calculada: $0.00
```

Aunque en el cierre del turno se ingresaron valores reales (ej: $60.000, $10.000).

### 🎯 Impacto
- ❌ Usuario no puede revisar valores históricos de su turno
- ❌ Modal de resumen inútil para auditoría
- ❌ Pérdida de información crítica

### 🔧 Causa Probable
1. **Query no trae datos:** El handler `turno:get-by-id` o similar no recupera correctamente los campos de valores
2. **Frontend no procesa:** El componente modal no mapea correctamente los valores del JSON recibido
3. **BD no almacena:** Los valores no se guardaron en el cierre (menos probable, pues en Turno #1 sí se ven en pantalla antes de cerrar)

### 🔍 Debug Steps
1. Abrir DevTools (F12)
2. Crear Turno #1, cerrar con valores (ej: POS $60.000, Efectivo $10.000)
3. Hacer clic en "VER RESUMEN"
4. En DevTools → Network → buscar IPC call de recuperación de turno
5. Verificar que respuesta IPC contiene `venta_reportada_pos_turno`, `efectivo_contado_turno`, `diferencia_calculada_turno`
6. Verificar que modal mapea esos campos al template HTML

### 📁 Archivos Afectados
- `src/hooks/useTurno.ts` (hook que recupera el turno histórico)
- `electron/handlers/turnoHandlers.ts` (handler que obtiene el turno)
- Modal component en `src/screens/TurnoScreen.tsx`

### ✅ Validación Post-Fix
Cerrar turno con valores, luego hacer clic en "VER RESUMEN" y verificar que aparecen valores correctos.

---

## 🟠 BUG #3: COLUMNA "CERRADO POR" MUESTRA N/A (ALTA)

### 📌 Descripción
La tabla de "Turnos Cerrados" tiene una columna "Cerrado por" que debería mostrar el nombre del empleado que cerró el turno, pero muestra:
```
Cerrado por: N/A
```

Para todos los turnos.

### 🎯 Impacto
- ❌ Pérdida de trazabilidad: No se sabe quién cerró cada turno
- ❌ Información crítica para auditoría faltante
- ❌ No se puede validar que empleado correcto cerró su turno

### 🔧 Causa Técnica
La tabla `turnos` tiene `usuario_id` pero la query no hace JOIN con la tabla `usuarios` para obtener `nombre_completo`.

**Query actual (probable):**
```sql
SELECT id, numero_turno, usuario_id, estado, ... FROM turnos WHERE ...
-- Solo retorna usuario_id (ej: 2)
```

**Query correcta:**
```sql
SELECT
  t.id,
  t.numero_turno,
  u.nombre_completo as creado_por,
  t.estado,
  ...
FROM turnos t
JOIN usuarios u ON t.usuario_id = u.id
WHERE ...
```

### 📁 Archivos Afectados
- Handler que obtiene historial de turnos (probablemente en `turnoHandlers.ts`)
- Query SQL de recuperación

### ✅ Validación Post-Fix
Cerrar turno, ver historial, verificar que columna muestra nombre del empleado (ej: "Empleado Uno").

---

## 🟡 BUG #4: TABLA TURNOS CERRADOS ORDENADA DESC (MEDIA)

### 📌 Descripción
La tabla de Turnos Cerrados muestra:
```
Fila 1: Turno #2 (más reciente)
Fila 2: Turno #1 (más antiguo)
```

Pero debería mostrar:
```
Fila 1: Turno #1 (más antiguo) ← PRIMERO
Fila 2: Turno #2 (más reciente) ← SEGUNDO
```

### 🎯 Impacto
- 🟡 UX confusa: Usuario espera ver turnos cronológicamente (de primero a último)
- 🟡 Dificulta la auditoría (tiene que buscar Turno #1 en segunda fila)

### 🔧 Solución
Cambiar SQL ORDER BY:
```sql
-- INCORRECTO (actual):
ORDER BY created_at DESC

-- CORRECTO:
ORDER BY numero_turno ASC
-- O simplemente:
ORDER BY created_at ASC
```

### 📁 Archivos Afectados
- Handler que obtiene historial (query SQL)

### ✅ Validación Post-Fix
Ver historial de turnos, verificar que Turno #1 aparece primero, Turno #2 segundo.

---

## 🟡 BUG #5: INPUTS PRELLENADOS EN TURNO #2 (MEDIA)

### 📌 Descripción
Al crear Turno #2 (después de cerrar Turno #1), los inputs de cierre muestran:
```
Venta Reportada POS: [500000]   ← Valor del Turno #1
Efectivo Contado: [10000]       ← Valor del Turno #1
```

Deberían estar vacíos para que el usuario ingrese nuevos valores:
```
Venta Reportada POS: []
Efectivo Contado: []
```

### 🎯 Impacto
- 🟡 Confusión: Usuario podría pensar que son valores correctos
- 🟡 Error accidental: Si no ingresa valores nuevos, usa los del turno anterior
- 🟡 Posible inconsistencia de datos

### 🔧 Causa
Los state variables `ventaReportada` y `efectivoContado` no se resetean cuando cambia el turno activo.

### 🔧 Solución
En `TurnoScreen.tsx`, agregar `useEffect` que detecte cambio de turno y limpie inputs:

```typescript
useEffect(() => {
  if (turno?.id) {
    // Turno cambió
    setVentaReportada('');
    setEfectivoContado('');
  }
}, [turno?.id]);
```

### 📁 Archivos Afectados
- `src/screens/TurnoScreen.tsx` (state + useEffect)

### ✅ Validación Post-Fix
Cerrar Turno #1, crear Turno #2, verificar que inputs están vacíos y listos para nuevos valores.

---

## 🎯 PLAN DE CORRECCIÓN

### Orden Recomendado (por impacto e interdependencias):

1. **BUG #5 (Inputs T2)** - 5 minutos
   - Rápido de arreglar
   - Mejora UX inmediatamente

2. **BUG #1 (POS Incremental)** - 30 minutos
   - Crítico para lógica de negocio
   - Requiere entender flujo de cálculos
   - Validar que no afecta BUG #2

3. **BUG #2 (Modal $0.00)** - 15 minutos
   - Debugging de query/frontend
   - Validar que BUG #1 no lo afectó

4. **BUG #3 (Cerrado por)** - 10 minutos
   - Simple JOIN en SQL
   - Bajo riesgo

5. **BUG #4 (Ordenamiento)** - 5 minutos
   - Cambio de una línea SQL
   - Sin riesgo

### Tiempo Total Estimado: ~1 hora

---

## 📝 NOTAS PARA FIX

### Testing Workflow Post-Fix
1. Reset BD: `node reset-bd-prueba.mjs`
2. npm run dev
3. Login como empleado1
4. Crear Turno #1 con transacciones y cerrar
5. Crear Turno #2 con transacciones y cerrar
6. Verificar cada bug ha sido corregido
7. Login como empleado2 - verificar que ve ambos turnos como solo lectura

### Commit Message (Sugerido)
```
Fix: Corregir 5 bugs críticos identificados en pruebas manuales

- Fix: Implementar cálculo POS incremental (BUG #1 - RF2.5)
- Fix: Modal Resumen ahora recupera valores correctamente (BUG #2)
- Fix: Agregar columna "Cerrado por" con JOIN a usuarios (BUG #3)
- Fix: Ordenar Turnos Cerrados de antiguo a reciente (BUG #4)
- Fix: Limpiar inputs de cierre al crear nuevo turno (BUG #5)

Validado con pruebas manuales: Turno #1 y #2 completos
```

---

**Documento Creado:** Noviembre 2025, Sesión 6
**Siguiente Acción:** Empezar fix desde BUG #5 (más rápido) hacia BUG #1 (más complejo)
