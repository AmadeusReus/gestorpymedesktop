# 🎯 Resumen Visual del Proyecto - GestorPyME Desktop

**Rápida visión general de qué existe y cómo funciona**

---

## 🏢 ¿Qué es?

**GestorPyME Desktop** = Aplicación de escritorio para **gestionar cierres de caja en farmacias**

- ✅ Registrar turnos de empleados
- ✅ Registrar transacciones (pagos, gastos)
- ✅ Calcular diferencias de caja automáticamente
- ✅ Supervisores revisan y cierran el día
- ✅ Administradores auditan todo

---

## 👥 Actores y Roles

```
┌──────────────────────────────────────────────────────────┐
│                    USUARIO                               │
│  (Empleado / Supervisor / Administrador)                 │
└──────────────┬───────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ┌───────┐    ┌────────┐
    │ LOGIN │───▶│SELECCIONAR
    │       │    │ NEGOCIO
    └───────┘    └────────┘
        │            │
        └──────┬─────┘
               ▼
         ┌──────────────┐
         │ DASHBOARD    │
         │ (Sidebar +   │
         │  Pantalla)   │
         └──────────────┘
```

---

## 🎨 Pantallas por Rol

### EMPLEADO
```
┌─────────────────────────────────────────┐
│ 📊 MI TURNO (TurnoScreen)               │
│                                         │
│ [Crear Turno] ◄─── Sin turno            │
│                                         │
│ [Ver Transacciones] ◄─── Con turno      │
│ [Cerrar Turno]                          │
│                                         │
│ 📝 TRANSACCIONES (TransaccionesScreen)  │
│ [Agregar Pago Digital]                  │
│ [Agregar Gasto/Compra]                  │
│ [Ver Historial]                         │
└─────────────────────────────────────────┘
```

### SUPERVISOR
```
┌─────────────────────────────────────────┐
│ 📊 MI TURNO (TurnoScreen - solo lectura)│
│ Ver todos los turnos del día            │
│                                         │
│ 📝 TRANSACCIONES (todas del día)        │
│                                         │
│ 🔍 REVISIÓN (RevisionScreen)            │
│ [Revisar y Cerrar Día]                  │
│                                         │
│ 📋 AUDITORÍA (AuditoriaScreen)          │
│ [Confirmar transacciones]               │
│ [Ver estadísticas]                      │
└─────────────────────────────────────────┘
```

### ADMINISTRADOR
```
┌─────────────────────────────────────────┐
│ 🏢 SELECCIONAR NEGOCIO (si tiene 2+)    │
│                                         │
│ 📊 MI TURNO (modo recuperación)         │
│ [Crear Turno Manual]                    │
│                                         │
│ 📝 TRANSACCIONES (todas)                │
│                                         │
│ 🔍 REVISIÓN (igual que supervisor)      │
│                                         │
│ 📋 AUDITORÍA (igual que supervisor)     │
│                                         │
│ ⚙️ GESTIÓN (GestionScreen)              │
│ [Estadísticas]                          │
│ [Historial de operaciones]              │
│ [Configuración]                         │
│                                         │
│ 📚 CATÁLOGOS (CatalogoScreen)           │
│ [Proveedores]                           │
│ [Tipos de Gasto]                        │
│ [Tipos de Pago Digital]                 │
└─────────────────────────────────────────┘
```

---

## 📱 Flujo de Transacción (Lo más frecuente)

```
1. EMPLEADO ACCEDE
   ↓
   [Login] ─▶ Autentica username/password
   ↓
2. SELECCIONA TURNO
   ↓
   ¿Existe turno hoy? ─▶ SÍ ─▶ [Ver Turno]
                        │
                        NO
                        ↓
                    [Crear Turno]
   ↓
3. REGISTRA TRANSACCIONES
   ↓
   [Agregar Transacción]
   [Agregar otra...]
   [Agregar otra...]
   ↓
4. CALCULA CAJA
   ↓
   Ingresa efectivo contado
   Ingresa venta reportada
   ─▶ Sistema calcula diferencia
   ↓
5. CIERRA TURNO
   ↓
   [Cerrar Turno] ─▶ Estado = CERRADO
   ↓
6. SUPERVISOR REVISA
   ↓
   Ve resumen del día
   Verifica que todos los turnos estén cerrados
   [Revisar Día] ─▶ Estado = REVISADO
   ↓
7. ADMINISTRADOR AUDITA
   ↓
   Ve todas las transacciones
   [Confirmar] ─▶ Auditoría completa
```

