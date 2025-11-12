# 📚 Referencia de Scripts - GestorPyME Desktop

**Última actualización:** Noviembre 2025
**Propósito:** Mapeo completo de scripts para evitar revisar código innecesariamente

---

## 🎯 Clasificación por Propósito

### 🗄️ BASE DE DATOS

| Script | Comando | Propósito | Borra | Mantiene |
|--------|---------|-----------|-------|----------|
| **reset-db.mjs** | `node reset-db.mjs` | Reset COMPLETO: elimina todas las tablas y reinicia schema | ❌ Todo | ✅ Nada |
| **clean-db.mjs** | `node clean-db.mjs` | Limpia tablas y reinicia datos de prueba | ❌ Todo | ✅ Nada |
| **reset-simple.sql** | `psql -f reset-simple.sql` | Reset SIMPLE: solo datos operacionales | ✅ Transacciones, Turnos, Días | ✅ Usuarios, Negocios, Catálogos |
| **reset-bd-prueba.mjs** | `node reset-bd-prueba.mjs` | Reset SIMPLE (versión Node) para pruebas manuales | ✅ Transacciones, Turnos, Días | ✅ Usuarios, Negocios, Catálogos |
| **init-database.sql** | `psql -f init-database.sql` | Inicializa BD desde cero con schema + datos prueba | ❌ Estructura + datos | ✅ Nada |
| **run-init-db.mjs** | `node run-init-db.mjs` | Ejecuta init-database.sql desde Node | ❌ Estructura + datos | ✅ Nada |
| **rename-db.mjs** | `node rename-db.mjs` | Renombra la BD actual (para backups) | ⚠️ Datos quedan en BD vieja | ✅ Se crea BD nueva |

---

### 🔐 SEGURIDAD & CONTRASEÑAS

| Script | Comando | Propósito | Entrada | Salida |
|--------|---------|-----------|---------|--------|
| **generate-password-hashes.mjs** | `node generate-password-hashes.mjs` | Genera hashes bcrypt para contraseñas | String texto plano | Hash bcrypt |

**Uso:** Para crear nuevos usuarios con contraseñas seguras

---

### 🧪 TESTING & VALIDACIÓN

| Script | Comando | Propósito | Simula | Requiere |
|--------|---------|-----------|--------|----------|
| **test-auth.mjs** | `node test-auth.mjs` | Tests de autenticación sin Electron | `auth:login` | BD viva |
| **test-turno.mjs** | `node test-turno.mjs` | Tests de turnos sin Electron | `turno:*` handlers | BD viva |
| **test-handlers.mjs** | `node test-handlers.mjs` | Tests de 3 handlers críticos | `negocio:getByUser`, `dia-contable:*` | BD viva |
| **run-tests.mjs** | `node run-tests.mjs` | Ejecutor de tests unitarios | Jest tests | Dependencias |
| **setup-wizard.mjs** | `node setup-wizard.mjs` | Asistente interactivo de setup | Todas las opciones | Confirmación user |

---

### 📊 DATOS & MIGRACIONES

| Script | Comando | Propósito | Borra | Modifica |
|--------|---------|-----------|-------|----------|
| **convert-transaction-values.sql** | `psql -f convert-transaction-values.sql` | Convierte valores negativos → positivos (migración antigua) | ❌ Nada | ✅ Transacciones (valores) |
| **convert-transaction-values.js** | `node convert-transaction-values.js` | Versión Node de la conversión | ❌ Nada | ✅ Transacciones (valores) |
| **reset-datos-prueba.sql** | `psql -f reset-datos-prueba.sql` | Reset de datos de prueba específicos | 🟡 Datos operacionales | 🟡 Algunos datos |

---

## 🚀 FLUJOS COMUNES

### Flujo 1: Setup Inicial (Primera vez)
```bash
node setup-wizard.mjs          # Asistente interactivo
# O manualmente:
node run-init-db.mjs            # Inicializa BD desde cero
```

### Flujo 2: Antes de Prueba Manual
```bash
node reset-bd-prueba.mjs        # Limpia datos operacionales, mantiene usuarios/catálogos
npm run dev                       # Inicia app
```

### Flujo 3: Limpiar Todo y Empezar Nuevo
```bash
node clean-db.mjs                # Limpia TODO
# O más agresivo:
node reset-db.mjs                # Reset completo
```

### Flujo 4: Generar Hash de Contraseña
```bash
node generate-password-hashes.mjs
# Ingresa contraseña, copia hash a BD
```

### Flujo 5: Testear Handlers sin Electron
```bash
node test-handlers.mjs           # Pruebas de handlers críticos
node test-auth.mjs               # Pruebas de autenticación
node test-turno.mjs              # Pruebas de turnos
```

---

## ✅ RECOMENDACIONES

### ¿Cuál script usar para...?

| Necesidad | Script | Comando |
|-----------|--------|---------|
| Empezar prueba manual limpio | **reset-bd-prueba.mjs** | `node reset-bd-prueba.mjs` |
| Setup completo nuevo | **setup-wizard.mjs** | `node setup-wizard.mjs` |
| Testear handlers rápido | **test-handlers.mjs** | `node test-handlers.mjs` |
| Generar hash contraseña | **generate-password-hashes.mjs** | `node generate-password-hashes.mjs` |
| Reset agresivo (nuclear) | **clean-db.mjs** | `node clean-db.mjs` |
| Migración de datos | **convert-transaction-values.js** | `node convert-transaction-values.js` |

---

## 🗑️ SCRIPTS A POSIBLE ELIMINAR

- `reset-datos-prueba.sql` - Obsoleto, usar `reset-bd-prueba.mjs`
- `convert-transaction-values.sql` - Obsoleto, usar .js version
- `convert-transaction-values.js` - Solo para migración histórica (ya completada)

---

## 📝 NOTAS

- **Los scripts .sql pueden no funcionar sin `psql` instalado.** Usar versión .mjs cuando sea posible.
- **Los scripts .mjs son más portátiles** ya que usan Node.js directamente.
- **Siempre revisar los logs** de ejecución para verificar éxito.
- **Hacer backup** antes de usar `reset-db.mjs` o `clean-db.mjs`.

---

**¿Necesitas crear nuevo script?**
1. Revisa esta tabla primero
2. Si no existe, créalo con patrón `.mjs`
3. Agrega entrada a esta tabla
4. Documenta entrada/salida

