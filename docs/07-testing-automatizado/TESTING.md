# 🧪 Guía Completa de Testing - GestorPyME

## 📚 Documentación Disponible

| Documento | Propósito |
|-----------|----------|
| **QUICK-START.md** | ⭐ **COMIENZA AQUÍ** - 3 pasos para empezar |
| **SCRIPTS.md** | Referencia de todos los scripts |
| **DB-SETUP.md** | Troubleshooting de base de datos |
| **TEST-GUIDE.md** | Detalles técnicos de las pruebas |
| **TESTING.md** | Este archivo |

---

## ⚡ Inicio Rápido (30 segundos)

### Paso 1: Ejecuta el asistente

```bash
node setup-wizard.mjs
```

Este script:
- ✅ Verifica PostgreSQL
- ✅ Crea la BD
- ✅ Inicializa el schema
- ✅ Inserta datos de prueba

### Paso 2: Prueba el backend

```bash
node run-tests.mjs all
```

Prueba:
- ✅ Login (autenticación)
- ✅ Turnos (inicialización)

### Paso 3: Abre la aplicación

```bash
npm run dev
```

Usa credenciales:
- Usuario: `admin`
- Contraseña: `admin123`

---

## 🗂️ Estructura de Carpetas de Testing

```
gestorpymedesktop/
├── init-database.sql          # Schema SQL completo
├── run-init-db.mjs            # Inicializador Node.js
├── setup-wizard.mjs           # Asistente interactivo ⭐
├── test-auth.mjs              # Pruebas de login
├── test-turno.mjs             # Pruebas de turnos
├── run-tests.mjs              # Ejecutador maestro
├── QUICK-START.md             # Inicio rápido
├── SCRIPTS.md                 # Referencia de scripts
├── DB-SETUP.md                # Problemas de BD
├── TEST-GUIDE.md              # Detalles de pruebas
└── TESTING.md                 # Este archivo
```

---

## 🧪 Tipos de Pruebas

### 1. Pruebas de Autenticación

**Archivo:** `test-auth.mjs`

**Prueba:**
```javascript
// Login válido
authenticateUser('admin', 'admin123')
→ {success: true, user: {...}}

// Login fallido
authenticateUser('admin', 'contraseña_incorrecta')
→ {success: false, error: "Credenciales incorrectas"}

// Usuario inexistente
authenticateUser('fantasma', 'password')
→ {success: false, error: "Credenciales incorrectas"}
```

**Ejecutar:**
```bash
node test-auth.mjs
# O:
node run-tests.mjs auth
```

### 2. Pruebas de Turnos

**Archivo:** `test-turno.mjs`

**Prueba:**
```javascript
// Crear Turno 1
handleInitializeTurno({usuarioId: 1, negocioId: 1})
→ {success: true, turno: {numero_turno: 1, ...}}

// Recuperar el mismo turno
handleInitializeTurno({usuarioId: 1, negocioId: 1})
→ {success: true, turno: {numero_turno: 1, ...}} // No crea nuevo

// Crear Turno 2 con otro usuario
handleInitializeTurno({usuarioId: 2, negocioId: 1})
→ {success: true, turno: {numero_turno: 2, ...}}

// Intentar Turno 3
handleInitializeTurno({usuarioId: 3, negocioId: 1})
→ {success: false, error: "Ya se han cerrado los dos turnos..."} // Error
```

**Ejecutar:**
```bash
node test-turno.mjs
# O:
node run-tests.mjs turno
```

### 3. Todas las Pruebas

```bash
node run-tests.mjs all
```

Ejecuta:
- ✅ `test-auth.mjs`
- ✅ `test-turno.mjs`

---

## 📊 Datos de Prueba

Después de inicializar, tienes:

### Usuarios

| Username | Password | Rol | Negocio | Activo |
|----------|----------|-----|---------|--------|
| admin | admin123 | administrador | Ambos | ✅ |
| empleado1 | empleado123 | empleado/supervisor | Ambos | ✅ |
| empleado2 | empleado123 | empleado | Farmacia Test | ✅ |
| supervisor | supervisor123 | supervisor | Farmacia Test | ✅ |
| inactivo | admin123 | empleado | Farmacia Test | ❌ |

### Negocios

1. Farmacia Test
2. Farmacia Central

### Datos Adicionales

- 3 Proveedores
- 6 Tipos de Gasto
- 5 Tipos de Pago Digital

---

## 🔍 Cómo Funcionan los Scripts

### setup-wizard.mjs

```mermaid
Inicio
  ↓
Verificar PostgreSQL
  ├─ Conecta a DB
  ├─ Si error → Reintentar
  └─ Si OK → Siguiente
  ↓
Crear/Verificar BD
  ├─ Si existe → Preguntar si sobreescribir
  ├─ Si no existe → Crear
  └─ Siguiente
  ↓
Configurar .env
  ├─ Si existe → Preguntar si cambiar
  ├─ Si no existe → Crear
  └─ Siguiente
  ↓
Inicializar Schema
  ├─ Leer init-database.sql
  ├─ Ejecutar SQL
  └─ Siguiente
  ↓
Resumen y Fin
```

### run-tests.mjs

```
Inicio
  ↓
¿Qué test ejecutar?
  ├─ "auth" → test-auth.mjs
  ├─ "turno" → test-turno.mjs
  ├─ "all" → ambos
  └─ "help" → mostrar ayuda
  ↓
[test-auth.mjs]
  ├─ Test 1: Login válido ✅
  ├─ Test 2: Contraseña incorrecta ✅
  ├─ Test 3: Usuario inexistente ✅
  └─ Test 4: Usuario inactivo ✅
  ↓
[test-turno.mjs]
  ├─ Test 1: Crear Turno 1 ✅
  ├─ Test 2: Recuperar Turno 1 ✅
  ├─ Test 3: Crear Turno 2 ✅
  ├─ Test 4: Fallar en Turno 3 ✅
  └─ Test 5: Validar acceso cruzado ✅
  ↓
Resultado Final
  ├─ Si todos OK → "✅ TODAS LAS PRUEBAS PASARON"
  └─ Si alguno falla → "❌ PRUEBA FALLÓ"
```