---

## 🏗️ Arquitectura en Capas

```
┌─────────────────────────────────────────┐
│         REACT FRONTEND (src/)           │
├─────────────────────────────────────────┤
│  [Componentes] → [Hooks] → [Services]   │
│  Button, Card   useAuth   turnoService  │
│  Input, Table   useTurno  transaccionS. │
│  Sidebar, etc   useCatalogos            │
├─────────────────────────────────────────┤
│     IPC (Electron Inter-Process Comm)   │
├─────────────────────────────────────────┤
│       ELECTRON MAIN (electron/)         │
├─────────────────────────────────────────┤
│ [Handlers] → [Services] → [Repositories]│
│ auth:login    authService  userRepository
│ turno:init    (business)   (data access)
│ transaccion:* ...          ...
├─────────────────────────────────────────┤
│        PostgreSQL DATABASE              │
├─────────────────────────────────────────┤
│ Tablas: usuarios, turnos, transacciones,│
│         negocios, miembros, catálogos   │
└─────────────────────────────────────────┘
```

---

## 📊 Flujo de Datos: Crear Transacción

```
┌──────────────────────────────┐
│ TurnoScreen.tsx              │
│ (Usuario ingresa monto)      │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│ useTransacciones.ts          │
│ (Hook - maneja estado)       │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│ transaccionService.ts        │
│ (Llama al backend)           │
│ await httpClient.invoke(     │
│   'transaccion:create', {...}│
│ )                            │
└───────────┬──────────────────┘
            │
    ┌───────┴────────┐
    │   IPC CALL     │
    │ (Electron)     │
    └───────┬────────┘
            │
            ▼
┌──────────────────────────────┐
│ transaccionHandlers.ts       │
│ (Backend handler)            │
│ handleCreateTransaccion()    │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│ database.ts                  │
│ (Ejecuta SQL)                │
│ INSERT INTO transacciones... │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│ PostgreSQL                   │
│ (Almacena datos)             │
└───────────┬──────────────────┘
            │
    ┌───────┘
    │ Response con transacción creada
    ▼
┌──────────────────────────────┐
│ TurnoScreen.tsx              │
│ (Re-renderiza tabla)         │
│ Nueva transacción visible    │
└──────────────────────────────┘
```

---

## 🎯 Estado Actual (60% completado)

### ✅ HECHO

**Frontend (85%)**
- ✅ Todos los componentes comunes (Button, Card, Input, etc.)
- ✅ Layout (Header, Sidebar, DashboardLayout)
- ✅ Todas las pantallas con UI
- ✅ Todos los hooks de lógica
- ✅ Todos los servicios de API
- ✅ Estilos para todo

**Backend (45%)**
- ✅ Autenticación (login)
- ✅ Handlers para turnos, transacciones, catálogos (básicos)
- ✅ Conexión a PostgreSQL
- ✅ Password hashing (bcryptjs)

### ⏳ PENDIENTE

**Frontend (Conectar con backend)**
- 🟡 RevisionScreen (UI ✅, backend ❌)
- 🟡 GestionScreen (UI ✅, backend ❌)

**Backend (Completar handlers)**
- ❌ Mejorar validaciones
- ❌ Implementar `dia-contable:getCurrent`
- ❌ Implementar `dia-contable:review`
- ❌ Implementar `negocio:getByUser`
- ❌ Implementar `negocio:getStats`
- ❌ Implementar paginación en transacciones

---

## 📚 Qué Leer Según Necesites

