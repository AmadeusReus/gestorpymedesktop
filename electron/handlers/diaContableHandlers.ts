// electron/handlers/diaContableHandlers.ts

import { ipcMain } from 'electron';
import { query } from '../database';

/**
 * Registra todos los manejadores IPC relacionados con Días Contables.
 */
export function registerDiaContableHandlers() {
  ipcMain.handle('dia-contable:getCurrent', handleGetCurrentDiaContable);
  ipcMain.handle('dia-contable:review', handleReviewDiaContable);
  console.log('   -> [Handler] Día Contable Handlers registrados.');
}

/**
 * Obtiene el día contable actual del negocio especificado.
 * Incluye todos los turnos y sus estadísticas del día.
 * Usado por RevisionScreen para mostrar el resumen del día.
 */
async function handleGetCurrentDiaContable(
  _event: unknown,
  args: { negocioId: number }
): Promise<{
  success: boolean;
  diaContable?: any;
  error?: string;
}> {
  const { negocioId } = args;

  try {
    // Validar que se pasó el negocioId
    if (!negocioId || negocioId <= 0) {
      return { success: false, error: 'ID de negocio inválido' };
    }

    // Obtener la fecha de hoy
    const today = new Date().toISOString().split('T')[0];

    // 1. Buscar el día contable actual
    const diaRes = await query(
      `SELECT id, negocio_id, fecha, estado
       FROM dias_contables
       WHERE negocio_id = $1 AND fecha = $2`,
      [negocioId, today]
    );

    // Si no existe día contable, retornar null (es válido, aún no hay turnos)
    if ((diaRes.rowCount ?? 0) === 0) {
      console.log(
        `[DiaContableHandler] No existe día contable para ${negocioId} en ${today}`
      );
      return { success: true, diaContable: null };
    }

    const diaContable = diaRes.rows[0];

    // 2. Obtener todos los turnos del día con información del usuario
    const turnosRes = await query(
      `SELECT
        t.id,
        t.dia_contable_id,
        t.usuario_id,
        t.numero_turno,
        t.estado,
        t.efectivo_contado_turno,
        t.venta_reportada_pos_turno,
        u.nombre_completo as usuario_nombre,
        COUNT(tx.id) as transacciones_count,
        COALESCE(SUM(CASE WHEN tx.categoria = 'PAGO_DIGITAL' THEN tx.valor ELSE 0 END), 0) as total_pagos_digitales,
        COALESCE(SUM(CASE WHEN tx.categoria IN ('GASTO_CAJA', 'COMPRA_PROV') THEN tx.valor ELSE 0 END), 0) as total_gastos
       FROM turnos t
       LEFT JOIN usuarios u ON t.usuario_id = u.id
       LEFT JOIN transacciones tx ON t.id = tx.turno_id
       WHERE t.dia_contable_id = $1
       GROUP BY t.id, t.dia_contable_id, t.usuario_id, t.numero_turno, t.estado,
                t.efectivo_contado_turno, t.venta_reportada_pos_turno, u.nombre_completo
       ORDER BY t.numero_turno ASC`,
      [diaContable.id]
    );

    // 3. Procesar turnos para calcular estadísticas
    const turnos = (turnosRes.rows ?? []).map((turno: any) => {
      // Calcular diferencia si es necesario
      let diferencia_calculada_turno = 0;
      if (
        turno.efectivo_contado_turno !== null &&
        turno.venta_reportada_pos_turno !== null
      ) {
        const efectivoEsperado =
          turno.venta_reportada_pos_turno +
          turno.total_pagos_digitales -
          turno.total_gastos;
        diferencia_calculada_turno = turno.efectivo_contado_turno - efectivoEsperado;
      }

      return {
        id: turno.id,
        numero_turno: turno.numero_turno,
        estado: turno.estado,
        usuario_id: turno.usuario_id,
        usuario_nombre: turno.usuario_nombre,
        efectivo_contado_turno: turno.efectivo_contado_turno,
        venta_reportada_pos_turno: turno.venta_reportada_pos_turno,
        total_pagos_digitales: parseFloat(turno.total_pagos_digitales),
        total_gastos: parseFloat(turno.total_gastos),
        diferencia_calculada_turno: diferencia_calculada_turno,
        transacciones_count: parseInt(turno.transacciones_count)
      };
    });

    // 4. Calcular estadísticas totales del día
    const totalTransacciones = turnos.reduce(
      (sum: number, t: any) => sum + (t.transacciones_count || 0),
      0
    );

    const totalPagosDigitales = turnos.reduce(
      (sum: number, t: any) => sum + (t.total_pagos_digitales || 0),
      0
    );

    const totalGastos = turnos.reduce(
      (sum: number, t: any) => sum + (t.total_gastos || 0),
      0
    );

    const totalDiferencia = turnos.reduce(
      (sum: number, t: any) => sum + (t.diferencia_calculada_turno || 0),
      0
    );

    // 5. Obtener count de transacciones auditadas
    const auditRes = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN confirmado_auditoria = true THEN 1 END) as confirmadas
       FROM transacciones tx
       JOIN turnos t ON tx.turno_id = t.id
       WHERE t.dia_contable_id = $1`,
      [diaContable.id]
    );

    const auditStats = auditRes.rows[0] || {
      total: 0,
      confirmadas: 0
    };

    // 6. Retornar todo junto
    const response = {
      ...diaContable,
      turnos,
      totalTransacciones,
      totalPagosDigitales,
      totalGastos,
      totalDiferencia,
      transaccionesAuditadas: parseInt(auditStats.confirmadas),
      transaccionesPendientes:
        parseInt(auditStats.total) - parseInt(auditStats.confirmadas)
    };

    console.log(
      `[DiaContableHandler] Día ${today} para negocio ${negocioId}: ${turnos.length} turnos, ${totalTransacciones} transacciones`
    );

    return { success: true, diaContable: response };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[DiaContableHandler] Error getCurrent: ${errorMsg}`);
    return {
      success: false,
      error: `Error al obtener día contable: ${errorMsg}`
    };
  }
}

