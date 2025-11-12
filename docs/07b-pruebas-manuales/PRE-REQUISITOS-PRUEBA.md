# 📋 PRE-REQUISITOS PARA PRUEBA MANUAL

Antes de ejecutar la prueba manual del flujo del empleado, verifica estos pasos.

---

## ✅ CHECKLIST PRE-PRUEBA

### 1. BASE DE DATOS

**Verificar que PostgreSQL esté corriendo:**

```bash
# En Windows
net start postgresql-x64-15    # O la versión que tengas

# En Mac
brew services start postgresql

# En Linux
sudo systemctl start postgresql
```

**Verificar que BD existe:**

```bash
psql -U postgres -l | grep gestorpyme
```

**Esperado:** Una línea con "gestorpyme" en la salida

**Si no existe, crea la BD:**

```bash
# Ejecuta el script de inicialización
psql -U postgres < scripts/init-database.sql
```

**Verifica que haya datos de prueba:**

```bash
psql -U postgres -d gestorpyme -c "SELECT * FROM usuarios LIMIT 3;"
```

**Esperado:**
```
 id |   username   | passwordHash | nombreCompleto |      rol      | activo
----+--------------+--------------+----------------+---------------+--------
  1 | admin        | [hash]       | Admin User     | administrador | t
  2 | empleado1    | [hash]       | Empleado 1     | empleado      | t
  3 | supervisor   | [hash]       | Supervisor 1   | supervisor    | t
```

---

### 2. VARIABLES DE AMBIENTE

Verifica que exista archivo `.env` en la raíz del proyecto:

```bash
# En Windows (PowerShell)
Test-Path .env

# En Mac/Linux
[ -f .env ] && echo "Existe" || echo "No existe"
```

**Si no existe, crea uno:**

```bash
cp .env.example .env
```

**Contenido esperado de `.env`:**

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/gestorpyme
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=gestorpyme

# Electron
ELECTRON_MAIN_PROCESS_PORT=3000
VITE_DEV_SERVER_URL=http://localhost:5173
```

**Ajusta las credenciales según tu PostgreSQL local.**

---

### 3. DEPENDENCIAS NODE

Verifica que `node_modules` esté instalado:

```bash
# Si tienes más de 1000 carpetas en node_modules
ls -la node_modules | wc -l
# Esperado: > 1000
```

**Si no está instalado o hay problemas:**

```bash
# Limpiar e instalar nuevamente
rm -rf node_modules package-lock.json
npm install
```

---

### 4. PUERTOS DISPONIBLES

Verifica que los puertos necesarios estén disponibles:

```bash
# Puerto 5173 (Vite dev server)
netstat -ano | findstr :5173    # Windows
lsof -i :5173                    # Mac/Linux

# Puerto 3000 (Electron main process - a veces)
netstat -ano | findstr :3000
lsof -i :3000

# Puerto 5432 (PostgreSQL)
netstat -ano | findstr :5432
lsof -i :5432
```

**Si alguno está en uso:**

```bash
# Mata el proceso (Windows)
taskkill /PID [PID] /F

# O cambia los puertos en .env
```

---

### 5. PERMISOS DE CARPETA

Verifica que tienes permisos para escribir en la carpeta de proyecto:

```bash
# Intenta crear un archivo temporal
touch test.txt && rm test.txt

# Si falla, hay problema de permisos
```

---

### 6. VERIFICAR HANDLERS REGISTRADOS

Abre `electron/main.ts` y verifica estas líneas existen:

```typescript
// Debe haber estos imports
import { registerAuthHandlers } from './handlers/authHandlers';
import { registerTurnoHandlers } from './handlers/turnoHandlers';
import { registerTransaccionHandlers } from './handlers/transaccionHandlers';
import { registerDiaContableHandlers } from './handlers/diaContableHandlers';
import { registerNegocioHandlers } from './handlers/negocioHandlers';