```
┌─────────────────┐
│ ¿DÓNDE EMPIEZO? │
└────────┬────────┘
         │
    ┌────┴────────────────────────────┐
    │                                  │
    ▼                                  ▼
┌──────────────┐            ┌──────────────────┐
│ QUICK-START  │            │ ESTADO-ACTUAL    │
│ (5 min)      │            │ (10 min)         │
│ Setup BD     │            │ Qué está hecho   │
│ Correr app   │            │ Qué falta        │
└──────────────┘            └──────────────────┘
         │                          │
         └──────────┬───────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌─────────┐        ┌──────────────┐
    │ CÓDIGO  │        │ ARQUITECTURA │
    └────┬────┘        └──────┬───────┘
         │                    │
         ▼                    ▼
    ┌──────────────┐  ┌──────────────┐
    │MAPA-CODEBASE │  │ARQUITECTURA- │
    │(15 min)      │  │FRONTEND      │
    │Dónde está    │  │(20 min)      │
    │cada cosa     │  │Cómo funciona │
    └──────────────┘  └──────────────┘
```

---

## 🚀 Próximos Pasos de Mayor Impacto

### ALTA PRIORIDAD (Bloquean funcionalidad)
1. **Conectar RevisionScreen**: Implementar `dia-contable:review`
2. **Conectar GestionScreen**: Implementar `negocio:getStats`
3. **Implementar AdminNegocioSelector**: Handler `negocio:getByUser`

### MEDIA PRIORIDAD (Mejoran flujo)
4. Mejorar validaciones en handlers
5. Ejecutar tests E2E
6. Mejor manejo de errores

### BAJA PRIORIDAD (Polish)
7. Reportes (PDF/Excel)
8. Responsive mobile
9. Optimizaciones de performance

---

## 🔐 Seguridad Implementada

✅ Hashing de contraseñas con bcryptjs (12 rounds)
✅ Context isolation en Electron habilitado
✅ Preload script seguro (sin Node en renderer)
✅ IPC validado (no se acepta cualquier mensaje)
✅ Usuarios inactivos no pueden loguearse
✅ Validaciones de roles en handlers

---

## 📂 Carpetas Clave

```
src/                    ← FRONTEND
  screens/              ← Pantallas (TurnoScreen, etc.)
  hooks/                ← Lógica (useTurno, etc.)
  api/                  ← Servicios (turnoService, etc.)
  components/           ← Componentes UI
  styles/               ← CSS

electron/               ← BACKEND
  handlers/             ← IPC handlers
  services/             ← Business logic
  repositories/         ← Data access
  main.ts               ← Electron entry
  database.ts           ← PostgreSQL

docs/                   ← DOCUMENTACIÓN
  ESTADO-ACTUAL.md      ← Qué falta (LEER ESTO)
  MAPA-CODEBASE.md      ← Dónde está el código (LEER ESTO)
  ARQUITECTURA-FRONTEND.md ← Cómo funciona
```

---

## 💡 Tips Rápidos

1. **Para ver el estado actual**: Lee `ESTADO-ACTUAL.md`
2. **Para encontrar un archivo**: Lee `MAPA-CODEBASE.md`
3. **Para empezar**: Lee `QUICK-START.md`
4. **Para entender roles**: Lee `REGLAS-DE-NEGOCIO-TURNO.md`
5. **Para correr tests**: Lee `TEST-GUIDE.md`

---

## 🎓 Lección Rápida

**El flujo típico de una operación:**

```
1. Usuario hace algo en la UI (ej: [Crear Transacción])
   ↓
2. Componente React llama a un Hook (ej: useTransacciones)
   ↓
3. Hook llama a un Servicio (ej: transaccionService)
   ↓
4. Servicio llama a httpClient.invoke()
   ↓
5. httpClient hace IPC call a Electron
   ↓
6. Electron ejecuta un Handler (ej: handleCreateTransaccion)
   ↓
7. Handler accede a la BD vía Repository
   ↓
8. Resultado vuelve al Hook y actualiza el estado
   ↓
9. Componente se re-renderiza con nuevos datos
```

---

**¿Listo para empezar? Lee `QUICK-START.md` →**

**¿Quieres entender qué falta? Lee `ESTADO-ACTUAL.md` →**

**¿Necesitas navegar el código? Lee `MAPA-CODEBASE.md` →**

---

Última actualización: Noviembre 2025
