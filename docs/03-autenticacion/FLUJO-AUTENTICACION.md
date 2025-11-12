# 🔐 Flujo de Autenticación - GestorPyME

Documentación completa del flujo de autenticación y autorización en GestorPyME Desktop.

## 📊 Estructura de Datos

### Tres Tablas Clave

```
┌─────────────────┐
│    USUARIOS     │
├─────────────────┤
│ id (PK)         │
│ username        │  ← Credencial de login
│ password_hash   │  ← Hash bcrypt
│ nombre_completo │
│ activo          │  ← Si está activo/inactivo
└─────────────────┘
         ↓ (1:N)
┌─────────────────┐
│    MIEMBROS     │
├─────────────────┤
│ id (PK)         │
│ usuario_id (FK) │
│ negocio_id (FK) │  ← A qué negocio pertenece
│ rol (CHECK)     │  ← empleado|supervisor|administrador
└─────────────────┘
         ↓ (N:1)
┌─────────────────┐
│   NEGOCIOS      │
├─────────────────┤
│ id (PK)         │
│ nombre_negocio  │
└─────────────────┘
```

## 👥 Asignación de Usuarios (Datos de Prueba)

### Regla Fundamental

**Solo el administrador (dueño) puede pertenecer a múltiples negocios.**

Los empleados y supervisores pertenecen a **exactamente UN negocio**.

### Configuración Actual

```
USUARIOS:
├── admin (ID=1) ✓ ACTIVO
├── empleado1 (ID=2) ✓ ACTIVO
├── empleado2 (ID=3) ✓ ACTIVO
├── supervisor (ID=4) ✓ ACTIVO
└── inactivo (ID=5) ✗ INACTIVO

ASIGNACIONES (MIEMBROS):

FARMACIA TEST (negocio_id=1):
├── admin → rol: administrador (dueño)
├── empleado1 → rol: empleado ← LLENA LOS TURNOS
├── empleado2 → rol: empleado
├── supervisor → rol: supervisor ← REVISA LOS DÍAS
└── inactivo → rol: empleado (pero usuario inactivo)

FARMACIA CENTRAL (negocio_id=2):
└── admin → rol: administrador (dueño - único caso de múltiples)
```

## 🔄 Flujo de Login (Paso a Paso)

### 1️⃣ Usuario Ingresa Credenciales

```
┌────────────────────────────┐
│ LOGIN FORM                 │
├────────────────────────────┤
│ Usuario: empleado1         │
│ Contraseña: empleado123    │
│ [INGRESAR]                 │
└────────────────────────────┘
```

### 2️⃣ Frontend Envía IPC

```typescript
// En useAuth hook
const response = await httpClient.invoke('auth:login', username, password);
```

### 3️⃣ Backend Procesa (authHandlers.ts → authService.ts)

#### Paso 3.1: Buscar Usuario en BD

```sql
SELECT * FROM usuarios WHERE username = 'empleado1'
```

**Resultado:**
```
id: 2
username: empleado1
nombre_completo: Empleado Uno
password_hash: $2b$12$ROJcNZVdO8rt6uh2YreRv.ln6GoY11VY88.ozpDNI2zqni5Bu8xyO
activo: TRUE
```

#### Paso 3.2: Verificar que Está Activo

```typescript
if (!userRecord.activo) {
  return { success: false, error: 'Cuenta desactivada' }
}
```

✅ Es ACTIVO → continuar

#### Paso 3.3: Verificar Contraseña

```typescript
const isValid = await verifyPassword('empleado123', passwordHash)
// bcrypt.compare('empleado123', hash) → TRUE ✅
```

✅ Contraseña válida → continuar

#### Paso 3.4: Obtener Rol y Negocio

```sql
SELECT * FROM miembros WHERE usuario_id = 2
```

**Resultado:**
```
id: 2
usuario_id: 2
negocio_id: 1
rol: empleado
```

⚠️ **Solo hay UN resultado** (porque empleado1 solo está en Farmacia Test)

