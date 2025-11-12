# 🎯 Reglas de Negocio - Gestión de Turnos

## Resumen

Este documento detalla las reglas de negocio que implementa el sistema de turnos para cada rol de usuario.

## 1. Roles y Asignación a Negocios

### EMPLEADO
- **Pertenencia**: Exactamente UN negocio
- **En BD**: `miembros(usuario_id, negocio_id, rol='empleado')`
- **Múltiples negocios**: ❌ NO permitido
- **Ejemplo**:
  - empleado1 → Farmacia Test SOLAMENTE
  - empleado2 → Farmacia Test SOLAMENTE

### SUPERVISOR
- **Pertenencia**: Exactamente UN negocio
- **En BD**: `miembros(usuario_id, negocio_id, rol='supervisor')`
- **Múltiples negocios**: ❌ NO permitido
- **Ejemplo**:
  - supervisor → Farmacia Test SOLAMENTE

### ADMINISTRADOR (Dueño)
- **Pertenencia**: Puede estar en MÚLTIPLES negocios
- **En BD**: `miembros(usuario_id, negocio_id, rol='administrador')`
- **Múltiples negocios**: ✅ SÍ permitido
- **Ejemplo**:
  - admin → Farmacia Test (administrador)
  - admin → Farmacia Central (administrador)

## 2. Gestión de Turnos por Rol

### EMPLEADO - Crear Turno

**Condiciones para crear:**
```
✅ SI:
  - No existe ningún turno ese día
  - El usuario es empleado

❌ NO:
  - Ya existe un turno ese día (creado por cualquier empleado)
  - El usuario es inactivo
  - El negocio no existe
```

**Flujo:**
```
1. Empleado1 accede a TurnoScreen
2. No hay turno → Botón "Crear Turno" disponible
3. Click → initTurno(negocioId=1)
4. Backend:
   - Busca/crea dias_contables(negocio_id=1, fecha=HOY)
   - Crea turno(dia_contable_id, usuario_id=empleado1, numero_turno=1)
5. BD marca: usuario_id=2 (empleado1) creó este turno
6. Estado: ABIERTO
7. Empleado1 ve botón "Cerrar Turno"
```

**¿Qué ve otro empleado?**
```
Empleado2 accede a TurnoScreen
1. Busca turno del día
2. Encuentra: numero_turno=1, usuario_id=2
3. usuario_id != empleado2.id
4. Mostra: "⚠️ Turno ya creado por otro empleado"
5. NO tiene botón "Crear Turno"
6. Solo lectura del turno creado
```

### EMPLEADO - Cerrar Turno

**Condiciones:**
```
✅ SÍ puede cerrar:
  - Es el creador del turno (usuario_id == auth.user.id)
  - Turno está ABIERTO

❌ NO puede:
  - Turno creado por otro empleado
  - Turno está CERRADO o REVISADO
```

**Datos al cerrar:**
```
El empleado ingresa (frontend):
- Efectivo contado en caja
- Venta reportada en POS

Frontend calcula:
- suma = efectivo_contado + pagos_digitales + compras + gastos
- diferencia = venta_reportada - suma

Interpretación de diferencia:
- Si diferencia < 0: Sobrante (suma > venta_reportada)
- Si diferencia > 0: Faltante (suma < venta_reportada)
- Si diferencia = 0: Cuadrado perfecto

Turno se actualiza a estado: CERRADO
```

### EMPLEADO - Transacciones

**Permisos:**
```
✅ Puede:
  - Ver transacciones de su propio turno
  - Crear transacciones (categorías: PAGO_DIGITAL, GASTO_CAJA, etc)
  - Ver historial de transacciones

❌ NO puede:
  - Modificar transacciones de otros empleados
  - Confirmar en auditoría (eso es supervisor/admin)
  - Ver datos de otros negocios
```

## 3. SUPERVISOR - Revisión de Día

### Permisos Generales
```
✅ Puede:
  - Ver TODOS los turnos del día
  - Ver TODAS las transacciones del día
  - Ver detalles (quien creó, cuándo, diferencia)
  - Revisar/cerrar el día

❌ NO puede:
  - Crear turnos
  - Modificar turnos/transacciones
  - Crear en otros negocios
```

### Flujo de Revisión

