# 🧪 Guía de Pruebas - GestorPyME Desktop

Este documento explica cómo usar los scripts de prueba para testear el backend sin necesidad de la interfaz Electron.

## 📋 Scripts Disponibles

### 1. `test-auth.mjs` - Pruebas de Autenticación
Prueba la lógica de login sin Electron.

**Qué prueba:**
- ✅ Login con credenciales válidas
- ❌ Login con contraseña incorrecta
- ❌ Login con usuario inexistente
- ✅ Validación de usuario activo
- ✅ Búsqueda de rol y negocio del usuario

**Ejecutar:**
```bash
node test-auth.mjs
```

### 2. `test-turno.mjs` - Pruebas de Inicialización de Turnos
Prueba la lógica de creación/recuperación de turnos sin Electron.

**Qué prueba:**
- ✅ Crear Día Contable automáticamente
- ✅ Crear Turno 1 para un usuario
- ✅ Recuperar el mismo turno si el usuario intenta abrir sesión nuevamente
- ✅ Crear Turno 2 con otro usuario en el mismo día
- ❌ Intentar crear Turno 3 (debe fallar)
- ❌ Otro usuario intenta usar un turno abierto por otro (debe fallar)

**Ejecutar:**
```bash
node test-turno.mjs
```

### 3. `run-tests.mjs` - Script Maestro
Ejecuta las pruebas en orden y con mejor formato.

**Ejecutar una prueba específica:**
```bash
node run-tests.mjs auth
node run-tests.mjs turno
```

**Ejecutar todas las pruebas:**
```bash
node run-tests.mjs all
```

**Ver ayuda:**
```bash
node run-tests.mjs help
```

---

## 🔧 Prerequisitos

Antes de ejecutar las pruebas, asegúrate de:

1. **PostgreSQL está corriendo** (local o remoto)
   ```bash
   # En Windows con Docker Desktop:
   docker ps | find "postgres"  # Debe ver el contenedor activo
   ```

2. **Variables de entorno configuradas en `.env`**
   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=gestorpyme
   ```

3. **Base de datos creada y con datos de prueba**
   - Al menos 1 usuario (admin/empleado)
   - Al menos 1 negocio
   - Al menos 1 miembro (usuario asignado a un negocio)

4. **Dependencias instaladas**
   ```bash
   npm install
   ```

---

## 📊 Flujo de Pruebas Esperado

### Test de Autenticación
```
Test 1: Login admin/admin123
  → Busca usuario "admin" en la BD
  → Verifica contraseña con bcrypt
  → Obtiene rol y negocio del usuario
  → Retorna {success: true, user: {...}}

Test 2: Login admin/wrongpassword
  → Contraseña no coincide
  → Retorna {success: false, error: "Credenciales incorrectas"}

Test 3: Login usuario_fantasma/password
  → Usuario no existe
  → Retorna {success: false, error: "Credenciales incorrectas"}

Test 4: Login empleado1/empleado123
  → Si existe el usuario, mismo flujo que Test 1
```

### Test de Turnos
```
Test 1: Usuario 1 abre turno, Negocio 1
  → Crea Día Contable para hoy
  → Crea Turno 1, Usuario 1
  → Retorna {success: true, turno: {...}}

Test 2: Usuario 1 abre turno nuevamente
  → Encuentra Día Contable existente
  → Encuentra Turno 1 abierto de Usuario 1
  → Devuelve el mismo turno (no crea uno nuevo)
  → Retorna {success: true, turno: {id: X, numero_turno: 1, ...}}

Test 3: Usuario 2 abre turno, mismo Negocio 1
  → Encuentra Día Contable existente
  → Turno 1 ya existe (pero abierto por Usuario 1)
  → Crea Turno 2 para Usuario 2
  → Retorna {success: true, turno: {id: Y, numero_turno: 2, ...}}

Test 4: Usuario 3 intenta abrir turno
  → Ya existen Turnos 1 y 2 (ambos cerrados o uno abierto)
  → No puede crear Turno 3
  → Retorna {success: false, error: "Ya se han cerrado los dos turnos..."}