#### Paso 3.5: Retornar Respuesta

```typescript
return {
  success: true,
  user: {
    id: 2,
    username: 'empleado1',
    nombreCompleto: 'Empleado Uno',
    rol: 'empleado',
    negocioId: 1  ← ¡IMPORTANTE!
  }
}
```

### 4️⃣ Frontend Almacena Sesión

```typescript
// En useAuth hook
setUser({
  id: 2,
  username: 'empleado1',
  nombreCompleto: 'Empleado Uno',
  rol: 'empleado',
  negocioId: 1
})
```

### 5️⃣ Dashboard Se Carga

```tsx
if (user) {
  return (
    <DashboardLayout user={user}>
      {/* Mostrar según rol y negocioId */}
      {user.rol === 'empleado' && (
        <TurnoScreen negocioId={user.negocioId} />
      )}
    </DashboardLayout>
  )
}
```

## ✅ Casos de Uso Ahora Funcionan

### Caso 1: Empleado Llena Turno

```
Login:
  Usuario: empleado1
  Contraseña: empleado123

Backend:
  ✅ Busca en USUARIOS
  ✅ Verifica activo
  ✅ Verifica contraseña
  ✅ Obtiene rol = "empleado"
  ✅ Obtiene negocioId = 1

Frontend - Pantalla Turno:
  ✅ Usuario autenticado como empleado
  ✅ Ve pantalla TurnoScreen
  ✅ SOLO empleado1 puede crear turno si NO hay turno creado ese día
  ✅ Una vez creado, empleado2 NO puede crear otro turno
  ✅ empleado2 verá: "Turno ya creado por empleado1"
  ✅ La BD registra usuario_id = 2 (quien lo creó)

Flujo:
  - Empleado1 inicia sesión → Crea Turno T1
  - Empleado2 inicia sesión → Ve Turno T1 (no puede crear otro)
  - Supervisor revisa → Ve que T1 fue creado por Empleado1
```

### Caso 2: Supervisor Revisa Día

```
Login:
  Usuario: supervisor
  Contraseña: supervisor123

Backend:
  ✅ Obtiene rol = "supervisor"
  ✅ Obtiene negocioId = 1

Frontend - Pantalla Revisión:
  ✅ Usuario autenticado como supervisor
  ✅ Ve pantalla RevisionScreen
  ✅ Puede revisar TODOS los turnos del día
  ✅ Del negocio_id = 1
  ✅ Cierra el día (estado = REVISADO)
```

### Caso 3: Admin Maneja Múltiples Negocios

```
Login:
  Usuario: admin
  Contraseña: admin123

Backend:
  ✅ Busca USUARIOS → id=1
  ✅ Busca MIEMBROS → DOS resultados:
     - negocio_id: 1, rol: administrador
     - negocio_id: 2, rol: administrador

PANTALLA INICIAL (SELECCIÓN DE NEGOCIO):
  ┌────────────────────────────┐
  │ Selecciona un Negocio:     │
  ├────────────────────────────┤
  │ □ Farmacia Test            │
  │ □ Farmacia Central         │
  └────────────────────────────┘

  Admin hace clic en "Farmacia Test" (negocio_id=1)

Frontend:
  ✅ User.negocioId = 1
  ✅ Admin ve panel de Gestión
  ✅ Puede crear/eliminar turnos SOLO SI no hay datos de ese día
  ✅ Si empleado1 ya creó turno → Admin NO puede eliminarlo
  ✅ Puede ver auditoría completa
  ✅ Gestiona catálogos
```

### Caso 4: Admin Crea/Borra Turno (Recuperación)

```
Situación:
  - Sin empleados registrados ese día
  - Sin turnos creados
  - Admin necesita inicializar

Admin ve:
  ✅ Botón "Crear Turno Manual" (solo si BD vacía para ese día)
  ✅ Puede crear para testear
  ✅ Puede borrar si no hay transacciones

Protección:
  ❌ NO puede borrar si hay transacciones
  ❌ NO puede borrar si empleado ya creó turno
```