**Requisitos para "Revisar Día":**
```
1. Turno debe estar CERRADO (no ABIERTO)
2. El supervisor accede a RevisionScreen
3. Ve:
   - Todos los turnos del día
   - Total de transacciones
   - Diferencias finales
   - Validaciones
4. Botón "Revisar Día" disponible
5. Click → Cambia estado día a: REVISADO
```

**Después de Revisión:**
```
- Estado día: REVISADO
- Turno: REVISADO
- Nadie puede modificar datos ese día
- Solo audit puede confirmar con firma/comentarios
```

### Transacciones en Revisión
```
✅ Puede:
  - Ver todas las transacciones
  - Confirmar transacciones en auditoría
  - Agregar comentarios

❌ NO puede:
  - Modificar valores
  - Borrar transacciones
  - Cambiar categoría
```

## 4. ADMIN - Recuperación y Gestión

### Roles
```
El admin es DUEÑO de uno o más negocios.
Cuando selecciona un negocio:
  - user.negocioId = negocio_seleccionado
  - Ve turnoScreen como si fuera empleado
  - Acceso a GestionScreen (extra)
```

### Crear Turno - Modo Recuperación

**Cuándo se permite:**
```
✅ SOLO SI:
  - No existe turno ese día
  - AND No existen transacciones ese día
  - AND usuario es administrador

Esto se llama: MODO RECUPERACIÓN
Propósito: Inicializar día si hubo error/reset
```

**Flujo:**
```
1. Admin accede a TurnoScreen
2. No hay turno → Botón "Crear Turno Manual"
3. Backend verifica:
   - SELECT COUNT(*) FROM turnos WHERE dia_contable_id = ?
   - Debe ser = 0
4. Si es 0 → Permite crear
5. Crea turno con usuario_id = admin
6. Turno marcado como "creado por admin"
7. Otros empleados ven que turno está "ocupado"
```

### Borrar Turno - Protecciones

**Admin NO puede borrar si:**
```
❌ Turno fue creado por empleado (usuario_id != admin.id)
❌ Existen transacciones en ese turno
❌ Día ya fue revisado

✅ Solo puede borrar:
  - Turno creado por admin mismo
  - Sin transacciones
  - Día no revisado
```

**Razón:**
```
Si empleado1 ya creó turno + agregó transacciones:
→ Admin NO puede borrar (violaría auditoría)

Si admin creó turno manual + se da cuenta que fue error:
→ Admin PUEDE borrar (es su responsabilidad)
```

### GestionScreen

**Admin en GestionScreen puede:**
```
✅ Gestión de Turno:
  - Ver turnos históricos
  - Crear turno manual (recuperación)
  - Borrar turno (si cumple condiciones)

✅ Catálogos:
  - Crear/editar/borrar proveedores
  - Crear/editar/borrar tipos de gasto
  - Crear/editar/borrar tipos de pago digital

✅ Auditoría Completa:
  - Ver todas las transacciones
  - Ver quién creó cada turno
  - Confirmar/rechazar auditorías
  - Generar reportes
```

## 5. Selección de Negocio - Admin Múltiples

### Flujo

**Admin con 1 negocio:**
```
1. Login → Ir directamente a TurnoScreen
2. user.negocioId = 1 (único negocio)
3. No mostrar selector
```

**Admin con 2+ negocios:**
```
1. Login → MainApp verifica
2. GET negocios = [{id:1, nombre:'Farmacia Test'}, {id:2, nombre:'Farmacia Central'}]
3. Mostrar AdminNegocioSelector
4. Admin selecciona → setNegocioId = 1
5. Ir a TurnoScreen con negocioId=1
6. En sidebar, admin puede cambiar de negocio
7. Cada negocio tiene datos aislados
```

### Datos por Negocio

```
Cuando admin está en negocio_id=1:
✅ Ve turnos de negocio_id=1
✅ Ve transacciones de negocio_id=1
✅ Ve empleados asignados a negocio_id=1
❌ NO ve negocio_id=2

Cuando cambia a negocio_id=2:
✅ Ve turnos de negocio_id=2
✅ Ve transacciones de negocio_id=2
✅ Ve empleados asignados a negocio_id=2
❌ NO ve negocio_id=1
```

## 6. Restricciones por Usuario Inactivo

### Usuario Inactivo
```
En BD: usuarios(activo=FALSE)

✅ Puede:
  - Existir en tabla MIEMBROS
  - Tener asignación a negocio

❌ NO puede:
  - Hacer login
  - Crear turno
  - Agregar transacciones
  - Acceder a la aplicación
```

