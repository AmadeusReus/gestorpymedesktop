/**
 * Script para convertir valores negativos de transacciones a positivos
 * Ejecutar con: node scripts/convert-transaction-values.js
 */

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456789',
  database: 'gestorpyme'
});

async function convertValues() {
  try {
    console.log('🔄 Iniciando conversión de valores...\n');

    // Mostrar valores negativos antes de la conversión
    console.log('📊 Valores ANTES de la conversión:');
    const beforeResult = await pool.query(`
      SELECT
        id,
        categoria,
        valor,
        created_at
      FROM transacciones
      WHERE categoria IN ('GASTO_CAJA', 'COMPRA_PROV')
      ORDER BY created_at DESC;
    `);

    console.table(beforeResult.rows);
    console.log(`\nTotal de transacciones encontradas: ${beforeResult.rows.length}\n`);

    if (beforeResult.rows.length === 0) {
      console.log('✅ No hay transacciones con valores negativos. Nada que convertir.');
      await pool.end();
      return;
    }

    // Ejecutar la conversión
    console.log('🔄 Convirtiendo valores negativos a positivos...\n');
    const updateResult = await pool.query(`
      UPDATE transacciones
      SET valor = ABS(valor)
      WHERE valor < 0
        AND (categoria = 'GASTO_CAJA' OR categoria = 'COMPRA_PROV')
      RETURNING id, categoria, valor;
    `);

    console.log(`✅ ${updateResult.rowCount} transacciones actualizadas:\n`);
    console.table(updateResult.rows);

    // Mostrar valores después de la conversión
    console.log('\n📊 Valores DESPUÉS de la conversión:');
    const afterResult = await pool.query(`
      SELECT
        id,
        categoria,
        valor,
        created_at
      FROM transacciones
      WHERE categoria IN ('GASTO_CAJA', 'COMPRA_PROV')
      ORDER BY created_at DESC;
    `);

    console.table(afterResult.rows);

    console.log('\n✅ Conversión completada exitosamente!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error durante la conversión:', error);
    await pool.end();
    process.exit(1);
  }
}

convertValues();
