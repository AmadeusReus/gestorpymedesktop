# ⚡ COMANDOS ÚTILES PARA PRUEBA

Guía rápida de comandos para ejecutar durante la prueba.

---

## 🚀 INICIAR / DETENER

```bash
# Inicia la aplicación completa (recomendado)
npm run dev

# Inicia solo Vite (frontend dev server)
npm run dev:vite

# Inicia solo Electron (en otra terminal)
npm run dev:electron

# Detiene todos los procesos
Ctrl+C  (en la terminal)
```

---

## 🗄️ BASE DE DATOS

```bash
# Conectar a la BD
psql -U postgres -d gestorpyme

# Crear BD desde script
psql -U postgres < scripts/init-database.sql

# Ver usuarios de prueba
psql -U postgres -d gestorpyme -c "SELECT id, username, rol FROM usuarios;"

# Ver turnos existentes
psql -U postgres -d gestorpyme -c "SELECT * FROM turnos;"

# Ver transacciones
psql -U postgres -d gestorpyme -c "SELECT * FROM transacciones LIMIT 5;"

# Limpiar BD (resetear)
psql -U postgres -c "DROP DATABASE gestorpyme;" && \
psql -U postgres < scripts/init-database.sql

# Ver negocios
psql -U postgres -d gestorpyme -c "SELECT * FROM negocios;"

# Ver miembros (usuario-negocio)
psql -U postgres -d gestorpyme -c "SELECT * FROM miembros;"
```

---

## 🔍 VERIFICACIONES RÁPIDAS

```bash
# Verificar PostgreSQL está corriendo
pg_isready -h localhost -p 5432
# Esperado: accepting connections

# Verificar puerto 5173 disponible
netstat -ano | findstr :5173
# (Windows)

lsof -i :5173
# (Mac/Linux)

# Verificar puertos 5432 (PostgreSQL)
netstat -ano | findstr :5432
lsof -i :5432

# Ver rutas del proyecto
ls -la
# Deberías ver: src/ electron/ scripts/ package.json .env

# Verificar node_modules
ls -la node_modules | wc -l
# Esperado: > 1000 directorios
```

---

## 🔧 COMPILACIÓN Y BUILD

```bash
# Compilar TypeScript sin emitir
npm run type-check

# Build para producción
npm run build

# Build solo el frontend (Vite)
npm run build:vite

# Build solo el Electron
npm run build:electron

# Limpiar caché y dist
rm -rf dist .electron-cache node_modules

# Reinstalar dependencias
npm install
```

---

## 🔐 CREDENCIALES DE PRUEBA

Mantén estos a la mano:

```
EMPLEADO
├─ Username: empleado1
├─ Password: empleado123
└─ Negocio: Farmacia Test (ID: 1)

EMPLEADO 2
├─ Username: empleado2
├─ Password: empleado123
└─ Negocio: Farmacia Test (ID: 1)

SUPERVISOR
├─ Username: supervisor
├─ Password: supervisor123
└─ Negocio: Farmacia Test (ID: 1)

ADMIN (múltiples negocios)
├─ Username: admin
├─ Password: admin123
└─ Negocios: Farmacia Test (1), Farmacia Central (2)

USUARIO INACTIVO (para probar validación)
├─ Username: inactivo
├─ Password: admin123
└─ Estado: INACTIVO (debe fallar login)
```

---

## 📊 DEBUGGING

```bash
# Abre Chrome DevTools en Electron
En la ventana Electron:
Ctrl+Shift+I  (Windows/Linux)
Cmd+Option+I  (Mac)

# Ver logs de Electron main process
npm run dev:electron 2>&1 | tee electron.log

# Ver logs de Vite frontend
npm run dev:vite 2>&1 | tee frontend.log

# Ver logs combinados
npm run dev > combined.log 2>&1 &
```

---

## 🧪 TESTING

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar tests en watch mode
npm test -- --watch

# Ejecutar tests E2E (si Cypress está instalado)
npm run cypress:open

# Ejecutar Cypress headless
npm run cypress:run
```

---

## 🐛 TROUBLESHOOTING RÁPIDO

```bash
# Si Electron no abre, intenta:
rm -rf node_modules
npm install
npm run dev

# Si hay error de puerto en uso:
# Windows - mata el proceso en puerto 5173
netstat -ano | findstr :5173
# Nota el PID y ejecuta:
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Si hay error de BD:
psql -U postgres -c "DROP DATABASE gestorpyme;"
psql -U postgres < scripts/init-database.sql

# Si hay error de TypeScript:
npm run type-check
# Te mostrará los errores
```

---

## 📝 LOGS Y OUTPUT

```bash
# Guardar salida de npm run dev
npm run dev > output.log 2>&1

# Leer último errores
tail -f output.log

# Ver logs de Chrome (si usas DevTools)
En DevTools → Console → Copia todo → Pega en archivo.txt

# Exportar logs de Electron
npm run dev:electron > electron-logs.txt 2>&1
```

---

## 🔐 SEGURIDAD Y VALIDACIÓN

```bash
# Verificar que validationHelpers existe
ls -la electron/handlers/validationHelpers.ts

# Verificar que turnoHandlers importa validationHelpers
grep "validationHelpers" electron/handlers/turnoHandlers.ts

# Verificar que transaccionHandlers importa validationHelpers
grep "validationHelpers" electron/handlers/transaccionHandlers.ts

# Verificar handlers están registrados
grep "registerTurnoHandlers\|registerTransaccionHandlers" electron/main.ts
```

---

## 🌐 PUERTOS Y NETWORK

```bash
# Ver todos los puertos en uso
netstat -ano    # Windows
lsof -i         # Mac/Linux

