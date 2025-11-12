-- ============================================================================
-- RESET DATOS PRUEBA - Limpia datos operacionales, mantiene estructura base
-- ============================================================================
-- Este script borra:
--   ✓ Transacciones
--   ✓ Turnos
--   ✓ Días Contables
--
-- Mantiene:
--   ✓ Negocios
--   ✓ Usuarios
--   ✓ Miembros (relaciones usuario-negocio-rol)
--   ✓ Proveedores
--   ✓ Tipos de Gasto
--   ✓ Tipos de Pago Digital
--
-- ============================================================================

-- 1. Limpiar Transacciones
-- (Debe ser primero porque Turnos tiene FK a esta tabla)
DELETE FROM transacciones;
ALTER SEQUENCE transacciones_id_seq RESTART WITH 1;
TRUNCATE TABLE transacciones RESTART IDENTITY CASCADE;

-- 2. Limpiar Turnos
-- (Debe ser segundo porque Días Contables tiene FK a esta tabla)
DELETE FROM turnos;
ALTER SEQUENCE turnos_id_seq RESTART WITH 1;
TRUNCATE TABLE turnos RESTART IDENTITY CASCADE;

-- 3. Limpiar Días Contables
DELETE FROM dias_contables;
ALTER SEQUENCE dias_contables_id_seq RESTART WITH 1;
TRUNCATE TABLE dias_contables RESTART IDENTITY CASCADE;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Mostrar que las tablas están vacías
SELECT 'transacciones' as tabla, COUNT(*) as registros FROM transacciones
UNION ALL
SELECT 'turnos', COUNT(*) FROM turnos
UNION ALL
SELECT 'dias_contables', COUNT(*) FROM dias_contables
ORDER BY tabla;

-- ============================================================================
-- ESTRUCTURAS BASE INTACTAS (para verificar)
-- ============================================================================
-- Usuarios disponibles:
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
-- Negocios disponibles:
SELECT 'negocios', COUNT(*) FROM negocios
UNION ALL
-- Miembros (usuario-negocio-rol):
SELECT 'miembros', COUNT(*) FROM miembros
UNION ALL
-- Proveedores:
SELECT 'proveedores', COUNT(*) FROM proveedores
UNION ALL
-- Tipos de Gasto:
SELECT 'tipos_gasto', COUNT(*) FROM tipos_gasto
UNION ALL
-- Tipos de Pago Digital:
SELECT 'tipos_pago_digital', COUNT(*) FROM tipos_pago_digital
ORDER BY tabla;

-- ============================================================================
-- RESUMEN: USUARIOS Y NEGOCIOS DISPONIBLES PARA PRUEBA
-- ============================================================================
SELECT
    u.id,
    u.username,
    u.nombre_completo,
    u.activo,
    m.rol,
    n.nombre_negocio
FROM usuarios u
LEFT JOIN miembros m ON u.id = m.usuario_id
LEFT JOIN negocios n ON m.negocio_id = n.id
ORDER BY u.id, n.id;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- ✓ Datos operacionales borrados
-- ✓ Estructura base intacta
-- ✓ Listo para nueva prueba
-- ============================================================================

