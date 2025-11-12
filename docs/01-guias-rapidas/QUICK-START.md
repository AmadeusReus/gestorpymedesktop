# 🚀 QUICK START - GestorPyME Testing

## ⚡ 3 Pasos para Empezar

### Paso 1: Inicializar Base de Datos

**Opción A: Setup Completo (Primera Vez) ⭐ RECOMENDADA**

```bash
node setup-wizard.mjs
```

**¿Qué hace?**
- Verifica PostgreSQL está corriendo
- Detecta si la BD ya existe
- Crea la BD (si no existe)
- Te pregunta qué hacer con BD existente:
  - Opción 1: Mantener la BD actual (solo inicializar schema)
  - Opción 2: Eliminar y recrear todo
- Ejecuta el schema
- Inserta datos de prueba

**Output esperado:**
```
✅ PostgreSQL está corriendo
✅ Base de datos verificada
✅ Schema y datos inicializados
```

**Opción B: Reset Rápido (Si BD ya existe)**

```bash
node reset-db.mjs
```

**¿Qué hace?**
- ⚠️ Elimina TODAS las tablas
- Recrea el schema desde cero
- Reinicia los datos de prueba
- **Uso:** Cuando quieres limpiar la BD sin preguntar

**Opción C: Setup Manual (Avanzado)**

```bash
# 1. Crea la BD manualmente:
psql -U postgres -c "CREATE DATABASE gestorpyme;"

# 2. Ejecuta el inicializador:
node run-init-db.mjs
```

### Paso 2: Prueba el Backend

**Probar autenticación (login):**
```bash
node run-tests.mjs auth
```

**Probar turnos:**
```bash
node run-tests.mjs turno
```

**Probar todo:**
```bash
node run-tests.mjs all
```

### Paso 3: Inicia la Aplicación

```bash
npm run dev
```

Abre la ventana Electron y usa:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

---

## 📁 Archivos Creados

### Setup & BD
| Archivo | Propósito |
|---------|----------|
| `init-database.sql` | Schema y datos de prueba (SQL puro) |
| `run-init-db.mjs` | Ejecuta el SQL desde Node.js |
| `setup-wizard.mjs` | Asistente interactivo (recomendado) |
| `DB-SETUP.md` | Documentación completa de BD |

### Pruebas
| Archivo | Propósito |
|---------|----------|
| `test-auth.mjs` | Pruebas de login |
| `test-turno.mjs` | Pruebas de turnos |
| `run-tests.mjs` | Ejecutador maestro de pruebas |
| `TEST-GUIDE.md` | Documentación de pruebas |

### Documentación
| Archivo | Propósito |
|---------|----------|
| `QUICK-START.md` | Este archivo (inicio rápido) |

---

## 👤 Credenciales de Prueba

Después de inicializar, tienes estos usuarios:

```
Usuario: admin
Contraseña: admin123
Rol: administrador
```

```
Usuario: empleado1
Contraseña: empleado123
Rol: empleado (Farmacia Test) / supervisor (Farmacia Central)
```

```
Usuario: empleado2
Contraseña: empleado123
Rol: empleado
```

```
Usuario: supervisor
Contraseña: supervisor123
Rol: supervisor
```

```
Usuario: inactivo
Contraseña: admin123
Rol: empleado (INACTIVO - para probar fallos)
```

---

## 🧪 Flujo de Pruebas

### 1. Pruebas de Autenticación

```bash
node run-tests.mjs auth
```

**Prueba:**
- Login válido (admin/admin123) ✅
- Contraseña incorrecta ❌
- Usuario inexistente ❌
- Usuario inactivo ❌

**Output:**
```
✅ LOGIN EXITOSO
❌ CREDENCIALES INCORRECTAS (Esperado)
❌ USUARIO NO ENCONTRADO (Esperado)
```

### 2. Pruebas de Turnos

```bash
node run-tests.mjs turno
```

**Prueba:**
- Crear Turno 1 para usuario 1 ✅
- Recuperar el mismo turno ✅
- Crear Turno 2 para usuario 2 ✅
- Intentar crear Turno 3 ❌
- Validar que otro usuario no use tu turno ❌

**Output:**
```
✅ TURNO 1 CREADO
✅ TURNO RECUPERADO
✅ TURNO 2 CREADO
❌ TURNO 3 BLOQUEADO (Esperado)
❌ ACCESO DENEGADO (Esperado)
```

---

## ⚙️ Configuración (.env)

El archivo `.env` se crea automáticamente con:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gestorpyme
```

**Para cambiar:**
1. Edita `.env` manualmente
2. O ejecuta `setup-wizard.mjs` nuevamente

---

## 🐛 Si Algo Falla

### PostgreSQL no se conecta

```bash
# En Docker:
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# En Windows local:
net start postgresql-x64-16  # Ajusta versión

# Verifica:
docker ps | find postgres
```

### Error: "database does not exist"

```bash
psql -U postgres -c "CREATE DATABASE gestorpyme;"
```

### Error: "permission denied"

Verifica que `.env` existe y tienes permisos de lectura:

```bash
cat .env
# Si no existe:
echo "DB_HOST=localhost" > .env
# ... etc
```

### Scripts no ejecutan

```bash
# Verifica Node.js está instalado:
node --version

# Verifica dependencias:
npm install
```

---

## 🎯 Próximos Pasos

Una vez que las pruebas pasen ✅:

1. **Crea el formulario de turno** (`TurnoForm.tsx`)
   - Campo para número de turno (calculado)
   - Botones: Abrir Turno, Cerrar Turno

2. **Implementa más handlers**:
   - `turno:close` - Cerrar turno
   - `transaccion:create` - Registrar gasto/pago
   - `transaccion:delete` - Eliminar transacción

3. **Expande las pruebas**:
   - Pruebas de cierre de turno
   - Pruebas de transacciones
   - Pruebas de auditoría

4. **Diseña la UI**:
   - Dashboard con nav lateral
   - Pantalla de registros
   - Pantalla de auditoría

---

## 📊 Resumen Técnico

**Backend (ya implementado):**
- ✅ Autenticación (login/logout)
- ✅ Inicialización de turnos
- ✅ Validaciones de negocio
- ✅ Manejo de errores

**Frontend (a implementar):**
- ⏳ Formulario de turno
- ⏳ Dashboard
- ⏳ Registros de transacciones
- ⏳ Auditoría

**Base de Datos:**
- ✅ Schema completo
- ✅ Datos de prueba
- ✅ Índices y constraints

---

## 💡 Tips

1. **Usa `setup-wizard.mjs`** - Te guía paso a paso
2. **Lee los logs** - Los scripts imprimen mucha info
3. **Documenta cambios** - Mantén TEST-GUIDE.md actualizado
4. **Prueba frecuentemente** - Ejecuta `run-tests.mjs all` después de cambios

---

## 🆘 Necesitas Ayuda?

- Lee `DB-SETUP.md` para problemas de base de datos
- Lee `TEST-GUIDE.md` para problemas de pruebas
- Lee el prompt del proyecto en `docs/prompt-proyecto-antes del login.txt`

¡Ahora sí, a codificar! 🚀