# Liberar puerto específico
# Windows
netstat -ano | findstr :PUERTO
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :PUERTO | grep LISTEN | awk '{print $2}' | xargs kill -9

# Cambiar puerto Vite (si está en uso)
# En package.json:
# "dev:vite": "vite --port 3000"

# Cambiar puerto PostgreSQL (si está en uso)
# En .env:
# DB_PORT=5433
```

---

## 📦 NPM Y DEPENDENCIAS

```bash
# Ver versión de Node
node --version

# Ver versión de npm
npm --version

# Ver instaladas
npm list --depth=0

# Ver outdated
npm outdated

# Actualizar todo
npm update

# Instalar específico
npm install electron
npm install --save-dev typescript

# Desinstalar
npm uninstall electron
npm uninstall --save-dev typescript
```

---

## 🎯 FLUJO TÍPICO DE PRUEBA

```bash
# 1. Verifica setup
psql -U postgres -d gestorpyme -c "SELECT COUNT(*) FROM usuarios;"

# 2. Inicia app
npm run dev
# Espera mensajes:
# "VITE ready in Xms"
# "[Electron] App is ready"
# "[Handler] ... registrados"

# 3. En Electron, abre DevTools
Ctrl+Shift+I

# 4. Login
username: empleado1
password: empleado123

# 5. En DevTools → Console
# Busca:
# "INFO [HTTP] Invoking: auth:login"
# "✓ Response received: { success: true, user: ... }"

# 6. Continúa con prueba...
# Verificaen Console cada IPC call

# 7. Si error, anota y busca en
# GUIA-PRUEBA-EMPLEADO.md → "🐛 POSIBLES PROBLEMAS"
```

---

## 💡 TIPS DE PRODUCTIVIDAD

```bash
# Abre 3 terminales en paralelo:

# Terminal 1: Ver logs de Electron
npm run dev:electron 2>&1 | tee electron.log

# Terminal 2: Ver logs de Vite
npm run dev:vite

# Terminal 3: Ejecutar comandos SQL
# psql -U postgres -d gestorpyme

# O usa screen/tmux:
screen -S gestorpyme
screen -S gestorpyme -X new-window  # Nueva ventana
screen -S gestorpyme -X select 1    # Cambiar ventana
```

---

## 🔄 CICLO RÁPIDO DE DESARROLLO

```bash
# Si cambias código:

# 1. Guarda archivo (Ctrl+S)
# 2. Frontend se recompila automáticamente (Vite HMR)
# 3. Electron recarga automáticamente (en algunos casos)
# 4. Si no, cierra Electron y abre de nuevo

# Ctrl+C para detener npm run dev
npm run dev
```

---

## 📋 CHECKLIST RÁPIDO PRE-PRUEBA

```bash
✓ PostgreSQL corriendo:
  pg_isready -h localhost -p 5432

✓ BD con datos:
  psql -U postgres -d gestorpyme -c "SELECT COUNT(*) FROM usuarios;"

✓ node_modules instalado:
  ls node_modules | head

✓ .env existe:
  [ -f .env ] && echo "OK" || echo "FALTA"

✓ TypeScript compila:
  npm run type-check

✓ Handlers registrados:
  grep "registerTurnoHandlers" electron/main.ts

✓ Validaciones disponibles:
  [ -f electron/handlers/validationHelpers.ts ] && echo "OK"

✓ Todo OK?
  npm run dev
```

---

## 🎯 COMANDOS POR PANTALLA

### LoginForm
```bash
# Verifica que usuario existe:
psql -U postgres -d gestorpyme -c \
  "SELECT * FROM usuarios WHERE username='empleado1';"
```

### TurnoScreen - Crear Turno
```bash
# Verifica que turno se creó:
psql -U postgres -d gestorpyme -c \
  "SELECT * FROM turnos WHERE numero_turno=1 ORDER BY created_at DESC LIMIT 1;"
```

### TurnoScreen - Agregar Transacción
```bash
# Verifica transacciones:
psql -U postgres -d gestorpyme -c \
  "SELECT * FROM transacciones ORDER BY created_at DESC LIMIT 5;"
```

### TurnoScreen - Cerrar Turno
```bash
# Verifica que turno está CERRADO:
psql -U postgres -d gestorpyme -c \
  "SELECT id, numero_turno, estado FROM turnos WHERE estado='CERRADO';"
```

### RevisionScreen - Supervisor
```bash
# Verifica días contables:
psql -U postgres -d gestorpyme -c \
  "SELECT * FROM dias_contables ORDER BY fecha DESC LIMIT 1;"
```

---

## 🚨 EMERGENCIA - RESETEAR TODO

```bash
# Mata todos los procesos
Ctrl+C  (en terminal)
killall node    # Mac/Linux
taskkill /F /IM node.exe  # Windows

# Limpia caché
rm -rf dist node_modules .electron-cache

# Reinstala
npm install

# Resetea BD
psql -U postgres -c "DROP DATABASE IF EXISTS gestorpyme;"
psql -U postgres < scripts/init-database.sql

# Reinicia
npm run dev
```

---

## 📞 REFERENCIA RÁPIDA

```
Ctrl+C          → Detiene proceso
F12             → Abre DevTools en Electron
Ctrl+Shift+I    → Abre DevTools (alternativa)
Cmd+Option+I    → Abre DevTools (Mac)
```

---

**Última actualización:** Noviembre 2025
**Úsalos durante la prueba:** ✅ SI