/**
 * Marca el día contable como REVISADO.
 * Validaciones:
 * - Todos los turnos deben estar CERRADOS
 * - El día no puede estar ya REVISADO
 * Usado por RevisionScreen para cerrar el día.
 */
async function handleReviewDiaContable(
  _event: unknown,
  args: { negocioId: number }
): Promise<{
  success: boolean;
  error?: string;
}> {
  const { negocioId } = args;

  try {
    // Validar que se pasó el negocioId
    if (!negocioId || negocioId <= 0) {
      return { success: false, error: 'ID de negocio inválido' };
    }

    // Obtener la fecha de hoy
    const today = new Date().toISOString().split('T')[0];

    // 1. Buscar el día contable
    const diaRes = await query(
      `SELECT id, estado FROM dias_contables
       WHERE negocio_id = $1 AND fecha = $2`,
      [negocioId, today]
    );

    if ((diaRes.rowCount ?? 0) === 0) {
      return {
        success: false,
        error: 'No existe día contable para revisar'
      };
    }

    const diaContable = diaRes.rows[0];

    // 2. Validar que el día no esté ya revisado
    if (diaContable.estado === 'REVISADO') {
      return {
        success: false,
        error: 'El día ya ha sido revisado'
      };
    }

    // 3. Validar que TODOS los turnos estén CERRADOS
    const turnosAbiertosRes = await query(
      `SELECT t.id FROM turnos t
       JOIN dias_contables d ON t.dia_contable_id = d.id
       WHERE d.negocio_id = $1 AND d.fecha = $2 AND t.estado != $3`,
      [negocioId, today, 'CERRADO']
    );

    if ((turnosAbiertosRes.rowCount ?? 0) > 0) {
      return {
        success: false,
        error: `No todos los turnos están cerrados (${turnosAbiertosRes.rowCount} abiertos)`
      };
    }

    // 4. Cambiar estado del día a REVISADO
    await query(
      `UPDATE dias_contables
       SET estado = $1, updated_at = NOW()
       WHERE id = $2`,
      ['REVISADO', diaContable.id]
    );

    console.log(`[DiaContableHandler] Día ${today} revisado para negocio ${negocioId}`);

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[DiaContableHandler] Error review: ${errorMsg}`);
    return {
      success: false,
      error: `Error al revisar el día: ${errorMsg}`
    };
  }
}
