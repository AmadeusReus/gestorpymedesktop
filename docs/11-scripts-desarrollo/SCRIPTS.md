# 📜 Referencia Rápida de Scripts

## 🚀 Scripts Principales

### 1. Setup (Elegir UNO)

#### `setup-wizard.mjs` ⭐ RECOMENDADO
Asistente interactivo paso a paso.

```bash
node setup-wizard.mjs
```

**Hace:**
- Verifica PostgreSQL
- Crea BD
- Configura .env
- Inicializa schema
- Verifica datos

**Tiempo:** ~30 segundos

---

#### `reset-db.mjs` (Reset Rápido)
Elimina todo y reinicializa la BD existente.

```bash
node reset-db.mjs
```

**Hace:**
- ⚠️ Elimina TODAS las tablas
- Recrea schema desde cero
- Reinicia datos de prueba

**Tiempo:** ~10 segundos
**Uso:** Cuando quieres limpiar la BD sin que te pregunte

---

#### `run-init-db.mjs` (Alternativa Manual)
Inicializa la BD directamente.

```bash
# Prerequisito: .env debe estar configurado
node run-init-db.mjs
```

**Hace:**
- Ejecuta `init-database.sql`
- Crea schema
- Inserta datos

**Tiempo:** ~5 segundos (requiere .env listo)

---

### 2. Pruebas

#### `run-tests.mjs` ⭐ PRINCIPAL
Ejecuta todas las pruebas.

```bash
# Todos los tests:
node run-tests.mjs all

# Solo autenticación:
node run-tests.mjs auth

# Solo turnos:
node run-tests.mjs turno

# Ver ayuda:
node run-tests.mjs help
```

**Hace:**
- Testa login
- Testa creación de turnos
- Testa validaciones

**Tiempo:** ~10 segundos

---

#### `test-auth.mjs` (Directo)
Pruebas de autenticación solamente.

```bash
node test-auth.mjs
```

**Prueba:**
- Login válido
- Contraseña incorrecta
- Usuario inexistente
- Usuario inactivo

---

#### `test-turno.mjs` (Directo)
Pruebas de turnos solamente.

```bash
node test-turno.mjs
```

**Prueba:**
- Crear Turno 1
- Recuperar Turno 1
- Crear Turno 2
- Intentar Turno 3
- Validar acceso cruzado

---

## 🔧 Scripts de Configuración

### `init-database.sql`
Script SQL puro (sin ejecutar automáticamente).

```bash
# Ejecutar manualmente en psql:
psql -U postgres -d gestorpyme -f init-database.sql

# O desde dentro de psql:
\i init-database.sql
```

---

## 📋 Flujo Recomendado

### Primera Vez

```bash
# 1. Setup (elige uno):
node setup-wizard.mjs              # ⭐ Recomendado (interactivo)
# O:
node run-init-db.mjs               # Manual (requiere .env)

# 2. Pruebas:
node run-tests.mjs all

# 3. Si todo ✅ pasa:
npm run dev                         # Inicia la app
```

### Desarrollo Iterativo

```bash
# Después de cambios en backend:
node run-tests.mjs all

# Si necesitas limpiar todo:
node setup-wizard.mjs               # Reinicia la BD

# Para probar un módulo específico:
node test-auth.mjs                  # Solo auth
node test-turno.mjs                 # Solo turnos
```

---

## 🎯 Cuándo Usar Cada Script

| Necesito... | Usa... | Comando |
|------------|--------|---------|
| Empezar (primera vez) | setup-wizard.mjs | `node setup-wizard.mjs` |
| BD ya existe, actualizar | setup-wizard.mjs | `node setup-wizard.mjs` |
| Limpiar BD sin preguntar | reset-db.mjs | `node reset-db.mjs` |
| Solo inicializar BD | run-init-db.mjs | `node run-init-db.mjs` |
| Probar todo | run-tests.mjs | `node run-tests.mjs all` |
| Probar solo login | test-auth.mjs | `node test-auth.mjs` |
| Probar solo turnos | test-turno.mjs | `node test-turno.mjs` |
| Ejecutar SQL directo | init-database.sql | `psql -f init-database.sql` |

