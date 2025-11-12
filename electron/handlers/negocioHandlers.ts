// electron/handlers/negocioHandlers.ts

import { ipcMain } from 'electron';
import { query } from '../database';

/**
 * Registra todos los manejadores IPC relacionados con Negocios.
 */
export function registerNegocioHandlers() {
  ipcMain.handle('negocio:getByUser', handleGetNegociosByUser);
  console.log('   -> [Handler] Negocio Handlers registrados.');
}

/**
 * Obtiene todos los negocios a los que pertenece un usuario.
 * Usado por AdminNegocioSelector para mostrar opciones al admin.
 */
async function handleGetNegociosByUser(
  _event: unknown,
  args: { userId: number }
): Promise<{
  success: boolean;
  negocios?: Array<{
    id: number;
    nombre_negocio: string;
    rol: string;
  }>;
  error?: string;
}> {
  const { userId } = args;

  try {
    // Validar que se pasó el userId
    if (!userId || userId <= 0) {
      return { success: false, error: 'ID de usuario inválido' };
    }

    // SQL: Obtener negocios del usuario a través de la tabla miembros
    const result = await query(
      `SELECT
        n.id,
        n.nombre_negocio,
        m.rol
      FROM miembros m
      JOIN negocios n ON m.negocio_id = n.id
      WHERE m.usuario_id = $1
      ORDER BY n.nombre_negocio ASC`,
      [userId]
    );

    // Si no tiene negocios asignados
    if ((result.rowCount ?? 0) === 0) {
      console.warn(`[NegocioHandler] Usuario ${userId} no tiene negocios asignados`);
      return { success: true, negocios: [] };
    }

    // Retornar negocios con su rol en cada uno
    const negocios = result.rows.map((row: any) => ({
      id: row.id,
      nombre_negocio: row.nombre_negocio,
      rol: row.rol
    }));

    console.log(
      `[NegocioHandler] Usuario ${userId} tiene ${negocios.length} negocio(s)`
    );

    return { success: true, negocios };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[NegocioHandler] Error: ${errorMsg}`);
    return { success: false, error: `Error al obtener negocios: ${errorMsg}` };
  }
}
