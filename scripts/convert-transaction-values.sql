-- Script para convertir todos los valores negativos de transacciones a positivos
-- Esto es necesario después de cambiar la lógica de almacenamiento

BEGIN;

-- Convertir valores negativos a positivos
UPDATE transacciones
SET valor = ABS(valor)
WHERE valor < 0
  AND (categoria = 'GASTO_CAJA' OR categoria = 'COMPRA_PROV');

-- Verificar resultados
SELECT 
  id,
  categoria,
  valor,
  created_at
FROM transacciones
WHERE categoria IN ('GASTO_CAJA', 'COMPRA_PROV')
ORDER BY created_at DESC;

COMMIT;
