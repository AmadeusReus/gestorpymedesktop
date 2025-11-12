// electron/handlers/transaccionHandlers.ts

import { ipcMain } from 'electron';
import { query } from '../database';
import {
  validateUserAccessToNegocio,
  validatePositiveNumber,
  handleValidationError
} from './validationHelpers';

/**
 * Registra todos los manejadores IPC relacionados con Transacciones.
 */
export function registerTransaccionHandlers() {
  ipcMain.handle('transaccion:create', handleCreateTransaccion);
  ipcMain.handle('transaccion:getByTurno', handleGetTransaccionesByTurno);
  ipcMain.handle('transaccion:list', handleGetTransacciones);
  ipcMain.handle('transaccion:getByCategory', handleGetTransaccionesByCategory);
  ipcMain.handle('transaccion:update', handleUpdateTransaccion);
  ipcMain.handle('transaccion:delete', handleDeleteTransaccion);
  ipcMain.handle('transaccion:confirmAudit', handleConfirmTransaccionAudit);
  ipcMain.handle('transaccion:daySummary', handleGetDaySummary);
  console.log('   -> [Handler] Transaccion Handlers registrados.');
}

/**
 * Crear una nueva transacción
 */
async function handleCreateTransaccion(
  _event: unknown,
  args: {
    turnoId: number;
    valor: number;
    categoria: string;
    concepto?: string;
    proveedorId?: number;
    tipoGastoId?: number;
    tipoPagoDigitalId?: number;
    usuarioId?: number;
    negocioId?: number;
  }
): Promise<{ success: boolean; transaccion?: Record<string, unknown>; error?: string }> {
  try {
    const { turnoId, valor, categoria, concepto, proveedorId, tipoGastoId, tipoPagoDigitalId, usuarioId, negocioId } = args;

    // --- VALIDACIONES ---
    validatePositiveNumber(turnoId, 'ID de turno');
    validatePositiveNumber(valor, 'Valor');

    if (!categoria) {
      return { success: false, error: 'Categoría es requerida' };
    }

    // Si se proporciona usuarioId y negocioId, validar acceso
    if (usuarioId && negocioId) {
      validatePositiveNumber(usuarioId, 'ID de usuario');
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(usuarioId, negocioId);
    }

    // Guardar todos los valores como positivos
    // El frontend manejará la presentación visual (mostrar - en GASTO/COMPRA)
    // La lógica de cálculo suma todos los valores más el efectivo
    const result = await query(
      `INSERT INTO transacciones (turno_id, valor, categoria, concepto, proveedor_id, tipo_gasto_id, tipo_pago_digital_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [turnoId, valor, categoria, concepto || null, proveedorId || null, tipoGastoId || null, tipoPagoDigitalId || null]
    );

    if ((result.rowCount ?? 0) === 0) {
      return { success: false, error: 'No se pudo crear la transacción' };
    }

    console.log(`✅ [TransaccionHandler] Transacción creada en turno ${turnoId}.`);
    return { success: true, transaccion: result.rows[0] as Record<string, unknown> };
  } catch (error) {
    console.error('❌ [TransaccionHandler] Error al crear transacción:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al crear transacción' };
  }
}

/**
 * Obtener transacciones de un turno específico
 */
async function handleGetTransaccionesByTurno(
  _event: unknown,
  args: { turnoId: number; usuarioId?: number; negocioId?: number } | number
): Promise<{ success: boolean; transacciones?: Record<string, unknown>[]; error?: string }> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const turnoId = typeof args === 'object' ? args.turnoId : args;
    const usuarioId = typeof args === 'object' ? args.usuarioId : undefined;
    const negocioId = typeof args === 'object' ? args.negocioId : undefined;

    // --- VALIDACIONES ---
    validatePositiveNumber(turnoId, 'ID de turno');

    // Si se proporciona usuarioId y negocioId, validar acceso
    if (usuarioId && negocioId) {
      validatePositiveNumber(usuarioId, 'ID de usuario');
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(usuarioId, negocioId);
    }

    const result = await query(
      `SELECT * FROM transacciones
       WHERE turno_id = $1
       ORDER BY created_at ASC`,
      [turnoId]
    );

    return { success: true, transacciones: (result.rows ?? []) as Record<string, unknown>[] };
  } catch (error) {
    console.error('❌ [TransaccionHandler] Error al obtener transacciones:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al obtener transacciones' };
  }
}

/**
 * Obtener todas las transacciones con paginación
 */
async function handleGetTransacciones(
  _event: unknown,
  args?: { limit?: number; offset?: number }
): Promise<Record<string, unknown>[]> {
  try {
    const limit = args?.limit ?? 50;
    const offset = args?.offset ?? 0;

    const result = await query(
      `SELECT * FROM transacciones
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return (result.rows ?? []) as Record<string, unknown>[];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al obtener transacciones';
    throw new Error(errorMessage);
  }
}

/**
 * Obtener transacciones por categoría
 */
async function handleGetTransaccionesByCategory(
  _event: unknown,
  args: { categoria: string; limit?: number; offset?: number }
): Promise<Record<string, unknown>[]> {
  try {
    const { categoria, limit = 50, offset = 0 } = args;

    if (!categoria) {
      throw new Error('Categoría es requerida');
    }

    const result = await query(
      `SELECT * FROM transacciones
       WHERE categoria = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [categoria, limit, offset]
    );

    return (result.rows ?? []) as Record<string, unknown>[];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al obtener transacciones por categoría';
    throw new Error(errorMessage);
  }
}

/**
 * Actualizar una transacción
 */
async function handleUpdateTransaccion(
  _event: unknown,
  args: { transaccionId: number; valor: number; categoria: string; concepto?: string }
): Promise<Record<string, unknown>> {
  try {
    const { transaccionId, valor, categoria, concepto } = args;

    if (!transaccionId || !valor || !categoria) {
      throw new Error('ID de transacción, valor y categoría son requeridos');
    }

    if (valor <= 0) {
      throw new Error('El valor debe ser mayor a 0');
    }

    const result = await query(
      `UPDATE transacciones
       SET valor = $1, categoria = $2, concepto = $3
       WHERE id = $4
       RETURNING *`,
      [valor, categoria, concepto || null, transaccionId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('Transacción no encontrada');
    }

    return result.rows[0] as Record<string, unknown>;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al actualizar transacción';
    throw new Error(errorMessage);
  }
}

/**
 * Eliminar una transacción
 */
async function handleDeleteTransaccion(
  _event: unknown,
  args: { transaccionId: number; usuarioId?: number; negocioId?: number } | number
): Promise<{ success: boolean; deletedId?: number; error?: string }> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const transaccionId = typeof args === 'object' ? args.transaccionId : args;
    const usuarioId = typeof args === 'object' ? args.usuarioId : undefined;
    const negocioId = typeof args === 'object' ? args.negocioId : undefined;

    // --- VALIDACIONES ---
    validatePositiveNumber(transaccionId, 'ID de transacción');

    // Si se proporciona usuarioId y negocioId, validar acceso
    if (usuarioId && negocioId) {
      validatePositiveNumber(usuarioId, 'ID de usuario');
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(usuarioId, negocioId);
    }

    const result = await query(
      `DELETE FROM transacciones
       WHERE id = $1
       RETURNING *`,
      [transaccionId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return { success: false, error: 'Transacción no encontrada' };
    }

    console.log(`✅ [TransaccionHandler] Transacción ${transaccionId} eliminada.`);
    return { success: true, deletedId: transaccionId };
  } catch (error) {
    console.error('❌ [TransaccionHandler] Error al eliminar transacción:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al eliminar transacción' };
  }
}

/**
 * Confirmar transacción para auditoría
 */
async function handleConfirmTransaccionAudit(
  _event: unknown,
  args: { transaccionId: number; auditorId: number; negocioId?: number }
): Promise<{ success: boolean; transaccion?: Record<string, unknown>; error?: string }> {
  try {
    const { transaccionId, auditorId, negocioId } = args;

    // --- VALIDACIONES ---
    validatePositiveNumber(transaccionId, 'ID de transacción');
    validatePositiveNumber(auditorId, 'ID de auditor');

    // Si se proporciona negocioId, validar que auditor tiene acceso
    if (negocioId) {
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(auditorId, negocioId);
    }

    const result = await query(
      `UPDATE transacciones
       SET confirmado_auditoria = TRUE, auditor_id = $1
       WHERE id = $2
       RETURNING *`,
      [auditorId, transaccionId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return { success: false, error: 'Transacción no encontrada' };
    }

    console.log(`✅ [TransaccionHandler] Transacción ${transaccionId} auditada.`);
    return { success: true, transaccion: result.rows[0] as Record<string, unknown> };
  } catch (error) {
    console.error('❌ [TransaccionHandler] Error al confirmar auditoría:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al confirmar auditoría' };
  }
}

/**
 * Obtener resumen de transacciones de un día
 */
async function handleGetDaySummary(
  _event: unknown,
  args: { diaContableId: number; usuarioId?: number; negocioId?: number } | number
): Promise<{ success: boolean; summary?: Record<string, unknown>; error?: string }> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const diaContableId = typeof args === 'object' ? args.diaContableId : args;
    const usuarioId = typeof args === 'object' ? args.usuarioId : undefined;
    const negocioId = typeof args === 'object' ? args.negocioId : undefined;

    // --- VALIDACIONES ---
    validatePositiveNumber(diaContableId, 'ID de día contable');

    // Si se proporciona usuarioId y negocioId, validar acceso
    if (usuarioId && negocioId) {
      validatePositiveNumber(usuarioId, 'ID de usuario');
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(usuarioId, negocioId);
    }

    // Obtener todas las transacciones del día
    const txnResult = await query(
      `SELECT * FROM transacciones
       WHERE turno_id IN (
         SELECT id FROM turnos WHERE dia_contable_id = $1
       )`,
      [diaContableId]
    );

    const transacciones = (txnResult.rows ?? []) as Record<string, unknown>[];

    // Calcular totales
    const total = transacciones.reduce((sum: number, t: Record<string, unknown>) => {
      const valor = typeof t.valor === 'number' ? t.valor : 0;
      return sum + valor;
    }, 0);

    const confirmadas = transacciones.filter((t: Record<string, unknown>) => t.confirmado_auditoria === true).length;
    const pendientes = transacciones.length - confirmadas;

    const montoConfirmado = transacciones
      .filter((t: Record<string, unknown>) => t.confirmado_auditoria === true)
      .reduce((sum: number, t: Record<string, unknown>) => {
        const valor = typeof t.valor === 'number' ? t.valor : 0;
        return sum + valor;
      }, 0);

    const summary = {
      total: transacciones.length,
      confirmadas,
      pendientes,
      montoTotal: total,
      montoConfirmado,
      montoPendiente: total - montoConfirmado,
      transacciones,
    };

    return { success: true, summary };
  } catch (error) {
    console.error('❌ [TransaccionHandler] Error al obtener resumen del día:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al obtener resumen del día' };
  }
}