// Debe haber estas llamadas en app.whenReady()
app.whenReady().then(() => {
  registerAuthHandlers();
  registerTurnoHandlers();
  registerTransaccionHandlers();
  registerDiaContableHandlers();
  registerNegocioHandlers();
  // ...
});
```

**Si falta alguno, agrégalo ahora antes de iniciar.**

---

### 7. VERIFICAR IMPORTS EN HANDLERS

Verifica que `turnoHandlers.ts` importe `validationHelpers`:

```bash
# Windows
findstr "validationHelpers" electron/handlers/turnoHandlers.ts

# Mac/Linux
grep "validationHelpers" electron/handlers/turnoHandlers.ts
```

**Esperado:**
```typescript
import {
  validateUserAccessToNegocio,
  validatePositiveNumber,
  handleValidationError
} from './validationHelpers';
```

---

### 8. VERIFICAR TYPESCRIPT

Compila TypeScript para detectar errores antes de ejecutar:

```bash
npm run type-check
# O
npx tsc --noEmit
```

**Si hay errores de compilación, corrígelos antes de continuar.**

---

### 9. VERIFICAR PACKAGE.JSON SCRIPTS

Abre `package.json` y verifica que exista:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:electron\" \"npm run dev:vite\"",
    "dev:vite": "vite",
    "dev:electron": "wait-on tcp:5173 && electron .",
    "build": "vite build && electron-builder",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 10. LIMPIAR CACHÉ (OPCIONAL)

Si has tenido problemas antes, limpia caché:

```bash
# Eliminar dist
rm -rf dist

# Eliminar .electron-cache (a veces)
rm -rf .electron-cache

# En Windows
rmdir /s dist
```

---

## 🚀 INICIAR LA PRUEBA

Una vez completes todos los pasos anteriores:

```bash
# Abre terminal en la raíz del proyecto
cd C:/Users/S\ Herrera/Downloads/Proyectos/gestorpymedesktop

# Inicia la aplicación
npm run dev
```

**Esperado:**
```
  VITE v[version] ready in [X] ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

  [Electron] Starting...
  [Electron] App is ready
  [Handler] Auth Handlers registrados.
  [Handler] Turno Handlers registrados.
  [Handler] Transaccion Handlers registrados.
  [Handler] Dia Contable Handlers registrados.
  [Handler] Negocio Handlers registrados.
```

Y se abre una ventana Electron con LoginForm.

---

## 🔍 VERIFICAR DEVTOOLS

Si necesitas debug durante la prueba:

```bash
# Presiona en la ventana de Electron:
Ctrl+Shift+I    # Windows
Cmd+Option+I    # Mac
```

Se abre DevTools con:
- **Console**: Mensajes de log
- **Network**: Llamadas IPC
- **Application**: LocalStorage, etc
- **Debugger**: Breakpoints en código

---

## 🆘 SI ALGO FALLA

### Error: "Cannot find module 'validationHelpers'"

```bash
# Actualiza los imports en los handlers
# O verifica que el archivo existe:
ls -la electron/handlers/validationHelpers.ts
```

### Error: "ENOENT: no such file or directory"

```bash
# Verifica rutas:
ls -la scripts/init-database.sql
ls -la src/
ls -la electron/
```

### Error: "Port 5173 is already in use"

```bash
# Mata el proceso:
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
# Luego intenta npm run dev nuevamente
```

### Error: "Connection refused" en PostgreSQL

```bash
# Verifica que PostgreSQL esté corriendo:
pg_isready -h localhost -p 5432

# Esperado: accepting connections
```

### Error: "Authentication failed"

```bash
# Verifica credenciales en .env
# Por defecto:
# DB_USER=postgres
# DB_PASSWORD=password
#
# Si es diferente en tu instalación, actualiza .env
```

---

## ✨ ESTÁS LISTO!

Si pasaste todos los pasos anteriores sin errores, ya puedes ejecutar:

```bash
npm run dev
```

Y seguir la guía: **GUIA-PRUEBA-EMPLEADO.md**

---

**Fecha creación:** Noviembre 2025

