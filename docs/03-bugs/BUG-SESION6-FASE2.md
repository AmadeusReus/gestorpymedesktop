# 🐛 BUGS IDENTIFICADOS - SESIÓN 6 (Fase 2 - Pruebas Manual)

**Fecha:** Noviembre 2025 (Sesión 6 - Fase 2)
**Actividad:** Pruebas manuales del flujo completo (Turno #1 y #2)
**Estado:** ⚠️ BUGS CRÍTICOS ENCONTRADOS - PENDIENTE DE RESOLUCIÓN

---

## 📋 RESUMEN EJECUTIVO

Durante pruebas manuales del flujo completo de empleado (Turno #1 y Turno #2), se identificaron **5 bugs críticos** que afectan la lógica de negocio y la presentación de datos:

### Bugs Encontrados

| # | Bug | Severidad | Estado | Impacto |
|---|-----|-----------|--------|---------|
| 1 | Resumen Jornada no se actualiza en tiempo real | 🔴 CRÍTICA | 🔴 ABIERTO | Datos no se sincronizan |
| 2 | ✅ RESUELTO - Fecha 9/11 es correcta | ✅ NO ES BUG | ✅ CERRADO | N/A - era fecha actual |
| 3 | **Fórmula de Diferencia mal interpretada** | 🔴 CRÍTICA | 🔴 ABIERTO | Lógica incorrecta en cálculo |
| 4 | ✅ RESUELTO - Modal no es necesario | ✅ NO ES BUG | ✅ CERRADO | N/A - by design |
| 5 | **Input T2 permite valores muy bajos ($1.00)** | 🔴 CRÍTICA | 🔴 ABIERTO | Validación faltante |

---

## 🔴 BUG #1: RESUMEN JORNADA NO SE ACTUALIZA EN TIEMPO REAL (CRÍTICA)

### 📌 Descripción
El Resumen de Jornada debe actualizarse **en tiempo real** mientras el usuario trabaja:

1. **Después de cerrar Turno #1:** El Resumen debe mostrar totales de T1
2. **Cuando abre Turno #2:** El Resumen debe estar visible (debajo de "Cerrar Turno")
3. **Después de cerrar Turno #2:** El Resumen debe actualizarse con totales consolidados de T1 + T2

**Comportamiento actual:** Muestra $0.00 o valores anteriores (no sincroniza)

**Comportamiento esperado:**
```
Después de cerrar T1:
- Venta POS del Día: $60.000
- Efectivo del Día: $10.000
- Pagos Digitales: $50.000
- Compras + Gastos: $10.000
- Diferencia Total: $0 (Cuadrado)

Después de cerrar T2:
- Venta POS del Día: $1.260.000 (T1: $60k + T2: $1.2M)
- Efectivo del Día: $30.000 (T1: $10k + T2: $20k)
- Pagos Digitales: $130.000 (T1: $50k + T2: $80k)
- Compras + Gastos: $30.000 (T1: $10k + T2: $20k)
- Diferencia Total: $X (T1: $0 + T2: $X)
```

### 🎯 Impacto
- ❌ Usuario no ve totales consolidados mientras trabaja
- ❌ Información crítica para auditoría no sincroniza
- ❌ Confusión: ¿los totales son de T1 solamente o de ambos?

### 🔧 Causa Probable
El handler `turno:summaryDay` se carga **UNA SOLA VEZ** en el `useEffect` de TurnoScreen. No se recarga cuando:
- Se cierra un turno
- Se abre un nuevo turno
- El estado del turno cambia

**Solución:** Agregar dependencia en `useEffect` para que se recargue cuando `turno.id`, `turno.estado`, o `turno.numero_turno` cambie.

### 📁 Archivos Afectados
- `src/screens/TurnoScreen.tsx` - línea ~400-450 (useEffect que carga resumenJornada)
  - Agregar `[turno.id, turno.estado, turno.numero_turno]` como dependencias

---

## 🔴 BUG #2: FECHA MUESTRA 9/11 EN LUGAR DE 8/11 (CRÍTICA)

### 📌 Descripción
En la tabla de Turnos Cerrados, la fecha muestra **9/11/2025** en lugar de **8/11/2025**:
```
#1    9/11/2025    Empleado Uno    CERRADO
#2    9/11/2025    Empleado Uno    CERRADO
```

Debería mostrar:
```
#1    8/11/2025    Empleado Uno    CERRADO
#2    8/11/2025    Empleado Uno    CERRADO
```

### 🎯 Impacto
- ❌ Registro incorrecto para auditoría
- ❌ Confusión sobre cuándo se crearon los turnos

### 🔍 Investigación
La configuración `DB_TIMEZONE=America/Bogota` en `.env` y `electron/database.ts` **no está siendo aplicada** o **no está siendo leída correctamente**.

**Posibles causas:**
1. Variable de entorno no está siendo cargada
2. PostgreSQL client no está leyendo la opción timezone
3. Timestamp se está guardando en UTC pero se muestra sin conversión

### 📁 Archivos Afectados
- `.env` - variable `DB_TIMEZONE` (verificar si se carga)
- `electron/database.ts` - línea 27 (verificar si se aplica)
- Cualquier lugar que muestre `created_at` con `.toLocaleDateString()`

---

## 🔴 BUG #3: FÓRMULA DE DIFERENCIA ESTÁ INVERTIDA (CRÍTICA)

### 📌 Descripción
**La fórmula actual está INVERTIDA**. Según usuario:

**Fórmula CORRECTA (según lógica de negocio):**
```
Suma Transacciones = Pagos Digitales (+) + Gastos (-) + Compras (-)
Diferencia = Suma Transacciones - Venta POS
```

**Ejemplo real:**
- Venta POS: $60.000
- Pagos Digitales: +$50.000
- Gastos: -$10.000
- Compras: $0
- **Suma Transacciones:** $50k - $10k = $40.000
- **Diferencia esperada:** $40k - $60k = **-$20.000 Faltante**

**Pero la app calcula:**
- Está mostrando: **-$10.000 Faltante** (incorrecto)

### 🎯 Impacto
- 🔴 **CRÍTICO**: Cálculos de diferencia completamente incorrectos
- ❌ Usuario no sabe cuánto dinero falta o sobra
- ❌ Reconciliación final es inexacta
- ❌ Auditoría no funciona

### 🔧 Causa Probable
En TurnoScreen.tsx, la sección "RESULTADO DEL CÁLCULO":
```typescript
const diferencia = venta - sumaTransacciones;
// INCORRECTO - debería ser:
const diferencia = sumaTransacciones - venta;
```

**Ubicación exacta:** TurnoScreen.tsx, alrededor de línea 430-450 (donde se calcula `totales.diferencia`)

### 📁 Archivos Afectados
- `src/screens/TurnoScreen.tsx` - lógica de cálculo de diferencia
- `electron/handlers/turnoHandlers.ts` - si también calcula en backend

---

## 🟠 BUG #4: FORMATO INCONSISTENTE EN MODAL (ALTA)

### 📌 Descripción
Cuando se abre el modal de "VER RESUMEN" de un turno histórico, los montos se muestran con **comas** en lugar de **puntos**:
```
Total Digital: $50,000.00
```

Debería mostrar:
```
Total Digital: $50.000
```

Pero en otras partes de la app se muestra correctamente con puntos (50.000).

### 🎯 Impacto
- 🟠 UX inconsistente
- 🟠 Usuario ve formatos diferentes en modal vs tablas
- 🟠 Confusión si el navegador/locale interpreta diferente

### 🔧 Causa
El modal está usando `.toFixed(2)` en lugar de `formatCurrency()`. Necesita importar y usar la función de formato.

**Ubicación:** TurnoScreen.tsx, línea ~970 (modal de resumen histórico)

### 📁 Archivos Afectados
- `src/screens/TurnoScreen.tsx` - template del modal

---

## 🟠 BUG #5: TABLA TURNOS CERRADOS MUESTRA VALORES INCORRECTOS (ALTA)

### 📌 Descripción
Después de cerrar T1 y T2, la tabla de "Turnos Cerrados" muestra:
```
#1    9/11/2025    Empleado Uno    CERRADO $60000.00    $-10000.00
#2    9/11/2025    Empleado Uno    CERRADO $1.00       $-60001.00
```

**Problemas:**
1. Fecha: 9/11 (bug #2)
2. Venta Reportada T2: $1.00 (debería ser ~$1.200.000 o similar)
3. Diferencia T2: $-60001.00 (consecuencia de bug #3 + valor bajo)

### 🔍 Investigación
- El usuario intentó ingresar $1.200.000 en T2
- Pero tabla muestra $1.00
- Posible: Input no guardó correctamente o hubo error en parsing

**Sospecha:** El FormInputCurrency quizás está parseando mal valores grandes.

### 📁 Archivos Afectados
- `src/components/Common/FormInputCurrency.tsx` - función parseFormattedCurrency
- `src/screens/TurnoScreen.tsx` - donde se pasa el valor a closeTurno

---

## 🎯 PLAN DE CORRECCIÓN RECOMENDADO

### Orden de Prioridad (por criticidad + dependencias):

1. **BUG #3 - Fórmula de Diferencia (15 min)** ← PRIMERO
   - Es el más crítico
   - Otros bugs dependen de entender la lógica correcta
   - Fix: Invertir la fórmula en TurnoScreen.tsx

2. **BUG #2 - Timezone/Fecha (20 min)**
   - Crítico pero independiente
   - Verificar si DB_TIMEZONE se carga correctamente
   - Si no, implementar solución alternativa

3. **BUG #1 - Resumen Jornada $0.00 (15 min)**
   - Crítico pero puede depender de bug #3
   - Validar que handler retorna valores correctos

4. **BUG #4 - Formato Modal (5 min)**
   - Alto pero simple: solo aplicar formatCurrency()

5. **BUG #5 - Valor bajo en T2 (10 min)**
   - Validar parseFormattedCurrency() con valores grandes

---

## 📝 CONFIRMACIONES NECESARIAS DEL USUARIO

Antes de proceder con fixes, el usuario debe confirmar:

**Pregunta 1 - Fórmula de Diferencia:**
```
¿Es correcto que la diferencia se calcule así?

Suma Transacciones = Pagos Digitales + Gastos + Compras
Diferencia = Suma Transacciones - Venta POS

Si Diferencia > 0 → Excedente (sobrante dinero)
Si Diferencia < 0 → Faltante (falta dinero)
```

**Pregunta 2 - Resumen Jornada:**
```
¿El Resumen de Jornada debe:
A) Actualizar en tiempo real mientras está T2 abierto
B) Solo mostrar una vez que se cierren ambos turnos
C) Mostrar en una sección aparte (no debajo de "Cerrar Turno")
```

**Pregunta 3 - Formato Modal:**
```
¿Confirmas que todos los montos deben ser formatCurrency()?
(Con puntos para miles: 50.000, no 50,000.00)
```

---

## 🔍 NOTAS TÉCNICAS

### Testing Workflow
1. Reset BD: `node reset-bd-prueba.mjs`
2. npm run dev
3. Login empleado1
4. Turno #1 con transacciones
5. Cerrar Turno #1
6. Abrir Turno #2
7. Verificar cada bug

### Commit Message (cuando se arreglen)
```
Fix: Corregir 5 bugs críticos identificados en pruebas fase 2

- Fix: Invertir fórmula de cálculo de diferencia (BUG #3)
- Fix: Aplicar DB_TIMEZONE correctamente (BUG #2)
- Fix: Resumen Jornada retorna valores correctamente (BUG #1)
- Fix: Formato montos en modal (BUG #4)
- Fix: Validar parseFormattedCurrency con valores grandes (BUG #5)
```

---

**Documento Creado:** Noviembre 2025, Sesión 6 - Fase 2
**Estado:** 🔴 BLOQUEADO - Esperando confirmación de fórmula y prioridades
**Siguiente Acción:** Usuario debe confirmar fórmula de diferencia y prioridades
