# 🚀 PLAN DE DESARROLLO - Próximas Tareas

**Estado actual:** 60% completado
**Fecha:** Noviembre 2025

---

## 📋 ANÁLISIS ACTUAL

### ✅ Handlers YA IMPLEMENTADOS

**Auth:**
- `auth:login` ✅

**Turno:**
- `turno:init` ✅
- `turno:current` ✅
- `turno:get` ✅
- `turno:close` ✅
- `turno:getByDay` ✅
- `turno:history` ✅
- `turno:confirmAudit` ✅

**Transaccion:**
- `transaccion:create` ✅
- `transaccion:getByTurno` ✅
- `transaccion:list` ✅
- `transaccion:update` ✅
- `transaccion:delete` ✅
- `transaccion:confirmAudit` ✅

**Catalogo:**
- `catalogo:getProveedores` ✅
- `catalogo:createProveedor` ✅
- `catalogo:updateProveedor` ✅
- `catalogo:deleteProveedor` ✅
- `catalogo:getTiposGasto` ✅
- `catalogo:createTipoGasto` ✅
- `catalogo:updateTipoGasto` ✅
- `catalogo:deleteTipoGasto` ✅
- `catalogo:getTiposPagoDigital` ✅
- `catalogo:createTipoPagoDigital` ✅
- `catalogo:updateTipoPagoDigital` ✅
- `catalogo:deleteTipoPagoDigital` ✅

**Total: 26 handlers implementados**

---

## ❌ HANDLERS FALTANTES (CRÍTICOS)

Para que la app funcione completamente, necesitamos:

1. **`negocio:getByUser`** - AdminNegocioSelector requiere esto
   - Obtener negocios a los que pertenece un usuario
   - SQL: `SELECT negocios.* FROM miembros JOIN negocios ON miembros.negocio_id = negocios.id WHERE miembros.usuario_id = $1`

2. **`dia-contable:getCurrent`** - RevisionScreen requiere esto
   - Obtener el día contable actual con sus turnos y transacciones
   - SQL: `SELECT * FROM dias_contables WHERE negocio_id = $1 AND fecha = TODAY`

3. **`dia-contable:review`** - RevisionScreen requiere esto
   - Marcar el día como REVISADO
   - SQL: `UPDATE dias_contables SET estado = 'REVISADO' WHERE negocio_id = $1 AND fecha = TODAY`

---

## 📊 PLAN DE TRABAJO PROPUESTO

### OPCIÓN A: Completar Handlers Primero (RECOMENDADO)
**Duración:** 2-3 horas
**Prioridad:** Alta
**Impacto:** Desbloquea RevisionScreen y AdminSelector

```
1. Crear negocioHandlers.ts (20 min)
   └─ Implementar negocio:getByUser

2. Crear diaContableHandlers.ts (40 min)
   └─ Implementar dia-contable:getCurrent
   └─ Implementar dia-contable:review

3. Registrar en main.ts (5 min)

4. Conectar frontend (10 min)
   └─ RevisionScreen.tsx
   └─ AdminNegocioSelector.tsx

5. Testear manualmente (30 min)
```

### OPCIÓN B: Mejoras Primero
**Duración:** 3-4 horas
**Prioridad:** Media
**Impacto:** Robustez

```
1. Mejorar validaciones en turnoHandlers.ts (60 min)
   └─ Validar usuario pertenece a negocio
   └─ Validar usuario activo
   └─ Mensajes de error específicos

2. Mejorar validaciones en transaccionHandlers.ts (60 min)
   └─ Idem turno

3. Ejecutar tests E2E (30 min)
   └─ Encontrar y arreglar errores

4. Luego implementar handlers faltantes
```

### OPCIÓN C: Mixto (BALANCEADO)
**Duración:** 4-5 horas
**Impacto:** Funcional + Robusto

```
1. Implementar 3 handlers faltantes (1 hora)
2. Mejorar validaciones (1 hora)
3. Tests E2E (30 min)
4. Polish y bugs (30 min)
```

---

## 🎯 MI RECOMENDACIÓN

**OPCIÓN A** es la mejor porque:
- ✅ Desbloquea la app (60% → 70%)
- ✅ Permite probar end-to-end
- ✅ Rápido de implementar (código simple)
- ✅ Luego tenemos base para mejorar validaciones

**Flujo recomendado:**
1. Opción A (handlers) → 2-3 horas
2. Testing manual → 1 hora
3. Luego Opción B (validaciones)

---

## 📝 LO QUE VOY A HACER (Si confirmas OPCIÓN A)

```
TAREA 1: Crear negocioHandlers.ts
└─ 1 handler: negocio:getByUser

TAREA 2: Crear diaContableHandlers.ts
└─ 2 handlers: dia-contable:getCurrent y dia-contable:review

TAREA 3: Registrar handlers en main.ts

TAREA 4: Conectar frontend
└─ Actualizar RevisionScreen.tsx
└─ Actualizar AdminNegocioSelector.tsx

TAREA 5: Testing manual
└─ Login → AdminSelector
└─ Login → Crear turno → Cierre → Revisión
```

---

## ⚠️ NOTAS IMPORTANTES

- No voy a cambiar código existente que funciona
- Solo voy a agregar los handlers faltantes
- Mantendré la misma estructura que los handlers existentes
- Documentaré todo en este archivo

---

## ✅ ¿CONFIRMAS QUE PROCEDA CON OPCIÓN A?

**SÍ → Empiezo inmediatamente**
**NO → Cuéntame qué prefieres (A, B, C, u otro)**
**OTRA COSA → Dime qué necesitas**

---