Test 5: Usuario 2 intenta usar Turno 1 de Usuario 1
  → Turno 1 está abierto por Usuario 1
  → Usuario 2 no es el propietario
  → Retorna {success: false, error: "El Turno 1 está abierto por otro empleado"}
```

---

## 🚀 Pasos Recomendados

### Primera Vez

1. **Inicializa la base de datos con datos de prueba**
   - Ejecuta los scripts SQL en `docs/` si existen
   - O crea manualmente:
     ```sql
     INSERT INTO negocios (nombre_negocio) VALUES ('Farmacia Test');
     INSERT INTO usuarios (nombre_completo, username, password_hash, activo)
       VALUES ('Admin User', 'admin', '$2a$12$...', true);
     INSERT INTO miembros (usuario_id, negocio_id, rol)
       VALUES (1, 1, 'administrador');
     ```

2. **Ejecuta las pruebas de autenticación**
   ```bash
   node run-tests.mjs auth
   ```

3. **Si auth pasa, prueba turnos**
   ```bash
   node run-tests.mjs turno
   ```

4. **Ejecuta todas juntas**
   ```bash
   node run-tests.mjs all
   ```

### Durante Desarrollo

Si implementas cambios en:
- `electron/handlers/`
- `electron/services/`
- `electron/repositories/`

Simplemente re-ejecuta las pruebas:
```bash
node run-tests.mjs all
```

---

## 📝 Lógica de los Scripts

### Estructura de `test-turno.mjs`

```javascript
// 1. Setup de base de datos
const getPool() → Pool de PostgreSQL
const query() → Ejecuta queries

// 2. Handler de Turno (copiado del código real)
handleInitializeTurno(args)
  ├─ Obtiene fecha de hoy
  ├─ Busca/crea Día Contable
  ├─ Busca turnos existentes
  ├─ Valida reglas de negocio
  └─ Crea o devuelve turno

// 3. Casos de Prueba
runTests()
  ├─ Test 1: Crear Turno 1 (usuario 1)
  ├─ Test 2: Recuperar Turno 1 (usuario 1 nuevamente)
  ├─ Test 3: Crear Turno 2 (usuario 2)
  ├─ Test 4: Fallar Turno 3 (usuario 3)
  └─ Test 5: Fallar acceso cruzado (usuario 2 → Turno 1)
```

---

## 🐛 Troubleshooting

### Error: "Faltan variables de entorno"
**Causa:** `.env` no existe o está incompleto
**Solución:**
```bash
# Copia el template
cp .env.example .env

# Edita con tus credenciales de BD
```

### Error: "Connection refused"
**Causa:** PostgreSQL no está ejecutándose
**Solución:**
```bash
# En Docker:
docker run --name postgres -e POSTGRES_PASSWORD=secret -d postgres

# O inicia el servicio local de PostgreSQL
```

### Error: "No rows returned"
**Causa:** No existe el usuario "admin" en la base de datos
**Solución:**
1. Crea un usuario en la BD:
   ```sql
   INSERT INTO usuarios (nombre_completo, username, password_hash, activo)
   VALUES ('Admin', 'admin', <hash_bcrypt>, true);
   ```
2. Obtén el hash con:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('admin123', 12);
   console.log(hash);
   ```

### Error: "Table does not exist"
**Causa:** El schema de la BD no está creado
**Solución:**
1. Ejecuta el script de creación del schema (debe estar en `docs/`)
2. O crea las tablas manualmente (ver prompt-proyecto)

---

## 💡 Próximos Pasos

Una vez que las pruebas pasen:

1. **Implementa el formulario de turno en el frontend**
   - Crea un componente `TurnoForm.tsx`
   - Llama a `window.electronAPI.initializeTurno()`

2. **Implementa otros handlers**
   - `turno:close` - Cerrar turno
   - `transaccion:create` - Registrar transacción
   - `transaccion:delete` - Eliminar transacción

3. **Crea más tests** para nuevas funcionalidades

---

## 📞 Preguntas?

Si los scripts no funcionan o necesitas modificarlos:
1. Revisa el archivo `.env`
2. Verifica que PostgreSQL está corriendo
3. Comprueba que la base de datos tiene datos de prueba
4. Lee los logs detallados que imprimen los scripts