---

## 📊 Salida Esperada

### `setup-wizard.mjs`
```
============================================================================
👋 BIENVENIDO AL SETUP DE GestorPyME
============================================================================

[Verifica PostgreSQL]
✅ PostgreSQL está corriendo

[Crear BD]
✅ Base de datos 'gestorpyme' creado

[Configurar .env]
✅ Archivo .env guardado

[Inicializar]
✅ Base de datos inicializada

[Resumen]
✅ SETUP COMPLETADO
👤 Usuarios disponibles:
   admin       | admin123
   empleado1   | empleado123
   ...
```

### `run-tests.mjs all`
```
============================================================================
🧪 SUITE DE PRUEBAS: AUTENTICACIÓN
============================================================================
[Test 1: Login válido]
✅ Login exitoso

[Test 2: Contraseña incorrecta]
✅ Error esperado

...

============================================================================
🧪 SUITE DE PRUEBAS: INICIALIZACIÓN DE TURNOS
============================================================================
[Test 1: Crear Turno 1]
✅ Turno 1 creado

...

✅ ¡TODAS LAS PRUEBAS PASARON!
```

---

## ⚠️ Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
npm install
```

### Error: "ENOENT: no such file or directory '.env'"
```bash
node setup-wizard.mjs  # Creará .env automáticamente
# O manual:
echo "DB_HOST=localhost" > .env
echo "DB_PORT=5432" >> .env
```

### Error: "connection refused"
```bash
# PostgreSQL no está corriendo
docker start postgres-gestorpyme  # Si usas Docker
# O:
net start postgresql-x64-16       # Windows local
```

### Error: "database does not exist"
```bash
psql -U postgres -c "CREATE DATABASE gestorpyme;"
```

---

## 🔄 Flujo Completo

```
[setup-wizard.mjs]
    ↓
[Verificar PostgreSQL] ✅
    ↓
[Crear BD] ✅
    ↓
[Configurar .env] ✅
    ↓
[Ejecutar init-database.sql] ✅
    ↓
[Insertar datos de prueba] ✅
    ↓
[run-tests.mjs]
    ↓
[test-auth.mjs] ✅
    ↓
[test-turno.mjs] ✅
    ↓
[npm run dev]
    ↓
[GestorPyME corriendo] 🚀
```

---

## 💡 Pro Tips

1. **Ejecuta `setup-wizard.mjs` primero** - Configura todo automáticamente

2. **Usa `run-tests.mjs all` frecuentemente** - Verifica que nada se rompió

3. **Lee los logs** - Los scripts imprimen mucha información útil

4. **Mantén .env seguro** - No lo commits a git (está en .gitignore)

5. **Documenta cambios** - Si agregas tests nuevos, actualiza TEST-GUIDE.md

---

## 📞 Preguntas Frecuentes

**P: ¿Puedo ejecutar los scripts sin PostgreSQL?**
R: No. PostgreSQL debe estar corriendo.

**P: ¿Qué contraseñas puedo usar para probar?**
R: Ver la tabla de usuarios en `QUICK-START.md`

**P: ¿Puedo cambiar los datos de prueba?**
R: Sí, edita `init-database.sql` y vuelve a ejecutar `setup-wizard.mjs`

**P: ¿Cuánto tarda todo el setup?**
R: ~30 segundos con `setup-wizard.mjs`

**P: ¿Puedo usar esto en producción?**
R: No. Estos scripts son solo para desarrollo local.

---

## 📚 Documentación Relacionada

- `QUICK-START.md` - Guía rápida de 3 pasos
- `DB-SETUP.md` - Problemas de base de datos
- `TEST-GUIDE.md` - Detalles de pruebas
- `init-database.sql` - Schema SQL completo

---

**¡Ahora sí, a probarlo! 🚀**

```bash
node setup-wizard.mjs
```