**En datos de prueba:**
```
usuario: inactivo (id=5)
- Nombre: "Usuario Inactivo"
- Username: inactivo
- Contraseña: admin123 (hash válido)
- activo = FALSE

Intento de login:
→ Backend: "Cuenta desactivada"
→ Usuario rechazado
```

## 7. Auditoría y Trazabilidad

### Campos Clave

```
Tabla TURNOS:
- id: PK
- usuario_id: ¿Quién creó? (empleado o admin)
- numero_turno: 1 o 2
- estado: ABIERTO|CERRADO|REVISADO
- created_at: Cuándo se creó

Tabla TRANSACCIONES:
- id: PK
- turno_id: A qué turno pertenece
- valor: Monto
- categoria: PAGO_DIGITAL|GASTO_CAJA|...
- confirmado_auditoria: ¿Confirmado?
- auditor_id: Quién confirmó
- created_at: Cuándo se creó
```

### Validaciones

```
No permitir:
- Crear 2 turnos el mismo día
- Borrar turno con transacciones
- Modificar turno REVISADO
- Empleado viendo otro negocio
- Admin sin seleccionar negocio
```

## 8. Tabla de Decisión

| Acción | Empleado | Supervisor | Admin | Condición |
|--------|----------|-----------|-------|-----------|
| Ver turno | ✅ Propio | ✅ Todos | ✅ Todos | Mismo negocio |
| Crear turno | ✅ Si no existe | ❌ | ✅ Si no existe | usuario_id marca creador |
| Cerrar turno | ✅ Propio | ❌ | ✅ Todos | Solo si ABIERTO |
| Borrar turno | ❌ | ❌ | ✅ Si sin datos | Solo propio + sin transacciones |
| Ver transacciones | ✅ Propias | ✅ Todas | ✅ Todas | Mismo negocio |
| Crear transacción | ✅ Propio | ❌ | ✅ | En turno del día |
| Revisar día | ❌ | ✅ | ✅ | Si turno CERRADO |
| Auditoría | ❌ | ✅ | ✅ | Confirmar datos |
| Catálogos | ❌ | ❌ | ✅ | Admin solo |

## 9. Código Frontend - Ejemplos

### Renderizado según rol en TurnoScreen

```typescript
// EMPLEADO
if (user.rol === 'empleado') {
  if (!turno) {
    // No existe turno
    <Button onClick={createTurno}>Crear Turno</Button>
  } else if (turno.usuario_id === user.id) {
    // Es suyo
    <Button onClick={closeTurno}>Cerrar Turno</Button>
  } else {
    // De otro empleado
    <Alert>Turno ya creado por otro empleado</Alert>
    // Sin botón crear
  }
}

// SUPERVISOR
if (user.rol === 'supervisor') {
  <DisplayTurnoInfo turno={turno} />
  if (turno?.estado === 'CERRADO') {
    <Button onClick={reviewDay}>Revisar Día</Button>
  }
}

// ADMIN
if (user.rol === 'administrador') {
  if (!turno) {
    // Modo recuperación
    <Button onClick={createTurnoManual}>Crear Turno Manual</Button>
  } else {
    // Solo lectura
    <DisplayTurnoInfo turno={turno} readonly />
  }
}
```

## 10. Validaciones Backend (IPC Handlers)

```javascript
// turno:init
handler('turno:init', async (event, negocioId) => {
  // Validar usuario está logueado
  // Validar usuario pertenece a negocioId
  // Validar NO existe turno ese día
  // Crear dia_contable si no existe
  // Crear turno
  // Return: Turno creado
})

// turno:close
handler('turno:close', async (event, turnoId) => {
  // Validar turno existe
  // Validar usuario_id == usuario logueado (empleado)
  // Validar turno.estado == 'ABIERTO'
  // Actualizar: estado='CERRADO', campos calculados
  // Return: Turno actualizado
})

// negocio:getByUser
handler('negocio:getByUser', async (event, userId) => {
  // Validar usuario existe
  // SELECT negocios FROM miembros WHERE usuario_id = ?
  // Return: Array de negocios con rol
})
```

---

**Última actualización**: 2025-11-06
**Versión**: 1.0
**Estado**: Implementado en Frontend