## 🛡️ Reglas de Negocio

### 1. Validación de Usuario

```typescript
if (!userRecord) {
  return { error: 'Credenciales incorrectas' }
}
```

✅ Usuario debe existir en BD

### 2. Estado Activo

```typescript
if (!userRecord.activo) {
  return { error: 'Cuenta desactivada' }
}
```

✅ Usuario debe estar activo (activo = TRUE)

Ejemplo: `inactivo` tiene usuario_id=5 pero `activo=FALSE` → no puede entrar

### 3. Contraseña válida

```typescript
const isValid = await bcrypt.compare(password, hash)
if (!isValid) {
  return { error: 'Credenciales incorrectas' }
}
```

✅ Contraseña debe coincidir con hash almacenado

### 4. Pertenencia a Negocio

```typescript
const memberRecord = await findMemberByUserId(userId)
if (!memberRecord) {
  return { error: 'No asignado a negocio' }
}
```

✅ Usuario debe estar asignado a al menos UN negocio en tabla MIEMBROS

### 5. Rol Único por Negocio

```sql
CREATE UNIQUE(usuario_id, negocio_id)
```

✅ Un usuario no puede tener dos roles en el mismo negocio

## 📱 Interfaz de Usuario

### Login Screen

```
┌────────────────────────────┐
│ GestorPyME - Iniciar Sesión│
├────────────────────────────┤
│                            │
│ Usuario: [empleado1______] │
│                            │
│ Contraseña: [••••••••••••] │
│                            │
│ [INGRESAR]                 │
│                            │
│ ❌ Credenciales incorrectas│
│ (si falla)                 │
└────────────────────────────┘
```

### Dashboard (Después de Login)

```
┌──────────────────────────────────┐
│ 📋 Bienvenido, Empleado Uno      │
│ Rol: EMPLEADO                    │
│ Negocio: Farmacia Test           │
├──────────────────────────────────┤
│ ☰ │ [Dashboard Content]          │
│   │                              │
│ M │ Turno Activo: T1 (ABIERTO)  │
│ I │ Transacciones: 0             │
│ S │                              │
│   │ [INICIAR TURNO]              │
│   │                              │
│   │                              │
│   │ [CERRAR SESIÓN]              │
└──────────────────────────────────┘
```

## 🐛 Errores Comunes y Soluciones

### Error: "Credenciales incorrectas"

**Causas posibles:**
1. Usuario no existe en BD
2. Contraseña ingresada no coincide con hash
3. El hash en BD es incorrecto

**Solución:**
- Verificar con: `node scripts/generate-password-hashes.mjs`
- Reinicializar BD: `node scripts/clean-db.mjs`

### Error: "Cuenta desactivada"

**Causa:**
- Usuario existe pero `activo = FALSE`

**Solución:**
- El usuario `inactivo` (ID=5) tiene esto para pruebas
- Para activar: `UPDATE usuarios SET activo=TRUE WHERE id=5`

### Error: "Usuario válido pero no asignado a negocio"

**Causa:**
- Usuario existe pero no tiene registro en tabla MIEMBROS

**Solución:**
- Crear registro en MIEMBROS:
```sql
INSERT INTO miembros (usuario_id, negocio_id, rol)
VALUES (2, 1, 'empleado')
```

## 🔑 Contraseñas de Prueba

```
Usuario: admin          | Contraseña: admin123
Usuario: empleado1      | Contraseña: empleado123
Usuario: empleado2      | Contraseña: empleado123
Usuario: supervisor     | Contraseña: supervisor123
Usuario: inactivo       | Contraseña: admin123 (pero no puede entrar)
```

## 📈 Próximos Pasos

1. ✅ Login funciona correctamente
2. ⏳ Agregar cambio de negocio para admin (seleccionar Farmacia)
3. ⏳ Agregar "Recordar negocio seleccionado" en localStorage
4. ⏳ Agregar cierre de sesión (logout)
5. ⏳ Agregar recuperación de contraseña

