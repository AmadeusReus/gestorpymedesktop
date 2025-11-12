# 🗄️ Guía de Setup de Base de Datos - GestorPyME

Este documento explica cómo inicializar la base de datos desde cero.

## 🚀 Forma Rápida (Recomendada)

### 1. Asegúrate de tener PostgreSQL corriendo

**En Docker Desktop:**
```bash
docker run --name postgres-gestorpyme \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16
```

**Verifica que está corriendo:**
```bash
docker ps | find "postgres"
```

**En Windows Local:**
```bash
# Abre Services y busca PostgreSQL, asegúrate de que está "Running"
# O desde PowerShell:
Get-Service | Where-Object {$_.Name -like '*postgres*'}
```

### 2. Crea la base de datos

**Con psql (línea de comandos):**
```bash
psql -U postgres -c "CREATE DATABASE gestorpyme;"
```

**O con DBeaver:**
- Abre DBeaver
- Clic derecho en "Databases" → New Database
- Nombre: `gestorpyme`
- OK

### 3. Configura el archivo `.env`

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gestorpyme
```

**Notas:**
- Si usas Docker con contraseña diferente, actualiza `DB_PASSWORD`
- Si PostgreSQL está en otro servidor, actualiza `DB_HOST`

### 4. Ejecuta el inicializador

```bash
node run-init-db.mjs
```

**Output esperado:**
```
============================================================================
🗄️  INICIALIZADOR DE BASE DE DATOS - GestorPyME
============================================================================

📋 Configuración:
  Host:     localhost
  Puerto:   5432
  Usuario:  postgres
  Base de datos: gestorpyme

📡 Conectando a PostgreSQL...
📂 Leyendo script: ./init-database.sql

⏳ Ejecutando script SQL...

============================================================================
✅ ¡Base de datos inicializada correctamente!
============================================================================

👤 Usuarios de Prueba:
   admin       | Contraseña: admin123       | Rol: administrador
   empleado1   | Contraseña: empleado123    | Rol: empleado
   empleado2   | Contraseña: empleado123    | Rol: empleado
   supervisor  | Contraseña: supervisor123  | Rol: supervisor
   inactivo    | Contraseña: admin123       | Rol: empleado (INACTIVO)

🏢 Negocios:
   1: Farmacia Test
   2: Farmacia Central

🧪 Próximo paso: Ejecuta las pruebas
   node run-tests.mjs all
```

## 📝 Archivos Incluidos

| Archivo | Descripción |
|---------|------------|
| `init-database.sql` | Script SQL que crea el schema y datos de prueba |
| `run-init-db.mjs` | Script Node.js que ejecuta el SQL automáticamente |
| `DB-SETUP.md` | Este documento |

## 🔧 Forma Manual (Alternativa)

Si prefieres hacer todo manualmente con `psql`:

### 1. Accede a PostgreSQL

```bash
psql -U postgres
```

### 2. Crea la base de datos

```sql
CREATE DATABASE gestorpyme;
```

### 3. Conéctate a ella

```sql
\c gestorpyme
```

### 4. Ejecuta el script

```sql
\i init-database.sql
```

### 5. Verifica

```sql
SELECT * FROM negocios;
SELECT * FROM usuarios;
SELECT * FROM miembros;
```

## 🗑️ Limpiar Todo (Empezar de Nuevo)

Si quieres eliminar la base de datos y empezar desde cero:

### Opción 1: Con Node.js (recomendado)

```bash
# Simplemente ejecuta:
node run-init-db.mjs
```

Esto elimina y recrea TODO.

### Opción 2: Manualmente

```bash
# Desde psql:
DROP DATABASE gestorpyme;
CREATE DATABASE gestorpyme;
\c gestorpyme
\i init-database.sql
```

```bash
# Desde línea de comandos:
psql -U postgres -c "DROP DATABASE gestorpyme;"
psql -U postgres -c "CREATE DATABASE gestorpyme;"
psql -U postgres -d gestorpyme -f init-database.sql
```

## 📊 Schema de Base de Datos

El script crea estas tablas en el siguiente orden:

```
negocios
├─ usuarios
   └─ miembros
   └─ transacciones (auditor_id)
