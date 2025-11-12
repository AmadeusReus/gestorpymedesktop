# 🧪 GUÍA PRUEBA MANUAL - FLUJO DEL EMPLEADO

**Fecha:** Noviembre 2025
**Objetivo:** Validar que el flujo completo del empleado funciona correctamente
**Tiempo estimado:** 15-20 minutos

---
q
## 📋 RESUMEN DEL FLUJO A PROBAR

```
1. LOGIN como empleado
   ↓
2. CREAR TURNO (Turno #1)
   ↓
3. AGREGAR TRANSACCIONES
   - 1 Pago Digital
   - 1 Gasto de Caja
   ↓
4. REVISAR CÁLCULOS
   - Totales automáticos
   - Diferencia de efectivo
   ↓
5. CERRAR TURNO (Turno #1)
   ↓
6. VERIFICAR CIERRE
   - Turno marcado como CERRADO
   - Vista de solo lectura
   ↓
7. LOGIN como SUPERVISOR
   ↓
8. VERIFICAR TURNO CERRADO
   - Revisar y Cerrar Día
```

---

## ⚡ PASO 0: LIMPIAR BASE DE DATOS (IMPORTANTE)

**Antes de comenzar, debes resetear la BD para empezar limpio.**

**Acciones:**
```bash
# Ejecuta este comando en terminal
psql -U postgres -d gestorpyme -f scripts/reset-simple.sql
```

**Verificación esperada:**
```
DATOS BORRADOS
Transacciones: 0
Turnos: 0
Días Contables: 0

ESTRUCTURA BASE INTACTA
Usuarios: 6
Negocios: 2
Miembros: 8
```

**Si hay error:**
→ Lee: `../../RESET-BD-ANTES-PRUEBA.md`

**Consola esperada:**
```
DELETE 0e
DELETE 0
DELETE 0
ALTER SEQUENCE
ALTER SEQUENCE
ALTER SEQUENCE

DATOS BORRADOS
──────────────
 tabla | cantidad
───────┼─────────
 Transacciones | 0
 Turnos | 0
 Días Contables | 0
```

---

## 🚀 PASOS DETALLADOS

### PASO 1: INICIAR APLICACIÓN

**Acciones:**
1. Abre la terminal en la carpeta del proyecto
2. Ejecuta: `npm run dev`
3. Espera a que Electron abra la ventana de la aplicación
4. Deberías ver la pantalla de LOGIN

**Verificación:**
- ✅ Ventana de Electron abre correctamente
- ✅ Se ve el formulario LoginForm con campos Usuario y Contraseña
- ✅ No hay errores en la consola

---

### PASO 2: LOGIN COMO EMPLEADO

**Credenciales:**
- Usuario: `empleado1`
- Contraseña: `empleado123`

**Acciones:**
1. Escribe `empleado1` en el campo Usuario
2. Escribe `empleado123` en el campo Contraseña
3. Click en botón [Ingresar]
4. Espera a que se procese el login (2-3 segundos)

**Verificación esperada:**
- ✅ Se ejecuta IPC `auth:login` (puedes ver en consola: "INFO [HTTP] Invoking: auth:login")
- ✅ Redirecciona a TurnoScreen
- ✅ Se muestra encabezado con nombre de usuario ("empleado1")
- ✅ Se ve el botón [Crear Turno] (porque no existe turno aún)
- ✅ No hay errores en consola

**Consola esperada:**
```
INFO [HTTP] Invoking: auth:login with args: { username: 'empleado1', password: 'empleado123' }
✓ Response received: { success: true, user: { id: 2, ... } }
TurnoScreen mounted - loading current turno
```

---

### PASO 3: CREAR TURNO

**Acciones:**
1. Click en botón [Crear Turno]
2. Aparece modal de confirmación: "¿Está seguro que desea crear un nuevo turno?"
3. Click en [Crear Turno] (botón azul)
4. Espera 2-3 segundos

