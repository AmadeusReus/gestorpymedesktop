# 🐛 BUG: Problemas en Fase 6 - Historial de Turnos

**ID:** BUG-003, BUG-004, BUG-005
**Prioridad:** MEDIA (UX, no afecta funcionalidad crítica)
**Estado:** 🆕 IDENTIFICADO (Sesión 5, Noviembre 2025)
**Descubierto en:** Testing Manual CU-1 (Fase 6, Nov 8 2025)
**Reproducible:** ✅ Sí

---

## 📋 Descripción General

Cuando el empleado hace clic en **"Ver mis turnos cerrados"** y selecciona un turno histórico, hay **3 problemas visuales/funcionales**:

---

## 🐛 BUG-003: Card debería ser Modal

### Descripción
La vista de detalles del turno histórico aparece como una **Card** dentro de la pantalla (scroll vertical), no como un **Modal** (overlay).

### Ubicación
`src/screens/TurnoScreen.tsx` líneas 760-805

### Problema
```tsx
// ACTUAL (Card dentro de la pantalla)
{viewMode === 'history' && selectedHistoricalTurno && (
  <div className="turno-screen__historial-detalle">
    <Card title={`📋 Turno #${selectedHistoricalTurno.numero_turno}...`}>
      {/* contenido */}
    </Card>
  </div>
)}
```

### Impacto
- Flujo de navegación confuso
- Usuario debe scrollear para ver todo
- No hay enfoque claro en el turno actual

### Solución Esperada
Reemplazar con Modal que:
- Aparece como overlay
- Se centra en pantalla
- Tiene botón "X" para cerrar
- No interfiere con contenido de fondo

---

## 🐛 BUG-004: Resumen no muestra valor POS ingresado

### Descripción
La información del turno histórico NO muestra el **"Venta Reportada POS"** ingresado originalmente.

### Ubicación
`src/screens/TurnoScreen.tsx` líneas 771-787

### Problema
En el resumen de turno, falta:
```
Venta Reportada POS: $150,000   ← FALTA
Efectivo Contado: $165,000      ← ✅ Existe
Diferencia: +$15,000            ← ✅ Existe
```

### Solución Esperada
Agregar campo en resumen:
```tsx
<p>
  <strong>Venta Reportada POS:</strong>
  ${parseFloat(selectedHistoricalTurno.venta_reportada_pos_turno || 0).toFixed(2)}
</p>
```

---

## 🐛 BUG-005: Tabla de transacciones duplicada

### Descripción
La tabla de transacciones aparece **DOS VECES**:
1. Una vez debajo del resumen del turno cerrado (Card)
2. Una segunda vez en el resumen (¿?)

### Ubicación
`src/screens/TurnoScreen.tsx` líneas 790-802

### Síntoma
Usuario ve:
```
═══════════════════════════════════════
Turno #1 - CERRADO
═══════════════════════════════════════
Fecha: 8 de nov
Estado: CERRADO
Venta Reportada POS: $150,000
Efectivo Contado: $165,000
Diferencia: +$15,000

Transacciones registradas: (3)
┌─────────────────────────────────┐
│ Tabla con 3 transacciones       │
└─────────────────────────────────┘

Transacciones registradas: (3)  ← DUPLICADA!
┌─────────────────────────────────┐
│ Tabla con 3 transacciones       │
└─────────────────────────────────┘
```

### Causa Probable
- El hook `transacciones` está mostrando las **transacciones del turno actual**, no del turno histórico seleccionado
- Necesita cargar transacciones del turno histórico

### Solución Esperada
Cuando se selecciona un turno histórico:
1. Cargar transacciones de **ese turno específico**
2. No mostrar transacciones del turno actual
3. Mostrar tabla una sola vez con transacciones correctas

---

## 📊 Resumen de Cambios Necesarios

| Bug | Tipo | Dificultad | Tiempo |
|-----|------|-----------|--------|
| BUG-003 | UX/Layout | Baja | 15 min |
| BUG-004 | Data Missing | Muy Baja | 5 min |
| BUG-005 | Logic | Media | 20 min |

---

## ✅ Recomendación

**Después de arreglar estos 3 bugs, hacer test de Turno #2:**

Los problemas no afectan CU-1 Fase 1-5 (100% funcional ✅), pero Fase 6 necesita estos ajustes antes de pasar a testing de Turno #2.

---

**Última actualización:** Noviembre 2025 (Sesión 5)
**Estado:** 🆕 IDENTIFICADO
**Referencia:** Testing Manual CU-1 completo
