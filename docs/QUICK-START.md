# 🚀 QUICK START - GestorPyME Desktop

**Estado:** ✅ CU-1 COMPLETADO - Flujo del Empleado Funcional

## ⚡ 3 Pasos para Empezar

### 1️⃣ Resetear Base de Datos
```bash
cd /path/to/gestorpymedesktop
echo "s" | node scripts/clean-db.mjs
```

**Qué hace:**
- Elimina datos antiguos
- Recrea schema completo
- Inserta usuarios y catálogos de prueba

**Output esperado:**
```
✅ LIMPIEZA COMPLETADA
👤 Usuarios disponibles:
  empleado1 | empleado123 | empleado ✅
```

### 2️⃣ Iniciar Aplicación Electron
```bash
npm run dev
```

**Qué hace:**
- Inicia Vite dev server
- Abre ventana de Electron
- Hot reload habilitado

**Output esperado:**
```
VITE v7.2.0 ready in 219ms
```

### 3️⃣ Login como Empleado
```
Usuario: empleado1
Contraseña: empleado123
```

---

## 🎯 Flujo de Prueba (CU-1)

### ✅ Paso 1: Crear Turno
1. Verás pantalla: "No existe turno registrado para hoy"
2. Click: **"Crear Turno"**
3. ¿Resultado esperado?
   - Se muestra: "Turno #1 - ABIERTO"
   - 3 botones de transacciones habilitados

### ✅ Paso 2: Registrar Transacciones

**A) Pago Digital:**
```
1. Click: "+ Registrar Pago Digital"
2. Modal abierto con:
   - Dropdown: Nequi, Bancolombia, Daviplata
   - Campo Valor
   - Campo Concepto (opcional)
3. Selecciona: Nequi
4. Ingresa Valor: 50000
5. Click: "✔️ Agregar Pago"
6. ¿Resultado esperado?
   - Transacción aparece en tabla
   - Modal se cierra
   - Total Digital actualizado: $50,000
```

**B) Gasto de Caja:**
```
1. Click: "- Registrar Gasto de Caja"
2. Modal con:
   - Dropdown: Arriendo, Servicios, Personal, Mantenimiento
3. Selecciona: Arriendo
4. Ingresa Valor: 20000
5. Click: "✔️ Agregar Gasto"
6. ¿Resultado esperado?
   - Transacción aparece en tabla
   - Total Gastos actualizado: -$20,000
```

**C) Compra a Proveedor:**
```
1. Click: "- Registrar Compra(Prov)"
2. Modal con:
   - Dropdown: Proveedor A, Proveedor B, Proveedor C
3. Selecciona: Proveedor A
4. Ingresa Valor: 15000
5. Click: "✔️ Agregar Compra"
6. ¿Resultado esperado?
   - Transacción aparece en tabla
   - Total Gastos/Compras: -$35,000
```

### ✅ Paso 3: Verificar Tabla de Transacciones
```
Debe mostrar 3 transacciones:
1. $50,000 | PAGO_DIGITAL | Nequi
2. -$20,000 | GASTO_CAJA | Arriendo
3. -$15,000 | COMPRA_PROV | Proveedor A

✓ Paginación funciona (máx 5 por página)
✓ Botón borrar (🗑️) disponible
```

### ✅ Paso 4: Ingresar Valores de Cierre
```
En sección "CIERRE DE TURNO":
1. Venta Reportada POS: 150000
2. Efectivo Contado en Caja: 165000
3. Click: [Calcular Mi Diferencia]

¿Resultado esperado?
- Muestra: "Total Digitales: $50,000"
- Muestra: "Total Gastos/Compras: -$35,000"
- Muestra: "Efectivo Esperado: $165,000"
- Muestra: "Diferencia: +$0" (coincide con lo contado)
```

### ✅ Paso 5: Cerrar Turno
```
1. Click: "🔒 CERRAR TURNO Y SALIR"
2. Confirmar en diálogo
3. Regresar a Login

¿Resultado esperado?
- Sesión cerrada
- De vuelta en pantalla de Login
```

### ✅ Paso 6: Login Nuevamente
```
Usuario: empleado1
Contraseña: empleado123

¿Resultado esperado?
- Turno #1 - CERRADO
- Modo solo lectura (sin botones de edición)
- Nuevo botón: "📋 Ver mis turnos cerrados"
```