**Verificación esperada:**
- ✅ Modal de confirmación aparece
- ✅ Se ejecuta IPC `turno:init` con parámetros `{ usuarioId: 2, negocioId: 1 }`
- ✅ TurnoScreen ahora muestra:
  - Número de turno: "Turno #1"
  - Estado: "ABIERTO" (en color verde)
  - 3 botones para agregar transacciones:
    - [+Registrar Pago Digital] (💳)
    - [-Registrar Compra(Prov)] (📦)
    - [-Registrar Gasto de Caja] (💸)
  - Tabla vacía de transacciones
  - Sección CIERRE DE TURNO (con inputs para valores)

**Consola esperada:**
```
INFO [HTTP] Invoking: turno:init with args: { usuarioId: 2, negocioId: 1 }
✓ Response received: { success: true, turno: { id: X, numero_turno: 1, estado: 'ABIERTO', ... } }
```

---

### PASO 4: AGREGAR PAGO DIGITAL

**Acciones:**
1. Click en botón [+Registrar Pago Digital]
2. Aparece formulario con campos:
   - Valor: (texto numérico)
   - Concepto: (texto)
   - Botones: [Agregar] [Cancelar]
3. Llena el formulario:
   - Valor: `50000`
   - Concepto: `Nequi transfer - cliente Juan`
4. Click en [Agregar]
5. Espera 1-2 segundos

**Verificación esperada:**
- ✅ Formulario aparece correctamente
- ✅ Se ejecuta IPC `transaccion:create` con:
  ```json
  {
    "turnoId": X,
    "valor": 50000,
    "categoria": "PAGO_DIGITAL",
    "concepto": "Nequi transfer - cliente Juan"
  }
  ```
- ✅ La transacción aparece en la tabla:
  - Fila con: Valor: 50000 | Concepto: "Nequi transfer..." | Categoría: PAGO_DIGITAL
  - Botones de acción: [Editar] [Eliminar]
- ✅ El formulario se cierra automáticamente
- ✅ Contador: "1 transacción registrada"

**Consola esperada:**
```
INFO [HTTP] Invoking: transaccion:create with args: { ... }
✓ Response received: { success: true, transaccion: { id: Y, ... } }
```

---

### PASO 5: AGREGAR GASTO DE CAJA

**Acciones:**
1. Click en botón [-Registrar Gasto de Caja]
2. Aparece el mismo formulario
3. Llena los datos:
   - Valor: `10000`
   - Concepto: `Caja chica - escritorio`
4. Click en [Agregar]
5. Espera 1-2 segundos

**Verificación esperada:**
- ✅ Formulario aparece
- ✅ Se ejecuta IPC `transaccion:create` con:
  ```json
  {
    "turnoId": X,
    "valor": 10000,
    "categoria": "GASTO_CAJA",
    "concepto": "Caja chica - escritorio"
  }
  ```
- ✅ La tabla ahora muestra 2 transacciones:
  - Fila 1: 50000 | PAGO_DIGITAL | Nequi transfer...
  - Fila 2: 10000 | GASTO_CAJA | Caja chica...
- ✅ Contador: "2 transacciones registradas"

**Nota:** Los gastos se ven con icono de menos (-) para indicar que son restas

---

### PASO 6: REVISAR CÁLCULOS DE CIERRE

**Ubicación en pantalla:**
Scroll hacia abajo a la sección "CIERRE DE TURNO"

**Verifica estos campos:**

```
Sección: CIERRE DE TURNO
├─ Input 1: "Venta Reportada por POS"
│   └─ Ingresa: 60000
│
├─ Input 2: "Efectivo Contado en Caja"
│   └─ Ingresa: 10000
│
└─ Resultados Calculados (automáticos, no editar):
    ├─ Total Digitales (+): 50000 ✓
    ├─ Total Gastos/Compras (-): -10000 ✓
    ├─ Efectivo Esperado: 60000 ✓
    └─ DIFERENCIA: -50000 ❌ (ROJO - Faltante)
```

