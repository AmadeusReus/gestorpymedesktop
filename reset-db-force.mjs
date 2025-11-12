import { Client } from 'pg';
import fs from 'fs';

async function resetDatabase() {
  const client = new Client({
    user: 'postgres',
    password: '123456789',
    host: 'localhost',
    port: 5432,
    database: 'gestorpyme',
  });

  try {
    await client.connect();
    console.log('✓ Conectado a PostgreSQL');

    // Borrar datos directamente (en orden de dependencias)
    console.log('Borrando datos...');
    await client.query('DELETE FROM transacciones');
    await client.query('DELETE FROM turnos');
    await client.query('DELETE FROM dias_contables');

    // Resetear sequences
    console.log('Reseteando sequences...');
    await client.query('ALTER SEQUENCE transacciones_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE turnos_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE dias_contables_id_seq RESTART WITH 1');

    console.log('✓ Base de datos limpiada exitosamente');

    // Verificar estado
    const result = await client.query(`
      SELECT 'Transacciones' as tabla, COUNT(*) as cantidad FROM transacciones
      UNION ALL
      SELECT 'Turnos', COUNT(*) FROM turnos
      UNION ALL
      SELECT 'Días Contables', COUNT(*) FROM dias_contables
      UNION ALL
      SELECT 'Usuarios', COUNT(*) FROM usuarios
      UNION ALL
      SELECT 'Negocios', COUNT(*) FROM negocios
      UNION ALL
      SELECT 'Miembros', COUNT(*) FROM miembros
    `);

    console.log('\n📊 ESTADO DE LA BASE DE DATOS:');
    console.log('─'.repeat(40));
    result.rows.forEach(row => {
      const name = String(row.tabla);
      const count = String(row.cantidad);
      console.log(name.padEnd(20) + ': ' + count);
    });
    console.log('─'.repeat(40));
    console.log('\n✅ LISTO PARA NUEVAS PRUEBAS');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
