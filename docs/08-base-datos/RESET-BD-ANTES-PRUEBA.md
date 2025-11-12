# 🔄 RESET DE BASE DE DATOS - ANTES DE PRUEBA MANUAL

**Antes de hacer la prueba manual, ejecuta este script para limpiar los datos.**

---

## ✨ QUÉ HACE ESTE RESET

### Borra 🗑️
- ✓ Transacciones (todas)
- ✓ Turnos (todos)
- ✓ Días Contables (todos)

### Mantiene ✅
- ✓ Usuarios (empleado1, supervisor, admin, etc)
- ✓ Negocios (Farmacia Test, etc)
- ✓ Miembros/Roles
- ✓ Proveedores, Tipos de Gasto, Tipos de Pago Digital

**Resultado:** Base de datos limpia pero con estructura lista para prueba

---

## 🚀 CÓMO EJECUTAR

### Opción 1: Usar psql (Recomendado)

```bash
# En Windows (PowerShell)
psql -U postgres -d gestorpyme -f scripts/reset-simple.sql

# En Mac/Linux
psql -U postgres -d gestorpyme -f scripts/reset-simple.sql
```

### Opción 2: Desde pgAdmin

1. Abre pgAdmin
2. Conecta a `gestorpyme`
3. Tools → Query Tool
4. Copia el contenido de `scripts/reset-simple.sql`
5. Pega en Query Tool
6. Click [Execute]

### Opción 3: Desde terminal PostgreSQL

```bash
# Conecta a BD
psql -U postgres -d gestorpyme

# En el prompt psql, ejecuta:
\i scripts/reset-simple.sql
```

---

## ✅ VERIFICACIÓN

Después de ejecutar, deberías ver:

```
DATOS BORRADOS
─────────────
Transacciones: 0
Turnos: 0
Días Contables: 0

ESTRUCTURA BASE INTACTA
──────────────────────
Usuarios: 6
Negocios: 2
Miembros: 8

USUARIOS DISPONIBLES PARA PRUEBA:
─────────────────────────────────
username    | nombre_completo  | rol          | negocio
empleado1   | Empleado 1       | empleado     | Farmacia Test
empleado2   | Empleado 2       | empleado     | Farmacia Test
supervisor  | Supervisor 1     | supervisor   | Farmacia Test
admin       | Admin User       | administrador| Farmacia Test
admin       | Admin User       | administrador| Farmacia Central
```

---

## 📋 CHECKLIST ANTES DE PRUEBA

```
□ Ejecutaste reset-simple.sql
□ Verificaste que transacciones = 0
□ Verificaste que turnos = 0
□ Verificaste que días_contables = 0
□ Verificaste que usuarios > 0
□ Verificaste que miembros > 0
□ Listo para npm run dev
```

---

## 🔧 TROUBLESHOOTING

### Problema: "permiso denegado"
```bash
# PostgreSQL podría necesitar credenciales
psql -U postgres -h localhost -d gestorpyme -f scripts/reset-simple.sql
# Te pedirá la contraseña de postgres
```

### Problema: "archivo no encontrado"
```bash
# Asegúrate de estar en la carpeta correcta
cd gestorpymedesktop
psql -U postgres -d gestorpyme -f scripts/reset-simple.sql
```

### Problema: "Could not connect to database"
```bash
# PostgreSQL no está corriendo
# Windows:
net start postgresql-x64-15

# Mac:
brew services start postgresql
```

---

## 🎯 PRÓXIMO PASO

Una vez ejecutado el reset:

```bash
npm run dev
# Abre: docs/pruebas-manuales/GUIA-PRUEBA-EMPLEADO.md
# Sigue los pasos
```

---

## 📝 NOTAS

- El script es **idempotente** (puedes ejecutarlo varias veces sin problema)
- Los usuarios siguen siendo los mismos
- Los negocios siguen siendo los mismos
- Los roles siguen asignados correctamente
- Solo se limpian datos operacionales (transacciones, turnos, días)

---

## ⚙️ DETALLES TÉCNICOS

### Secuencias reseteadas
```sql
ALTER SEQUENCE transacciones_id_seq RESTART WITH 1;
ALTER SEQUENCE turnos_id_seq RESTART WITH 1;
ALTER SEQUENCE dias_contables_id_seq RESTART WITH 1;
```

Esto asegura que los nuevos IDs comiencen desde 1 (limpio visualmente).

### Orden de borrado
1. Primero transacciones (tiene FK a turnos)
2. Luego turnos (tiene FK a días_contables)
3. Finalmente días_contables (tiene FK a negocios)

Se sigue el orden inverso de creación para evitar errores de FK.

---

## 🆘 AYUDA

Si algo falla:

1. Abre `scripts/reset-simple.sql`
2. Copia el contenido
3. Usa pgAdmin Query Tool
4. Pega y ejecuta
5. O contacta soporte

---

**Última actualización:** Noviembre 2025

