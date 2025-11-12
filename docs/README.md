# 📚 Documentación de GestorPyME

Documentación completa sobre setup, testing y desarrollo.

## 🚀 Comenzar

**Nuevo en el proyecto?**
→ Lee: `QUICK-START.md` (5 minutos)

## 📖 Documentación por Tema

### 🚀 Para Empezar
- **`QUICK-START.md`** - Guía rápida de 3 pasos (COMIENZA AQUÍ)
- **`ESTADO-ACTUAL.md`** ⭐ - Estado completo del proyecto, qué falta
- **`MAPA-CODEBASE.md`** ⭐ - Referencia de estructura de código

### 🏗️ Arquitectura y Diseño
- **`ARQUITECTURA-FRONTEND.md`** - Patrones, componentes, flujos de datos
- **`FRONTEND-COMPONENTS.md`** - Referencia de todos los componentes
- **`REGLAS-DE-NEGOCIO-TURNO.md`** - Lógica de roles y permisos

### 💾 Base de Datos
- **`DB-SETUP.md`** - Configurar PostgreSQL y BD

### 🧪 Testing y Pruebas
- **`pruebas-manuales/README.md`** ⭐ - **ÍNDICE DE PRUEBAS MANUALES** (COMIENZA AQUÍ para probar)
  - `pruebas-manuales/INICIO-RAPIDO-PRUEBA.md` - Resumen rápido (5 min)
  - `pruebas-manuales/GUIA-PRUEBA-EMPLEADO.md` - Guía paso a paso (15-20 min)
  - `pruebas-manuales/PRE-REQUISITOS-PRUEBA.md` - Verificación de setup
  - `pruebas-manuales/COMANDOS-UTILES-PRUEBA.md` - Comandos para debugging
- **`TEST-GUIDE.md`** - Cómo ejecutar pruebas
- **`TESTING.md`** - Guía completa de testing
- **`SCRIPTS.md`** - Referencia de todos los scripts

### 📝 Cambios Recientes
- **`CAMBIOS-REALIZADOS.md`** - OPCIÓN A: 3 handlers críticos implementados (negocio, dia-contable)
- **`CAMBIOS-OPCION-B.md`** - OPCIÓN B: Validaciones robustas en todos los handlers
- **`PLAN-VALIDACIONES.md`** - Plan de validaciones (3 niveles implementados)

### 📝 Referencia
- **`FILES-OVERVIEW.md`** - Descripción de archivos creados
- **`IMPLEMENTACION-TURNO-SCREEN.md`** - Detalles de implementación específica
- **`ERRORES-CORREGIDOS.md`** - Historial de bugs y soluciones

## 🎯 Flujos Comunes

### "Quiero empezar rápido"
1. Lee: `QUICK-START.md` (5 min)
2. Ejecuta: `node scripts/setup-wizard.mjs`
3. Ejecuta: `npm run dev`

### "Quiero entender qué está hecho y qué falta"
→ Lee: `ESTADO-ACTUAL.md` (10 min) → Sección "Completado vs Pendiente"

### "Quiero navegar el código"
→ Lee: `MAPA-CODEBASE.md` → Usa las referencias para encontrar archivos

### "Quiero entender la arquitectura"
→ Lee: `ARQUITECTURA-FRONTEND.md` → Entiende patrones y flujos

### "Tengo error en PostgreSQL"
→ Lee: `DB-SETUP.md` → Sección Troubleshooting

### "¿Qué script debo ejecutar?"
→ Lee: `SCRIPTS.md` → Tabla "Cuándo usar cada script"

### "Quiero ver todos los componentes disponibles"
→ Lee: `FRONTEND-COMPONENTS.md` → Tabla de componentes con ejemplos

### "Quiero entender los roles y permisos"
→ Lee: `REGLAS-DE-NEGOCIO-TURNO.md` → Sección "Tabla de Decisión"

### "Quiero correr tests"
→ Lee: `TEST-GUIDE.md` → Sección "Flujo de Pruebas"

### "Quiero hacer prueba manual del empleado" ⭐ (NUEVO)
→ Lee: `pruebas-manuales/README.md` → Elige ruta (rápida o completa)

## 📊 Índice Rápido

| Necesito... | Lee... | Tiempo |
|------------|--------|--------|
| Empezar ahora | QUICK-START.md | 5 min |
| Entender estado | ESTADO-ACTUAL.md | 10 min |
| Navegar código | MAPA-CODEBASE.md | 15 min |
| Aprender arquitectura | ARQUITECTURA-FRONTEND.md | 20 min |
| Ver componentes | FRONTEND-COMPONENTS.md | 10 min |
| Entender reglas | REGLAS-DE-NEGOCIO-TURNO.md | 15 min |
| Referencia scripts | SCRIPTS.md | 10 min |
| Ayuda con BD | DB-SETUP.md | 10 min |
| Tests | TEST-GUIDE.md | 10 min |
| **Prueba Manual** 🆕 | **pruebas-manuales/README.md** | **5-20 min** |

## 🔍 Buscar en la Documentación

- **Setup:** QUICK-START.md, DB-SETUP.md
- **Scripts:** SCRIPTS.md
- **Testing:** TEST-GUIDE.md, TESTING.md
- **Troubleshooting:** DB-SETUP.md, SCRIPTS.md
- **Referencia:** FILES-OVERVIEW.md

## 📈 Estado del Proyecto

```
Frontend:      [███████░░░░░] 60-85% (Pantallas completas)
Backend:       [█████░░░░░░░░] 45% (Handlers básicos)
Testing:       [█████░░░░░░░░] 50% (Unit + E2E setup)
Documentación: [███████████░] 100% (Completa)
────────────────────────────────
TOTAL:         [███████░░░░░░░] 60%
```

Ver `ESTADO-ACTUAL.md` para detalles completos.

---

**Última actualización:** Noviembre 2025
**Documentación:** Completa y actualizada ✅
