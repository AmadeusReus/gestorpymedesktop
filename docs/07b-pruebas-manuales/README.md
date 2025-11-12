# 🧪 GUÍAS DE PRUEBA MANUAL - GESTORPYME DESKTOP

**Bienvenido a las pruebas manuales del flujo del empleado.**

Este directorio contiene toda la documentación necesaria para realizar pruebas manuales del proyecto GestorPyME Desktop.

---

## 📚 DOCUMENTOS DISPONIBLES

### 1. 🚀 [INICIO-RAPIDO-PRUEBA.md](./INICIO-RAPIDO-PRUEBA.md)
**Para usuarios con prisa (5 minutos)**

- Resumen ultra-rápido
- Credenciales de prueba
- Flujo resumido
- Checklist básico

👉 **Úsalo si:** Tienes poco tiempo y quieres ver si funciona

---

### 2. 📖 [GUIA-PRUEBA-EMPLEADO.md](./GUIA-PRUEBA-EMPLEADO.md)
**Guía paso a paso completa (15-20 minutos ejecutando)**

- 10 pasos detallados
- Verificaciones en cada paso
- Tabla de IPC calls
- Checklist completo
- Troubleshooting de problemas comunes
- Pantallazos esperados
- Fórmulas de cálculo explicadas

👉 **Úsalo si:** Quieres seguir un protocolo formal y documentado

---

### 3. ✅ [PRE-REQUISITOS-PRUEBA.md](./PRE-REQUISITOS-PRUEBA.md)
**Verificación completa pre-prueba (10 minutos)**

- 10-point checklist
- Verificación de BD
- Verificación de variables de ambiente
- Verificación de permisos
- Verificación de handlers
- Soluciones a problemas de setup

👉 **Úsalo si:** Tienes dudas de que todo esté configurado correctamente

---

### 4. ⚡ [COMANDOS-UTILES-PRUEBA.md](./COMANDOS-UTILES-PRUEBA.md)
**Referencia rápida de comandos**

- Comandos para iniciar/detener
- Comandos de BD (PostgreSQL)
- Verificaciones rápidas
- Debugging
- Testing
- Troubleshooting
- Flujo típico
- Tips de productividad

👉 **Úsalo si:** Necesitas un comando específico o estás debuggando

---

### 5. 📊 [ESTADO-PRUEBA-MANUAL.md](./ESTADO-PRUEBA-MANUAL.md)
**Dashboard de estado y rutas de prueba**

- Estado actual del proyecto
- Rutas de prueba (3 opciones)
- Configuración del sistema
- Flujo esperado
- Criterios de éxito/fallo
- Métricas
- Próximos pasos

👉 **Úsalo si:** Quieres entender el estado general y la estrategia

---

### 6. 📋 [RESUMEN-SESION-PRUEBA.md](./RESUMEN-SESION-PRUEBA.md)
**Resumen de lo preparado**

- Qué se implementó (OPCIÓN B)
- Qué se documentó
- Estadísticas
- Progreso del proyecto
- Guías de reportar errores
- Referencias

👉 **Úsalo si:** Quieres entender qué se hizo antes de probar

---

## 🎯 ¿POR DÓNDE EMPIEZO?

### OPCIÓN A: RÁPIDO (5 minutos)
```
1. Lee: INICIO-RAPIDO-PRUEBA.md
2. Ejecuta: npm run dev
3. Sigue el flujo
4. Fin
```

### OPCIÓN B: COMPLETO (20 minutos)
```
1. Lee: PRE-REQUISITOS-PRUEBA.md
2. Completa checklist
3. Lee: GUIA-PRUEBA-EMPLEADO.md
4. Ejecuta: npm run dev
5. Sigue paso a paso
6. Completa checklist final
7. Documenta resultados
```

### OPCIÓN C: CON DOCUMENTACIÓN
```
1. Lee: RESUMEN-SESION-PRUEBA.md
2. Lee: ESTADO-PRUEBA-MANUAL.md
3. Lee: PRE-REQUISITOS-PRUEBA.md
4. Lee: GUIA-PRUEBA-EMPLEADO.md
5. Ejecuta: npm run dev
6. Realiza prueba
7. Consulta: COMANDOS-UTILES-PRUEBA.md (si necesitas)
```

---

## 🚀 INICIO RÁPIDO

```bash
# 1. IMPORTANTE: Limpia BD primero
psql -U postgres -d gestorpyme -f scripts/reset-simple.sql

# 2. Inicia app
npm run dev

# 3. Abre DevTools
Ctrl+Shift+I

# 4. Sigue GUIA-PRUEBA-EMPLEADO.md desde PASO 0 (reset) → PASO 1
```

---

## 👤 CREDENCIALES DE PRUEBA