---

## 🚦 Estados de las Pruebas

### Pruebas EXITOSAS ✅

```
Login con admin/admin123
→ Usuario encontrado
→ Usuario activo
→ Contraseña válida
→ Rol obtenido
→ {success: true, user: {...}}
```

### Pruebas FALLIDAS ❌ (Esperadas)

```
Login con contraseña incorrecta
→ Contraseña no coincide
→ {success: false, error: "Credenciales incorrectas"}
```

```
Crear Turno 3
→ Ya existen Turnos 1 y 2
→ {success: false, error: "Ya se han cerrado los dos turnos..."}
```

---

## 🔧 Flujo de Desarrollo

### Cuando Comiences

```bash
1. node setup-wizard.mjs          # Inicializar BD
2. node run-tests.mjs all          # Verificar que todo funciona
3. npm run dev                      # Abrir la app
```

### Mientras Desarrollas

```bash
1. Realiza cambios en:
   - electron/handlers/
   - electron/services/
   - electron/repositories/

2. Después de cambios:
   node run-tests.mjs all          # Verificar que nada se rompió

3. Si pruebas fallan:
   - Lee los logs del test
   - Revisa el error
   - Corrige el código
   - Vuelve a probar
```

### Si Necesitas Limpiar

```bash
node setup-wizard.mjs              # Elimina y recrea todo
```

---

## 📋 Checklist para Desarrollo

- [ ] Ejecuté `setup-wizard.mjs` ✅
- [ ] Todas las pruebas pasan (`run-tests.mjs all`) ✅
- [ ] Probé login en la aplicación ✅
- [ ] Implementé nueva funcionalidad
- [ ] Escribí pruebas para la nueva funcionalidad
- [ ] Todas las pruebas siguen pasando ✅
- [ ] Documenté los cambios
- [ ] Commiteo los cambios a git

---

## 🐛 Troubleshooting Rápido

### "PostgreSQL not running"
```bash
docker start postgres-gestorpyme
# O:
net start postgresql-x64-16
```

### "Database does not exist"
```bash
node setup-wizard.mjs
```

### "Permission denied on .env"
```bash
echo "DB_HOST=localhost" > .env
# ... agregar otras variables
```

### "Module not found: pg"
```bash
npm install
```

### Tests no se conectan a BD
```bash
# Verifica .env existe y está correcto:
cat .env

# Verifica PostgreSQL está corriendo:
docker ps | find "postgres"

# Verifica BD existe:
psql -U postgres -l | find "gestorpyme"
```

---

## 📊 Resumen de Archivos

### Scripts Principales

| Archivo | Usa | Función |
|---------|-----|---------|
| `setup-wizard.mjs` | `node setup-wizard.mjs` | Setup interactivo |
| `run-init-db.mjs` | `node run-init-db.mjs` | Inicializar BD |
| `run-tests.mjs` | `node run-tests.mjs [test]` | Ejecutar pruebas |
| `test-auth.mjs` | `node test-auth.mjs` | Pruebas de login |
| `test-turno.mjs` | `node test-turno.mjs` | Pruebas de turnos |

### Configuración

| Archivo | Propósito |
|---------|----------|
| `.env` | Variables de entorno (se crea automáticamente) |
| `init-database.sql` | Schema SQL (ejecutado automáticamente) |

### Documentación

| Archivo | Lee Cuando |
|---------|-----------|
| `QUICK-START.md` | Necesitas empezar rápido |
| `SCRIPTS.md` | Quieres saber qué script usar |
| `DB-SETUP.md` | Tengo problemas con PostgreSQL |
| `TEST-GUIDE.md` | Quiero entender cómo funcionan las pruebas |
| `TESTING.md` | Tengo dudas sobre testing (este archivo) |

---

## 🎯 Objetivos de las Pruebas

✅ **Verificar que el backend funciona correctamente**
- Login funciona
- Validaciones de contraseña funcionan
- Búsqueda de usuarios funciona
- Asignación de roles funciona

✅ **Verificar que la lógica de turnos es correcta**
- Se crea Día Contable
- Se crea Turno 1 y 2
- No se permite Turno 3
- Solo el propietario puede usar su turno

✅ **Encontrar errores antes de implementar frontend**
- Bugs en handlers
- Bugs en servicios
- Bugs en queries a DB

---

## 💡 Próximos Pasos

Una vez que las pruebas pasen:

1. **Implementa formulario de turno**
   - Componente: `src/components/TurnoForm.tsx`
   - Llama a: `window.electronAPI.initializeTurno()`

2. **Implementa otros handlers**
   - `turno:close` - Cerrar turno
   - `transaccion:create` - Crear transacción
   - `transaccion:update` - Editar transacción

3. **Expande las pruebas**
   - Pruebas para nuevos handlers
   - Pruebas de edge cases
   - Pruebas de rendimiento

4. **Diseña el dashboard**
   - Navegación lateral
   - Listado de turnos
   - Registros de transacciones

---

## 🏁 Conclusión

Ahora tienes:
- ✅ Scripts de setup automatizados
- ✅ Suite de pruebas funcional
- ✅ Datos de prueba listos
- ✅ Documentación completa

**Próximo paso:** Ejecuta `node setup-wizard.mjs` 🚀

---

**¿Preguntas?** Consulta los otros documentos en esta carpeta.