├─ proveedores
├─ tipos_gasto
├─ tipos_pago_digital
└─ dias_contables
   └─ turnos
      └─ transacciones (turno_id)
```

### Relaciones (FK):

```
miembros.usuario_id     → usuarios.id
miembros.negocio_id     → negocios.id
proveedores.negocio_id  → negocios.id
tipos_gasto.negocio_id  → negocios.id
tipos_pago_digital.negocio_id → negocios.id
dias_contables.negocio_id → negocios.id
turnos.dia_contable_id  → dias_contables.id
turnos.usuario_id       → usuarios.id
transacciones.turno_id  → turnos.id
transacciones.proveedor_id → proveedores.id
transacciones.tipo_gasto_id → tipos_gasto.id
transacciones.tipo_pago_digital_id → tipos_pago_digital.id
transacciones.auditor_id → usuarios.id
```

## 👤 Usuarios de Prueba

Después de ejecutar `run-init-db.mjs`, tienes estos usuarios disponibles:

| Username | Contraseña | Rol | Negocio | Estado |
|----------|-----------|-----|---------|--------|
| admin | admin123 | administrador | Farmacia Test, Farmacia Central | ✅ Activo |
| empleado1 | empleado123 | empleado (Farmacia Test), supervisor (Farmacia Central) | Ambas | ✅ Activo |
| empleado2 | empleado123 | empleado | Farmacia Test | ✅ Activo |
| supervisor | supervisor123 | supervisor | Farmacia Test | ✅ Activo |
| inactivo | admin123 | empleado | Farmacia Test | ❌ Inactivo |

## 🧪 Después de Inicializar

Una vez que la BD esté lista, ejecuta las pruebas:

```bash
node run-tests.mjs all
```

Esto probará:
1. Login con `admin/admin123` ✅
2. Creación de turnos
3. Validaciones de negocio

## 🐛 Troubleshooting

### Error: "could not connect to server"

**Causa:** PostgreSQL no está corriendo

**Solución:**
```bash
# En Docker:
docker start postgres-gestorpyme

# En Windows:
net start postgresql-x64-16  # Ajusta el número de versión
```

### Error: "database does not exist"

**Causa:** Olvidaste crear la BD

**Solución:**
```bash
psql -U postgres -c "CREATE DATABASE gestorpyme;"
```

### Error: "role 'postgres' does not exist"

**Causa:** Usas un usuario diferente

**Solución:**
```bash
# Actualiza .env con tu usuario:
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

### Error: "permission denied"

**Causa:** El archivo .env no tiene permisos

**Solución:**
```bash
# Verifica que existe:
cat .env

# Si no existe, crea uno:
echo "DB_HOST=localhost" > .env
echo "DB_PORT=5432" >> .env
echo "DB_USER=postgres" >> .env
echo "DB_PASSWORD=postgres" >> .env
echo "DB_NAME=gestorpyme" >> .env
```

## 💡 Notas Importantes

1. **Los hashes de contraseña están hardcodeados** en `init-database.sql`
   - Esto es solo para pruebas locales
   - En producción, genera hashes verdaderos con bcrypt

2. **Las contraseñas coinciden con los hashes:**
   - admin → admin123
   - empleado1 → empleado123
   - empleado2 → empleado123
   - supervisor → supervisor123
   - inactivo → admin123

3. **Todos los usuarios pueden cambiar a múltiples negocios**
   - `admin` es administrador en ambos negocios
   - `empleado1` es empleado en Farmacia Test pero supervisor en Farmacia Central

4. **El script es idempotente**
   - Ejecutarlo múltiples veces es seguro (elimina todo y recrea)

## 📞 Preguntas?

Si tienes problemas:

1. Verifica PostgreSQL está corriendo: `docker ps` o `Get-Service`
2. Verifica el archivo `.env`
3. Lee los logs detallados del error
4. Consulta `TEST-GUIDE.md` para más información