**Acciones:**
1. Scroll hacia la sección CIERRE DE TURNO
2. Campo "Venta Reportada por POS": Ingresa `60000`
3. Campo "Efectivo Contado en Caja": Ingresa `10000`
4. Presiona Tab o click en otro campo para disparar cálculos

**Verificación esperada:**
- ✅ "Total Digitales" = 50000 (suma de pagos digitales)
- ✅ "Total Gastos" = -10000 (suma de gastos, negativo)
- ✅ "Efectivo Esperado" = 60000 (POS + Digitales - Gastos = 50000 + 10000 = 60000)
- ✅ "DIFERENCIA" = -50000 (Efectivo Esperado - Efectivo Contado = 60000 - 10000 = 50000)
  - Mostrará en ROJO porque es faltante
  - O VERDE si fuera sobrante

**Fórmula:**
```
Diferencia = (Total Pagos Digitales + Total Gastos/Compras) - Efectivo Contado
           = (50000 - 10000) - 10000
           = 40000 - 10000
           = 30000 FALTANTE
```

---

### PASO 7: CERRAR TURNO

**Acciones:**
1. Scroll a la sección de botones de CIERRE
2. Click en botón [🔒 CERRAR TURNO Y SALIR] (color rojo/danger)
3. Aparece modal de confirmación: "¿Está seguro que desea cerrar el turno?"
4. Lee el mensaje de advertencia
5. Click en [Cerrar Turno] (botón rojo)
6. Espera 2-3 segundos

**Verificación esperada:**
- ✅ Modal de confirmación aparece con icono de advertencia
- ✅ Se ejecuta IPC `turno:close` con `{ turnoId: X }`
- ✅ TurnoScreen cambia a vista de SOLO LECTURA:
  - Estado ahora muestra: "CERRADO" (en color rojo/gris)
  - Los 3 botones de agregar transacciones desaparecen
  - La tabla de transacciones se mantiene (ahora solo lectura)
  - Los inputs de CIERRE se desactivan/ocultan
  - Mensaje: "✓ Turno cerrado exitosamente"
- ✅ Usuario permanece en la pantalla (no logout automático)

**Consola esperada:**
```
INFO [HTTP] Invoking: turno:close with args: { turnoId: X }
✓ Response received: { success: true, turno: { id: X, estado: 'CERRADO', ... } }
✓ Turno cerrado: Turno #1
```

---

### PASO 8: LOGOUT

**Acciones:**
1. Click en el menú de usuario (esquina superior derecha)
2. O busca el botón [Logout] o [Salir]
3. Confirma logout si pide confirmación

**Verificación esperada:**
- ✅ Redirige a LoginForm
- ✅ Pantalla limpia (sin datos del usuario anterior)

---

### PASO 9: LOGIN COMO SUPERVISOR

**Credenciales:**
- Usuario: `supervisor`
- Contraseña: `supervisor123`

**Acciones:**
1. En LoginForm, ingresa supervisor / supervisor123
2. Click en [Ingresar]
3. Espera a que cargue

**Verificación esperada:**
- ✅ Login exitoso
- ✅ Se muestra TurnoScreen
- ✅ Encabezado muestra: "supervisor" (rol: Supervisor)

---

### PASO 10: VERIFICAR TURNO CERRADO COMO SUPERVISOR

**Verificación esperada:**
- ✅ TurnoScreen muestra el Turno #1 creado por empleado1
- ✅ Estado: "CERRADO" (color rojo)
- ✅ Las transacciones se muestran (solo lectura)
- ✅ Aparece botón: [Revisar y Cerrar Día]
- ✅ NO aparecen botones para crear/editar transacciones (permisos de empleado)

