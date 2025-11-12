# ⚡ INICIO RÁPIDO - PRUEBA MANUAL DEL EMPLEADO

**No tienes tiempo para leer todo?** Aquí está lo esencial.

---

## 🏃‍♂️ EN 60 SEGUNDOS

### ANTES DE EMPEZAR (5 min):

```bash
# 1. Verifica que PostgreSQL esté corriendo
# 2. Verifica que hay datos en BD:
psql -U postgres -d gestorpyme -c "SELECT COUNT(*) FROM usuarios;"
# Esperado: count = 6+

# 3. Si falta, crea datos de prueba:
psql -U postgres < scripts/init-database.sql
```

### INICIA LA APLICACIÓN (30 seg):

```bash
npm run dev
```

Espera a ver:
- Ventana Electron se abre
- Se muestra LoginForm

---

## 👤 CREDENCIALES DE PRUEBA

Guarda estas credenciales a mano:

| Usuario | Contraseña | Rol | Negocio | Uso |
|---------|-----------|-----|---------|-----|
| `empleado1` | `empleado123` | Empleado | Farm1 | Crear turno, transacciones |
| `supervisor` | `supervisor123` | Supervisor | Farm1 | Revisar turno cerrado |
| `admin` | `admin123` | Admin | Farm1, Farm2 | (No se usa aquí) |

---

## 🎬 FLUJO A PROBAR (15 min)

```
1. LOGIN: empleado1 / empleado123
   ↓
2. CREAR TURNO
   └─ Click [Crear Turno]
   └─ Confirma en modal
   ↓
3. AGREGAR TRANSACCIÓN 1
   └─ Click [+Registrar Pago Digital]
   └─ Valor: 50000
   └─ Concepto: "Nequi transfer"
   └─ Click [Agregar]
   ↓
4. AGREGAR TRANSACCIÓN 2
   └─ Click [-Registrar Gasto de Caja]
   └─ Valor: 10000
   └─ Concepto: "Caja chica"
   └─ Click [Agregar]
   ↓
5. REVISAR CÁLCULOS
   └─ Scroll hacia "CIERRE DE TURNO"
   └─ Ingresa "Venta Reportada": 60000
   └─ Ingresa "Efectivo Contado": 10000
   └─ Verifica que "DIFERENCIA" = -50000 (rojo)
   ↓
6. CERRAR TURNO
   └─ Click [🔒 CERRAR TURNO Y SALIR]
   └─ Confirma en modal
   └─ Estado cambia a "CERRADO"
   ↓
7. LOGOUT y LOGIN como supervisor
   └─ Username: supervisor / supervisor123
   ↓
8. VERIFICAR
   └─ Ver que Turno #1 está CERRADO
   └─ Ver que hay botón [Revisar y Cerrar Día]
```

---

## ✅ CHECKLIST RÁPIDO

Durante la prueba, verifica:

- [ ] Login funciona
- [ ] Turno se crea (Turno #1)
- [ ] Transacciones se agregan (aparecen en tabla)
- [ ] Cálculos automáticos funcionan (sumas correctas)
- [ ] Diferencia se calcula bien
- [ ] Turno cierra sin errores
- [ ] Supervisor ve el turno cerrado
- [ ] No hay errores en consola (F12)

---

## 🔴 SI ALGO FALLA

### Login rechaza credenciales

```bash
# Reinicia BD:
psql -U postgres < scripts/init-database.sql
# Luego cierra Electron (Ctrl+C) y reinicia: npm run dev
```

### Transacciones no aparecen

```bash
# Abre DevTools (F12)
# Busca en Console si hay errores
# Verifica que IPC devuelve { success: true }
```

### Cálculos no se actualizan

```bash
# Presiona Tab después de cambiar valores
# O click en otro campo
```

### Error "Connection refused"

```bash
# PostgreSQL no está corriendo
# Windows: net start postgresql-x64-15
# Mac: brew services start postgresql
```

---

## 📖 DOCUMENTOS DETALLADOS

Si necesitas más info, abre estos archivos en la carpeta del proyecto:

1. **GUIA-PRUEBA-EMPLEADO.md** - Guía paso a paso muy detallada
2. **PRE-REQUISITOS-PRUEBA.md** - Verificación completa de setup
3. **CAMBIOS-OPCION-B.md** - Info sobre las validaciones implementadas

---

## 🆘 SOPORTE RÁPIDO

**Problema:** No sé si la BD está bien
```bash
psql -U postgres -d gestorpyme -c "SELECT COUNT(*) FROM turnos;"
```
Si devuelve 0, es normal (nueva base de datos).

---

**Problema:** Electron no abre
```bash
# Verifica que Vite esté corriendo (en otra ventana)
# npm run dev:vite
# Luego en otra ventana: npm run dev:electron
```

---

**Problema:** Quiero resetear TODO
```bash
# Dropea la BD y recreala
psql -U postgres -c "DROP DATABASE gestorpyme;"
psql -U postgres < scripts/init-database.sql
# Luego npm run dev
```

---

## 📸 QUÉ DEBERÍAS VER

### Después de "Crear Turno":
```
┌──────────────────────────────────────────┐
│ Turno #1                Estado: ABIERTO ✓│
├──────────────────────────────────────────┤
│ [+💳] [−📦] [−💸]                        │
│                                          │
│ TRANSACCIONES: (tabla vacía por ahora)   │
│                                          │
│ CIERRE DE TURNO:                         │
│ Venta Reportada: [___]                   │
│ Efectivo Contado: [___]                  │
│                                          │
│ Total Digitales: 0                       │
│ Total Gastos: 0                          │
│ Efectivo Esperado: 0                     │
│ DIFERENCIA: 0                            │
│                                          │
│ [🔒 CERRAR TURNO Y SALIR]               │
└──────────────────────────────────────────┘
```

### Después de agregar transacciones:
```
TRANSACCIONES: 2
┌────┬──────┬─────────────┬──────────────┐
│ #  │Valor │ Categoría   │ Concepto     │
├────┼──────┼─────────────┼──────────────┤
│ 1  │50000 │ PAGO_DIGITAL│ Nequi...     │
│ 2  │10000 │ GASTO_CAJA  │ Caja chica   │
└────┴──────┴─────────────┴──────────────┘

Total Digitales: 50000
Total Gastos: -10000
Efectivo Esperado: 60000
DIFERENCIA: -50000 🔴
```

---

## 🎯 RESULTADO ESPERADO

**Si todo funciona:**
- ✅ Empleado puede crear turno
- ✅ Empleado puede agregar transacciones
- ✅ Cálculos se hacen automáticamente
- ✅ Empleado puede cerrar turno
- ✅ Supervisor ve turno cerrado
- ✅ No hay errores en consola

**Tiempo total:** 15-20 minutos

---

## 📋 NOTAS IMPORTANTES

1. **PAGO_DIGITAL** = Dinero que entra (se suma)
2. **GASTO_CAJA** = Dinero que sale (se resta)
3. **DIFERENCIA** = Cuánto efectivo falta o sobra

---

¿Listo? Ejecuta:

```bash
npm run dev
```

Y comienza en **PASO 1 de GUIA-PRUEBA-EMPLEADO.md**

---

**¡Éxito en la prueba!** 🚀

