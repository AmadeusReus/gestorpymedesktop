# 📜 Scripts de Setup y Testing

Esta carpeta contiene todos los scripts para configurar la BD y ejecutar pruebas.

## 🚀 Scripts Principales

### Setup (Elige uno)

**`setup-wizard.mjs`** - Asistente interactivo ⭐ RECOMENDADO
```bash
node scripts/setup-wizard.mjs
```

**`clean-db.mjs`** - Limpiar BD rápidamente
```bash
node scripts/clean-db.mjs
```

**`run-init-db.mjs`** - Inicializar BD manualmente
```bash
node scripts/run-init-db.mjs
```

### Pruebas

**`run-tests.mjs`** - Ejecutador maestro
```bash
node scripts/run-tests.mjs all      # Todas
node scripts/run-tests.mjs auth     # Solo login
node scripts/run-tests.mjs turno    # Solo turnos
```

**`test-auth.mjs`** - Pruebas de autenticación
```bash
node scripts/test-auth.mjs
```

**`test-turno.mjs`** - Pruebas de turnos
```bash
node scripts/test-turno.mjs
```

### Otros

**`rename-db.mjs`** - Renombrar BD
```bash
node scripts/rename-db.mjs
```

**`reset-db.mjs`** - Reset BD (destructivo)
```bash
node scripts/reset-db.mjs
```

## 📁 Archivos SQL

**`init-database.sql`** - Schema SQL puro (no se ejecuta directamente)

## 📚 Documentación

Lee la documentación en `/docs`:
- `docs/QUICK-START.md` - Guía rápida
- `docs/SCRIPTS.md` - Referencia de scripts
- `docs/TEST-GUIDE.md` - Cómo testear
- `docs/DB-SETUP.md` - Problemas de BD

## 🔄 Flujo Típico

```bash
# 1. Setup inicial
node scripts/setup-wizard.mjs

# 2. Ejecutar pruebas
node scripts/run-tests.mjs all

# 3. Limpiar cuando sea necesario
node scripts/clean-db.mjs
```

## ⚠️ Importante

- Los scripts deben ejecutarse desde la **raíz del proyecto**
- Requiere `.env` configurado
- Requiere PostgreSQL corriendo
- Algunos scripts son **destructivos** (eliminan datos)

---

Ver más en `/docs`