### ✅ Paso 7: Ver Historial de Turnos
```
1. Click: "📋 Ver mis turnos cerrados"
2. Debe mostrar tabla:
   - Turno #1
   - Fecha: (hoy)
   - Estado: CERRADO
   - Venta: $150,000
   - Diferencia: +$0

3. Click en botón "Ver"
4. ¿Resultado esperado?
   - Muestra detalles del turno
   - Tabla de transacciones (3 items)
   - Modo solo lectura
```

### ✅ Paso 8: Volver al Turno Actual
```
En detalles del historial:
1. Click: "← Volver al listado"
2. Vuelve a tabla de turnos

O desde tabla:
1. Click: "← Volver al turno actual"
2. Regresa al turno CERRADO
```

---

## 🧪 Verificación de Features

| Feature | Usuario | Esperado | Estado |
|---------|---------|----------|--------|
| Login | empleado1 | ✅ Entra | Testing |
| Crear Turno | empleado1 | ✅ Se crea #1 ABIERTO | Testing |
| Registrar Pago | empleado1 | ✅ Se guarda +50000 | Testing |
| Registrar Gasto | empleado1 | ✅ Se guarda -20000 | Testing |
| Registrar Compra | empleado1 | ✅ Se guarda -15000 | Testing |
| Ver Tabla | empleado1 | ✅ 3 transacciones | Testing |
| Calcular Diferencia | empleado1 | ✅ Cálculo automático | Testing |
| Cerrar Turno | empleado1 | ✅ Estado CERRADO | Testing |
| Ver Historial | empleado1 | ✅ Tabla con turnos | Testing |
| Ver Detalles | empleado1 | ✅ Solo lectura | Testing |

---

## 🛠️ Troubleshooting

### Error: "No se conecta a BD"
```bash
# Verificar PostgreSQL está corriendo
psql -U postgres -d gestorpyme

# Resetear BD si hay corrupción
echo "s" | node scripts/clean-db.mjs
```

### Error: "Turno abierto por otro empleado"
```
Significa que un admin abrió el turno.
Solución: echo "s" | node scripts/clean-db.mjs
```

### La app se ve congelada
```
1. Cierra Electron (Ctrl+Alt+F4)
2. Presiona Ctrl+C en terminal
3. npm run dev
```

### Valores no aparecen en tabla
```
1. Recarga la app (Ctrl+R en Electron)
2. Si persiste, resetea BD y intenta de nuevo
```

---

## 📞 Usuarios de Prueba

**Para CU-1 (Empleado):**
```
usuario: empleado1
contraseña: empleado123
rol: empleado
```

**Para otros roles (próximas sesiones):**
```
usuario: supervisor
contraseña: supervisor123
rol: supervisor

usuario: admin
contraseña: admin123
rol: administrador
```

---

## 📚 Documentación Adicional

Para información más detallada:

- **CU-1 Completo:** `/docs/IMPLEMENTATION-CU1.md`
- **Arquitectura:** `/docs/ARQUITECTURA-FRONTEND.md`
- **Database:** `/docs/DB-SETUP.md`
- **Scripts:** `/scripts/README.md`
- **SRS:** Documentación oficial del proyecto

---

## ✅ Checklist de Prueba

Copia y usa para tu test:

```
SETUP:
☐ BD reseteada (clean-db.mjs)
☐ npm run dev ejecutándose
☐ Ventana Electron visible

CU-1 FLUJO:
☐ Login con empleado1 exitoso
☐ Crear Turno funciona
☐ Pago Digital se registra
☐ Gasto de Caja se registra
☐ Compra a Proveedor se registra
☐ Tabla muestra 3 transacciones
☐ Cálculo de diferencia correcto
☐ Cerrar Turno funciona
☐ Historial de turnos visible
☐ Detalles en modo solo lectura

VALIDACIONES:
☐ No hay errores en consola
☐ Datos persisten después de reload
☐ Valores negativos se guardan bien
☐ Paginación funciona si hay muchas transacciones

RESULTADOS:
☐ TODOS LOS TESTS PASAN = ✅ CU-1 COMPLETADO
```

---

## 🎉 ¡Listo!

Si todos los pasos funcionan, **CU-1 está completamente funcional** en tu instalación de Electron.

**Próximo paso:** Implementar CU-2 (Supervisor) o CU-3 (Admin)

---

**Última actualización:** Noviembre 2025
**Versión:** 0.9.3 - CU-1 Completo
