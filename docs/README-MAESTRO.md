# 📚 DOCUMENTACIÓN - GestorPyME Desktop

**Documentación organizada por features/casos de uso**

---

## 🎯 ¿POR DÓNDE EMPIEZO?

### 👤 Soy nuevo en el proyecto
→ Lee: **01-guias-rapidas/QUICK-START.md** (5 minutos)

### 🧪 Quiero hacer prueba manual del empleado
→ Lee: **07b-pruebas-manuales/README.md**
- Elige entre: rápida (5 min) o completa (20 min)
- Incluye validaciones y troubleshooting

### 🔍 Quiero entender el proyecto
→ Lee: **02-referencia/ESTADO-ACTUAL.md** (10 min)
→ Luego: **02-referencia/MAPA-CODEBASE.md**

### 🛠️ Estoy desarrollando
→ Lee: **10-arquitectura/** para entender diseño
→ Lee: **04-turno/** si trabajas en feature de turno

---

## 📁 ESTRUCTURA DE CARPETAS

### 01-guias-rapidas/ 🚀
**Empezar aquí - Guías para nuevos**
- QUICK-START.md - Comenzar en 5 minutos

### 02-referencia/ 📖
**Referencia rápida y actualizada**
- MAPA-CODEBASE.md - Dónde está cada cosa
- ESTADO-ACTUAL.md - Qué está hecho vs. pendiente
- FILES-OVERVIEW.md - Descripción de archivos
- RESUMEN-VISUAL.md - Diagramas visuales

### 03-autenticacion/ 🔐
**Feature: Autenticación y login**
- FLUJO-AUTENTICACION.md - Cómo funciona login

### 04-turno/ 💼
**Feature: Crear/Cerrar turno**
- REGLAS-DE-NEGOCIO-TURNO.md - Lógica de negocio
- IMPLEMENTACION-TURNO-SCREEN.md - Cómo está implementado
- FIXES-TURNOSCREEN.md - Issues y soluciones

### 05-transacciones/ 💰
**Feature: Transacciones (pagos, gastos, etc)**
- (Documentación específica)

### 06-auditoria/ 📋
**Feature: Auditoría y cierre de día**
- (Documentación específica)

### 07-testing-automatizado/ 🤖
**Testing automático (Unit, E2E)**
- TEST-GUIDE.md - Guía rápida de tests
- TESTING.md - Guía completa de testing

### 07b-pruebas-manuales/ 🧪
**Testing manual paso a paso**
- README.md - Índice con 3 opciones
- INICIO-RAPIDO-PRUEBA.md - 5 minutos (rápido)
- GUIA-PRUEBA-EMPLEADO.md - 20 minutos (completo)
- PRE-REQUISITOS-PRUEBA.md - Verificación de setup
- COMANDOS-UTILES-PRUEBA.md - Referencia de comandos

### 08-base-datos/ 💾
**Base de datos y SQL**
- DB-SETUP.md - Setup de PostgreSQL
- RESET-BD-ANTES-PRUEBA.md - Limpiar datos para prueba

### 09-cambios-implementados/ 📝
**Historial de cambios e implementaciones**
- CAMBIOS-REALIZADOS.md - OPCIÓN A completada
- CAMBIOS-OPCION-B.md - OPCIÓN B (Validaciones)
- PLAN-VALIDACIONES.md - Plan detallado de validaciones
- ERRORES-CORREGIDOS.md - Bugs y soluciones

### 10-arquitectura/ 🏗️
**Arquitectura y diseño técnico**
- ARQUITECTURA-FRONTEND.md - Patrones y flujos
- FRONTEND-COMPONENTS.md - Referencia de componentes
- FRONTEND-SETUP-SUMMARY.md - Setup del frontend

### 11-scripts-desarrollo/ 🛠️
**Scripts y herramientas de desarrollo**
- SCRIPTS.md - Referencia de todos los scripts

### 12-estado-proyecto/ 📊
**Estado actual y planning**
- PLAN-DESARROLLO.md - Plan general
- PROXIMO-TRABAJO.md - Qué falta por hacer

---

## 🔍 BÚSQUEDA RÁPIDA

| Necesito... | Carpeta | Archivo |
|------------|---------|---------|
| Empezar ahora | 01 | QUICK-START.md |
| Hacer prueba | 07b | GUIA-PRUEBA-EMPLEADO.md |
| Estado proyecto | 02 | ESTADO-ACTUAL.md |
| Estructura código | 02 | MAPA-CODEBASE.md |
| Feature Turno | 04 | README.md |
| Feature Transacciones | 05 | README.md |
| Arquitectura | 10 | ARQUITECTURA-FRONTEND.md |
| Componentes | 10 | FRONTEND-COMPONENTS.md |
| Tests | 07 | TEST-GUIDE.md |
| Base de datos | 08 | DB-SETUP.md |
| Cambios recientes | 09 | CAMBIOS-OPCION-B.md |
| Scripts | 11 | SCRIPTS.md |
| Próximo trabajo | 12 | PROXIMO-TRABAJO.md |
| **Bugs actuales** | **03** | **BUG-SESION6-PRUEBAS.md** |

---

## 📊 ESTADÍSTICAS

```
Carpetas:        13
Documentos:      25+
Checklist items: 150+
Ejemplos:        100+

Organización:    ✅ Por features/casos de uso
Facilidad:       ✅ Fácil encontrar todo
Escalabilidad:   ✅ Lista para crecer
```

---

## 🎯 FLUJOS TÍPICOS

### Flujo 1: Desarrollador Nuevo (30 minutos)
```
1. QUICK-START.md                    (5 min)
2. ESTADO-ACTUAL.md                  (10 min)
3. MAPA-CODEBASE.md                  (10 min)
4. npm run dev                        (5 min)
```

### Flujo 2: Hacer Prueba Manual (20 minutos)
```
1. 07b-pruebas-manuales/README.md    (1 min)
2. 08-base-datos/RESET-BD...         (2 min)
3. npm run dev                        (1 min)
4. Sigue GUIA-PRUEBA-EMPLEADO.md    (15 min)
```

### Flujo 3: Trabajo en Feature (variable)
```
1. 02-referencia/MAPA-CODEBASE.md   (encontrar archivos)
2. 04-turno/ (o 05, 06)             (leer spec)
3. 10-arquitectura/                 (entender patrones)
4. Desarrollar
5. 07b-pruebas-manuales/            (probar)
```

---

## 💡 TIPS

1. **Empieza por la carpeta de tu feature** (04, 05, 06)
   - Todo lo relacionado está en un lugar

2. **Usa la búsqueda rápida arriba** si no sabes dónde buscar

3. **Cada carpeta tiene su README** con índice local

4. **Los números (01, 02, 03...) son el orden recomendado**
   - Pero puedes saltar si ya sabes algo

5. **07b antes de 07** para testing
   - Pruebas manuales primero, luego automatizadas

---

## 🔄 MANTENIMIENTO

Para mantener esta documentación:

1. **Nueva carpeta = Nueva feature?**
   - Crea carpeta en docs/
   - Agrega número secuencial

2. **Nuevo documento?**
   - Ponlo en la carpeta correspondiente
   - Actualiza README de esa carpeta

3. **Cambios en código?**
   - Documenta en 09-cambios-implementados/

4. **Bug encontrado?**
   - Documenta en 09-cambios-implementados/ERRORES-CORREGIDOS.md

---

## 📞 REFERENCIAS RÁPIDAS

```
Documentación principal:     docs/README-MAESTRO.md (este archivo)
Prueba manual:              docs/07b-pruebas-manuales/README.md
Estructura proyecto:        docs/02-referencia/MAPA-CODEBASE.md
Estado actual:              docs/02-referencia/ESTADO-ACTUAL.md
Última actualización:       Noviembre 2025
```

---

**¿Qué necesitas? Busca arriba y encuentra la carpeta.**