**Acciones (Opcional):**
1. Click en [Revisar y Cerrar Día]
2. Aparece RevisionScreen
3. Se carga información del día:
   - Lista de turnos (Turno #1 con estado CERRADO)
   - Resumen de transacciones
   - Botón [Revisar y Cerrar Día] (si todo está válido)

---

## 📊 TABLA RESUMEN DE IPC CALLS

| Paso | IPC Channel | Entrada | Salida Esperada |
|------|-------------|---------|-----------------|
| 2 | `auth:login` | `{ username, password }` | `{ success: true, user: {...} }` |
| 3 | `turno:init` | `{ usuarioId: 2, negocioId: 1 }` | `{ success: true, turno: {...} }` |
| 4 | `transaccion:create` | `{ turnoId, valor: 50000, categoria: 'PAGO_DIGITAL', ... }` | `{ success: true, transaccion: {...} }` |
| 5 | `transaccion:create` | `{ turnoId, valor: 10000, categoria: 'GASTO_CAJA', ... }` | `{ success: true, transaccion: {...} }` |
| 7 | `turno:close` | `{ turnoId: X }` | `{ success: true, turno: { estado: 'CERRADO' } }` |
| 9 | `auth:login` | `{ username: 'supervisor', password }` | `{ success: true, user: {...} }` |

---

## 🔍 CHECKLIST DE VALIDACIÓN

### Validaciones CRÍTICAS ✅

- [ ] Login funciona con credenciales correctas
- [ ] Login rechaza credenciales incorrectas
- [ ] Turno se crea correctamente (número 1)
- [ ] Transacciones se agregan a la tabla
- [ ] Cálculos automáticos son correctos
  - [ ] Total Digitales = suma de pagos digitales
  - [ ] Total Gastos = suma de gastos (negativo)
  - [ ] Efectivo Esperado = correcto
  - [ ] DIFERENCIA = cálculo correcto
- [ ] Turno se cierra sin errores
- [ ] Después de cerrar, vista es de solo lectura
- [ ] Supervisor ve el turno cerrado
- [ ] IPC calls devuelven respuestas `{ success: ... }`

### Validaciones DE SEGURIDAD ✅

- [ ] Empleado NO puede agregar transacciones después de cerrar
- [ ] Supervisor NO puede crear/editar transacciones (rol empleado)
- [ ] Login de empleado inactivo falla
- [ ] Empleado solo ve su propio negocio
- [ ] Las validaciones agregadas en OPCIÓN B funcionan:
  - [ ] Parámetros negativos son rechazados
  - [ ] Usuario inactivo es rechazado
  - [ ] Acceso a negocio diferente es rechazado

### Validaciones DE ERROR ✅

- [ ] Errores de red se manejan gracefully
- [ ] Mensajes de error son claros
- [ ] No hay excepciones sin capturar en consola
- [ ] Confirmaciones de acción funcionan

---

## 🐛 POSIBLES PROBLEMAS Y SOLUCIONES

### Problema 1: Login falla

**Síntoma:** "Usuario o contraseña incorrectos" después de ingresar credenciales

**Posible causa:** Base de datos no inicializada

**Solución:**
```bash
# Ejecuta el script de inicialización
psql -U postgres -d gestorpyme < scripts/init-database.sql
```

---

### Problema 2: IPC timeout

**Síntoma:** "Error al invocar turno:init - timeout"

**Posible causa:** Electron main process no tiene handlers registrados

**Solución:**
1. Abre `electron/main.ts`
2. Verifica que se llame `registerTurnoHandlers()` en `app.whenReady()`
3. Verifica en la consola: "-> [Handler] Turno Handlers registrados."

---

### Problema 3: Transacciones no aparecen en tabla

**Síntoma:** Click en "Agregar" no muestra fila en tabla

**Posible causa:** Hook `useTransacciones` no se actualizó correctamente

**Solución:**
1. Verifica en la consola que `transaccion:create` retorna `{ success: true }`
2. Verifica que el hook en `TurnoScreen.tsx` llame a `refreshTransacciones()` después de crear
3. Abre DevTools (F12) → Network → busca la llamada IPC

---

### Problema 4: Cálculos no se actualizan

**Síntoma:** Cambias valores pero DIFERENCIA no recalcula

**Posible causa:** Listeners de onChange no están conectados

**Solución:**
1. Abre DevTools → Console
2. Busca errores tipo "Cannot read property..."
3. Verifica que los inputs tengan `onChange` handlers en `TurnoScreen.tsx`

---

### Problema 5: Supervisor no ve turno cerrado

**Síntoma:** Login como supervisor muestra "No hay turnos registrados"

**Posible causa:** TurnoScreen no recarga datos cuando login es diferente

**Solución:**
1. Logout y login nuevamente
2. O busca botón [Recargar] / [Actualizar]
3. Verifica que `useEffect` en TurnoScreen se ejecute al cambiar usuario

---

## 📸 PANTALLAZOS ESPERADOS

### Después del LOGIN como empleado1:
```
┌─────────────────────────────────────┐
│ 👤 empleado1 | Logout              │
├─────────────────────────────────────┤
│                                     │
│  🔄 Mi Turno                        │
│  📊 Transacciones                   │
│  📋 Revisión de Día                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  TURNO DEL DÍA                      │
│  ──────────────────────────────────│
│                                     │
│  [Crear Turno]  ← Button aquí       │
│                                     │
│  "No hay turno activo para hoy"     │
│                                     │
└─────────────────────────────────────┘
```

### Después de CREAR TURNO:
```
┌─────────────────────────────────────┐
│ Turno #1 | Estado: ABIERTO ✓       │
├─────────────────────────────────────┤
│                                     │
│ [+💳 Pago Digital] [-📦 Compra] [-💸 Gasto] │
│                                     │
│ TRANSACCIONES REGISTRADAS:          │
│ ┌───┬──────┬────────┬──────────┐   │
│ │ # │Valor │Categoría│Concepto  │   │
│ ├───┼──────┼────────┼──────────┤   │
│ │ 1 │50000 │PAGO_DIG│Nequi... │   │
│ │ 2 │10000 │GASTO...|Caja chica│   │
│ └───┴──────┴────────┴──────────┘   │
│                                     │
│ CIERRE DE TURNO:                    │
│ Venta Reportada: [60000]            │
│ Efectivo Contado: [10000]           │
│                                     │
│ Total Digitales: 50000              │
│ Total Gastos: -10000                │
│ Efectivo Esperado: 60000            │
│ DIFERENCIA: -50000 🔴              │
│                                     │
│ [🔒 CERRAR TURNO Y SALIR]          │
│                                     │
└─────────────────────────────────────┘
```

---

## 📝 NOTAS IMPORTANTES

### Diferenciales clave:

1. **PAGO_DIGITAL (se suma)**
   - Efectivo que entra
   - Color: verde
   - Ejemplo: Nequi, Daviplata, transferencia

2. **GASTO_CAJA (se resta)**
   - Efectivo que sale
   - Color: rojo
   - Ejemplo: Caja chica, gastos operacionales

3. **COMPRA_PROV (se resta)**
   - Compra a proveedores
   - Color: rojo
   - Ejemplo: Medicinas, artículos

### Fórmula de DIFERENCIA:
```
Diferencia = Efectivo Esperado - Efectivo Contado
           = (POS + Digitales - Gastos) - Efectivo Contado
```

Si es POSITIVO → Sobrante (ganancia inesperada)
Si es NEGATIVO → Faltante (pérdida inesperada)

---

## ✅ AL FINALIZAR LA PRUEBA

Completa este resumen:

**Fecha Prueba:** _______________
**Usuario:** _______________
**Resultado General:** ☐ EXITOSO ☐ CON ERRORES

**Errores encontrados:**
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

**Observaciones:**
```
________________________________________________________
________________________________________________________
________________________________________________________
```

**Siguiente acción:**
☐ Todos los pasos funcionaron - Pasar a OPCIÓN C (Tests E2E)
☐ Hay errores - Revisar consola y logs
☐ Hay validaciones rotas - Verificar handlers

---

**Documento creado:** Noviembre 2025