```
EMPLEADO
├─ Username: empleado1
├─ Password: empleado123
└─ Negocio: Farmacia Test

SUPERVISOR
├─ Username: supervisor
├─ Password: supervisor123
└─ Negocio: Farmacia Test

ADMIN
├─ Username: admin
├─ Password: admin123
└─ Negocios: Farmacia Test, Farmacia Central
```

---

## 📋 CHECKLIST PRE-PRUEBA (2 minutos)

```
□ PostgreSQL corriendo
□ BD "gestorpyme" existe
□ .env configurado
□ npm install completado
□ npm run type-check sin errores
□ Handlers registrados en electron/main.ts
□ validationHelpers.ts existe
□ Puertos 5173 y 5432 disponibles
□ Ningún proceso Electron/Node corriendo
□ LISTO: npm run dev
```

---

## 🆘 SI ALGO FALLA

1. **Busca en:** GUIA-PRUEBA-EMPLEADO.md → Sección "🐛 POSIBLES PROBLEMAS"
2. **O consulta:** PRE-REQUISITOS-PRUEBA.md → Sección "🆘 SI ALGO FALLA"
3. **O:** COMANDOS-UTILES-PRUEBA.md → Busca el comando/problema

---

## 📊 ESTRUCTURA DE DOCUMENTOS

```
docs/pruebas-manuales/
├── README.md (este archivo - índice)
│
├── INICIO-RAPIDO-PRUEBA.md
│   └─ 2 min lectura | Resumen rápido
│
├── GUIA-PRUEBA-EMPLEADO.md
│   └─ 15-20 min ejecución | Paso a paso
│
├── PRE-REQUISITOS-PRUEBA.md
│   └─ 10 min lectura | Verificación setup
│
├── COMANDOS-UTILES-PRUEBA.md
│   └─ Referencia | Comandos y debugging
│
├── ESTADO-PRUEBA-MANUAL.md
│   └─ 5 min lectura | Dashboard de estado
│
└── RESUMEN-SESION-PRUEBA.md
    └─ 5 min lectura | Resumen general
```

---

## 🎬 FLUJO DE PRUEBA

```
LOGIN (empleado1)
    ↓
CREAR TURNO
    ↓
AGREGAR PAGO DIGITAL (50000)
    ↓
AGREGAR GASTO CAJA (10000)
    ↓
REVISAR CÁLCULOS
    ├─ Total Digitales: 50000
    ├─ Total Gastos: -10000
    ├─ Efectivo Esperado: 60000
    └─ DIFERENCIA: -50000
    ↓
CERRAR TURNO
    ↓
VERIFICAR (supervisor)
    └─ Ver turno cerrado
```

**Tiempo total:** 15-20 minutos

---

## ✅ VALIDACIONES QUE SE PRUEBAN

✅ **Login** - Autenticación funciona
✅ **Creación de Turno** - turno:init IPC
✅ **Transacciones** - transaccion:create IPC
✅ **Cálculos Automáticos** - Sumas correctas
✅ **Cierre de Turno** - turno:close IPC
✅ **Validaciones** - 3 niveles (parámetros, usuario, acceso)
✅ **Respuestas Estructuradas** - `{ success, data?, error? }`
✅ **Error Handling** - Mensajes claros
✅ **Supervisor Access** - Ver turno cerrado

---

## 📈 QIÉN ES RESPONSABLE DE QUÉ

| Responsable | Tarea |
|------------|-------|
| **Backend (Node/Electron)** | Implementar handlers ✅ |
| **Frontend (React)** | Llamar IPC y mostrar datos ✅ |
| **BD (PostgreSQL)** | Guardar y recuperar datos ✅ |
| **Validaciones** | 3 niveles implementados ✅ |
| **Documentación** | 6 guías creadas ✅ |
| **TÚ (Tester)** | Ejecutar prueba manual 👈 |

---

## 🎯 OBJETIVO FINAL

**Verificar que el flujo completo del empleado funciona correctamente:**

```
✓ Login
✓ Crear turno
✓ Agregar transacciones
✓ Cálculos automáticos
✓ Cerrar turno
✓ Supervisor verifica
✓ Sin errores
✓ Validaciones funcionan
✓ Respuestas son correctas
```

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Cuánto tiempo toma?**
R: 15-20 minutos si todo funciona bien

**P: ¿Necesito conocimientos técnicos?**
R: No, las guías son paso a paso

**P: ¿Qué pasa si algo falla?**
R: Busca en la sección "🐛 POSIBLES PROBLEMAS"

**P: ¿Puedo saltar pasos?**
R: No recomendable, sigue paso a paso

**P: ¿Dónde reporto errores?**
R: Anota en: RESULTADO-PRUEBA-[FECHA].txt

---

## 🚀 ¡ESTÁS LISTO!

```bash
npm run dev
```

Luego abre: **GUIA-PRUEBA-EMPLEADO.md**

¡Éxito en la prueba! 🎉

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0
**Estado:** ✅ LISTO PARA PRUEBA

