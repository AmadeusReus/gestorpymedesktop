-- ============================================================================
-- RESET SIMPLE - Borrar solo datos operacionales
-- ============================================================================
-- Ejecutar ANTES de hacer la prueba manual
--
-- BORRA:
-- ✓ Transacciones
-- ✓ Turnos
-- ✓ Días Contables
--
-- MANTIENE:
-- ✓ Usuarios (empleado1, supervisor, admin, etc)
-- ✓ Negocios (Farmacia Test, etc)
-- ✓ Miembros/Roles
-- ✓ Catálogos (proveedores, tipos gasto, tipos pago)
--
-- ============================================================================

-- Borrar datos en orden de dependencias
DELETE FROM transacciones;
DELETE FROM turnos;
DELETE FROM dias_contables;

-- Resetear sequences (IDs vuelven a comenzar desde 1)
ALTER SEQUENCE transacciones_id_seq RESTART WITH 1;
ALTER SEQUENCE turnos_id_seq RESTART WITH 1;
ALTER SEQUENCE dias_contables_id_seq RESTART WITH 1;

-- ============================================================================
-- VERIFICAR QUE QUEDÓ LIMPIO
-- ============================================================================

SELECT 'DATOS BORRADOS' as status;
SELECT '' as blank;
SELECT 'Transacciones:' as tabla, COUNT(*) as cantidad FROM transacciones;
SELECT 'Turnos:' as tabla, COUNT(*) as cantidad FROM turnos;
SELECT 'Días Contables:' as tabla, COUNT(*) as cantidad FROM dias_contables;

SELECT '' as blank;
SELECT 'ESTRUCTURA BASE INTACTA' as status;
SELECT 'Usuarios:' as tabla, COUNT(*) as cantidad FROM usuarios;
SELECT 'Negocios:' as tabla, COUNT(*) as cantidad FROM negocios;
SELECT 'Miembros:' as tabla, COUNT(*) as cantidad FROM miembros;

SELECT '' as blank;
SELECT 'USUARIOS DISPONIBLES PARA PRUEBA:' as status;
SELECT
    u.username,
    u.nombre_completo,
    m.rol,
    n.nombre_negocio
FROM usuarios u
LEFT JOIN miembros m ON u.id = m.usuario_id
LEFT JOIN negocios n ON m.negocio_id = n.id
ORDER BY u.username;

-- ============================================================================
-- ✓ LISTO PARA PRUEBA
-- ============================================================================
