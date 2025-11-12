# 📚 Documentation - GestorPyME Desktop

**Complete documentation organized by features and topics**

---

## 🎯 WHERE TO START?

### 👤 I'm new to the project
→ Read: **01-guias-rapidas/QUICK-START.md** (5 minutes)

### 🧪 I want to do manual employee testing
→ Read: **07b-pruebas-manuales/README.md**
- Choose between: quick (5 min) or complete (20 min)
- Includes validations and troubleshooting

### 🔍 I want to understand the project
→ Read: **02-referencia/STATUS.md** (10 min)
→ Then: **02-referencia/MAPA-CODEBASE.md**

### 🛠️ I'm developing
→ Read: **10-arquitectura/** for design understanding
→ Read: **04-turno/** if working on shift feature

---

## 📁 FOLDER STRUCTURE

### 01-guias-rapidas/ 🚀
**Start here - Guides for newcomers**
- QUICK-START.md - Get started in 5 minutes

### 02-referencia/ 📖
**Quick reference and current state**
- MAPA-CODEBASE.md - Where everything is located
- STATUS.md - What's done vs. pending
- FILES-OVERVIEW.md - Description of created files
- RESUMEN-VISUAL.md - Visual diagrams

### 03-autenticacion/ 🔐
**Feature: Authentication and login**
- FLUJO-AUTENTICACION.md - How login works

### 04-turno/ 💼
**Feature: Create/Close shifts**
- REGLAS-DE-NEGOCIO-TURNO.md - Business logic
- IMPLEMENTACION-TURNO-SCREEN.md - Implementation details
- FIXES-TURNOSCREEN.md - Issues and solutions

### 05-transacciones/ 💰
**Feature: Transactions (payments, expenses, etc)**
- (Feature-specific documentation)

### 06-auditoria/ 📋
**Feature: Audit and day closing**
- (Feature-specific documentation)

### 07-testing-automatizado/ 🤖
**Automated Testing (Unit, E2E)**
- TEST-GUIDE.md - Quick testing guide
- TESTING.md - Complete testing guide

### 07b-pruebas-manuales/ 🧪
**Manual step-by-step testing**
- README.md - Index with 3 options
- INICIO-RAPIDO-PRUEBA.md - 5 minutes (quick)
- GUIA-PRUEBA-EMPLEADO.md - 20 minutes (complete)
- PRE-REQUISITOS-PRUEBA.md - Setup verification
- COMANDOS-UTILES-PRUEBA.md - Command reference

### 08-base-datos/ 💾
**Database and SQL**
- DB-SETUP.md - PostgreSQL setup
- RESET-BD-ANTES-PRUEBA.md - Clean data for testing

### 09-cambios-implementados/ 📝
**Changelog and implementations**
- CAMBIOS-REALIZADOS.md - Option A completed
- CAMBIOS-OPCION-B.md - Option B (Validations)
- PLAN-VALIDACIONES.md - Detailed validation plan
- ERRORES-CORREGIDOS.md - Bugs and solutions

### 10-arquitectura/ 🏗️
**Architecture and technical design**
- ARQUITECTURA-FRONTEND.md - Patterns and flows
- FRONTEND-COMPONENTS.md - Component reference
- FRONTEND-SETUP-SUMMARY.md - Frontend setup

### 11-scripts-desarrollo/ 🛠️
**Scripts and development tools**
- SCRIPTS.md - Reference of all scripts

### 12-estado-proyecto/ 📊
**Project status and planning**
- PLAN-DESARROLLO.md - Development plan
- PROXIMO-TRABAJO.md - What's left to do

---

## 🔍 QUICK LOOKUP

| I need... | Folder | File |
|-----------|--------|------|
| Get started now | 01 | QUICK-START.md |
| Do manual testing | 07b | GUIA-PRUEBA-EMPLEADO.md |
| Project status | 02 | STATUS.md |
| Code structure | 02 | MAPA-CODEBASE.md |
| Shift feature | 04 | README.md |
| Transactions feature | 05 | README.md |
| Architecture | 10 | ARQUITECTURA-FRONTEND.md |
| Components | 10 | FRONTEND-COMPONENTS.md |
| Tests | 07 | TEST-GUIDE.md |
| Database | 08 | DB-SETUP.md |
| Recent changes | 09 | CAMBIOS-OPCION-B.md |
| Scripts | 11 | SCRIPTS.md |
| Next work | 12 | PROXIMO-TRABAJO.md |
| **Current bugs** | **03** | **BUG-SESION7-PRUEBAS.md** |

---

## 📊 STATISTICS

```
Folders:         13
Documents:       25+
Checklist items: 150+
Examples:        100+

Organization:    ✅ By features/use cases
Ease of use:     ✅ Easy to find everything
Scalability:     ✅ Ready to grow
```

---

## 🎯 TYPICAL WORKFLOWS

### Workflow 1: New Developer (30 minutes)
```
1. QUICK-START.md                    (5 min)
2. STATUS.md                         (10 min)
3. MAPA-CODEBASE.md                  (10 min)
4. npm run dev                        (5 min)
```

### Workflow 2: Do Manual Testing (20 minutes)
```
1. 07b-pruebas-manuales/README.md    (1 min)
2. 08-base-datos/RESET-BD...         (2 min)
3. npm run dev                        (1 min)
4. Follow GUIA-PRUEBA-EMPLEADO.md   (15 min)
```

### Workflow 3: Work on Feature (variable)
```
1. 02-referencia/MAPA-CODEBASE.md   (find files)
2. 04-turno/ (or 05, 06)            (read spec)
3. 10-arquitectura/                 (understand patterns)
4. Develop
5. 07b-pruebas-manuales/            (test)
```

---

## 💡 TIPS

1. **Start with your feature folder** (04, 05, 06)
   - Everything related is in one place

2. **Use the quick lookup above** if unsure where to search

3. **Each folder has its own README** with local index

4. **The numbers (01, 02, 03...) are the recommended order**
   - But you can skip if you already know something

5. **07b before 07** for testing
   - Manual tests first, then automated

---

## 🔄 MAINTENANCE

To keep this documentation up to date:

1. **New folder = New feature?**
   - Create folder in docs/
   - Add sequential number

2. **New document?**
   - Put it in the corresponding folder
   - Update that folder's README

3. **Code changes?**
   - Document in 09-cambios-implementados/

4. **Bug found?**
   - Document in 09-cambios-implementados/ERRORES-CORREGIDOS.md

---

## 📞 QUICK REFERENCES

```
Main documentation:     docs/README-MASTER.md (this file)
Manual testing:         docs/07b-pruebas-manuales/README.md
Project structure:      docs/02-referencia/MAPA-CODEBASE.md
Current status:         docs/02-referencia/STATUS.md
Last update:            November 2025
```

---

**What do you need? Look above and find the folder.**
