// electron/handlers/turnoHandlers.ts

import { ipcMain } from 'electron';
import { query } from '../database';
import {
  validateUserAccessToNegocio,
  validatePositiveNumber,
  handleValidationError
} from './validationHelpers';

/**
 * Registra todos los manejadores IPC relacionados con Turnos.
 */
export function registerTurnoHandlers() {
  ipcMain.handle('turno:initialize', handleInitializeTurno);
  ipcMain.handle('turno:init', handleInitializeTurno); // Alias para compatibilidad
  ipcMain.handle('turno:current', handleGetCurrentTurno);
  ipcMain.handle('turno:get', handleGetTurno);
  ipcMain.handle('turno:close', handleCloseTurno);
  ipcMain.handle('turno:getByDay', handleGetTurnosByDay);
  ipcMain.handle('turno:history', handleGetTurnosHistory);
  ipcMain.handle('turno:summaryDay', handleGetSummaryDay);
  ipcMain.handle('turno:confirmAudit', handleConfirmTurnoAudit);
  console.log('   -> [Handler] Turno Handlers registrados.');
}

/**
 * Lógica para inicializar o recuperar el Turno Activo (CU-1, Pasos 4-6).
 * Crea el Día Contable si es necesario, y luego busca o crea el Turno 1 o 2.
 */
async function handleInitializeTurno(
  _event: unknown,
  args: { usuarioId: number; negocioId: number }
): Promise<{ success: boolean; error?: string; turno?: Record<string, unknown> }> {
  const { usuarioId, negocioId } = args;
  console.log(`[TurnoHandler] Inicializando para NegocioID: ${negocioId}`);

  try {
    // --- VALIDACIONES PREVIAS ---
    // Validar parámetros numéricos
    validatePositiveNumber(usuarioId, 'ID de usuario');
    validatePositiveNumber(negocioId, 'ID de negocio');

    // Validar que usuario existe, está activo y tiene acceso al negocio
    await validateUserAccessToNegocio(usuarioId, negocioId);

    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // --- 1. Encontrar o crear el Días Contables ---
    // Usar INSERT ... ON CONFLICT para evitar race conditions
    // Si ya existe dias_contables para hoy, simplemente lo devolvemos (DO NOTHING)
    // No podemos hacer DO UPDATE SET id porque violaría la FK constraint de turnos
    const diaContableRes = await query(
      `INSERT INTO dias_contables (fecha, negocio_id, estado)
       VALUES ($1, $2, $3)
       ON CONFLICT (negocio_id, fecha) DO NOTHING
       RETURNING id, estado`,
      [today, negocioId, 'ABIERTO']
    );

    // Si INSERT retornó 0 rows (porque ya existía), hacer SELECT para obtenerlo
    let diaContableId: number;
    let diaEstado: string;

    if ((diaContableRes.rowCount ?? 0) > 0) {
      diaContableId = diaContableRes.rows[0].id;
      diaEstado = diaContableRes.rows[0].estado;
    } else {
      // Ya existe, obtenerlo
      const existingDia = await query(
        'SELECT id, estado FROM dias_contables WHERE fecha = $1 AND negocio_id = $2',
        [today, negocioId]
      );
      diaContableId = existingDia.rows[0].id;
      diaEstado = existingDia.rows[0].estado;
    }

    // Si el día ya está 'REVISADO', el turno está bloqueado (RF4.6)
    if (diaEstado === 'REVISADO') {
      return { success: false, error: 'El día contable ya fue revisado y cerrado. No se pueden abrir más turnos.' };
    }

    // --- 2. Determinar qué turno abrir (Turno 1 o 2) ---
    const turnoRes = await query(
      'SELECT id, usuario_id, numero_turno, estado FROM turnos WHERE dia_contable_id = $1 ORDER BY numero_turno DESC',
      [diaContableId]
    );

    let turnoActivo: Record<string, unknown> | null = null;
    let nextTurnoNum: number = 1;

    if ((turnoRes.rowCount ?? 0) > 0) {
      // a) Buscar un turno ABIERTO (del usuario actual o de otro)
      const turnoAbiertoExistente = turnoRes.rows.find((t: Record<string, unknown>) => t.estado === 'ABIERTO') ?? null;

      if (turnoAbiertoExistente) {
        // Hay un turno ABIERTO
        if ((turnoAbiertoExistente.usuario_id as number) === usuarioId) {
          // Es el turno del usuario actual, devolverlo para que continue trabajando
          turnoActivo = turnoAbiertoExistente;
        } else {
          // Es de otro empleado. El usuario actual no puede crear ni recuperar un turno diferente.
          // Debe esperar a que ese turno se cierre.
          return { success: false, error: `El Turno ${turnoAbiertoExistente.numero_turno} está abierto por otro empleado. Debe cerrarse antes de poder abrir uno nuevo.` };
        }
      } else {
        // b) No hay turnos ABIERTOS. Determinar el siguiente turno a crear (basado en el último turno cerrado)
        const lastTurnoNum = turnoRes.rows[0].numero_turno as number;
        nextTurnoNum = lastTurnoNum + 1;
      }
    }

    // --- 3. Abrir o Devolver el Turno ---
    if (turnoActivo) {
      // Devolver el turno ya activo (ya verificamos que le pertenece)
      console.log(`[TurnoHandler] Turno ${turnoActivo.numero_turno} activo recuperado.`);
      return { success: true, turno: turnoActivo };

    } else if (nextTurnoNum <= 2) {
      // Crear el Turno 1 o Turno 2 (RF2.1)
      const newTurnoRes = await query(
        `INSERT INTO turnos (dia_contable_id, usuario_id, numero_turno, estado)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [diaContableId, usuarioId, nextTurnoNum, 'ABIERTO']
      );
      console.log(`✅ [TurnoHandler] Turno ${nextTurnoNum} creado exitosamente.`);

      // Obtener el turno con el nombre del usuario
      const turnoConUsuario = await query(
        `SELECT t.id, t.dia_contable_id, t.usuario_id, t.numero_turno, t.estado,
                t.efectivo_contado_turno, t.venta_reportada_pos_turno, t.diferencia_calculada_turno, t.created_at,
                u.nombre_completo as usuario_nombre
         FROM turnos t
         LEFT JOIN usuarios u ON t.usuario_id = u.id
         WHERE t.id = $1`,
        [newTurnoRes.rows[0].id]
      );

      console.log(`[TurnoHandler] Turno creado con datos:`, JSON.stringify(turnoConUsuario.rows[0], null, 2));
      console.log(`[TurnoHandler] usuario_nombre value:`, turnoConUsuario.rows[0]?.usuario_nombre);
      return { success: true, turno: turnoConUsuario.rows[0] as Record<string, unknown> };

    } else {
      // Intentamos crear Turno 3 o más
      return { success: false, error: 'Ya se han cerrado los dos turnos del día. Contacte al supervisor.' };
    }

  } catch (error) {
    console.error('❌ [TurnoHandler] Error en la inicialización:', error);
    // Retornar error de validación si es el caso, sino error genérico
    if (error instanceof Error && error.message.includes('Usuario') || error instanceof Error && error.message.includes('negocio') || error instanceof Error && error.message.includes('acceso')) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error interno de la aplicación. No se pudo iniciar el turno.' };
  }
}

/**
 * Obtener el turno actual activo de un negocio
 */
async function handleGetCurrentTurno(
  _event: unknown,
  args: { negocioId: number; usuarioId?: number }
): Promise<{ success: boolean; turno?: Record<string, unknown>; error?: string }> {
  try {
    const { negocioId, usuarioId } = args;

    // --- VALIDACIONES ---
    validatePositiveNumber(negocioId, 'ID de negocio');

    // Si se proporciona usuarioId, validar que tiene acceso
    if (usuarioId) {
      validatePositiveNumber(usuarioId, 'ID de usuario');
      await validateUserAccessToNegocio(usuarioId, negocioId);
    }

    const today = new Date().toISOString().split('T')[0];

    // Buscar CUALQUIER turno de hoy (ABIERTO o CERRADO)
    // Prioriza los ABIERTOS primero, si hay, sino devuelve el CERRADO
    const result = await query(
      `SELECT t.*, u.nombre_completo as usuario_nombre FROM turnos t
       JOIN dias_contables dc ON t.dia_contable_id = dc.id
       LEFT JOIN usuarios u ON t.usuario_id = u.id
       WHERE dc.fecha = $1 AND dc.negocio_id = $2
       ORDER BY t.estado = 'ABIERTO' DESC, t.numero_turno DESC
       LIMIT 1`,
      [today, negocioId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return { success: false, error: 'No hay turno registrado para hoy' };
    }

    return { success: true, turno: result.rows[0] as Record<string, unknown> };
  } catch (error) {
    console.error('❌ [TurnoHandler] Error al obtener turno actual:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al obtener turno actual' };
  }
}

/**
 * Obtener un turno específico
 */
async function handleGetTurno(
  _event: unknown,
  args: { turnoId: number; usuarioId?: number; negocioId?: number } | number
): Promise<{ success: boolean; turno?: Record<string, unknown>; error?: string }> {
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
      'SELECT * FROM turnos WHERE id = $1',
      [turnoId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return { success: false, error: 'Turno no encontrado' };
    }

    return { success: true, turno: result.rows[0] as Record<string, unknown> };
  } catch (error) {
    console.error('❌ [TurnoHandler] Error al obtener turno:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al obtener turno' };
  }
}

/**
 * Cerrar un turno
 */
async function handleCloseTurno(
  _event: unknown,
  args: { turnoId: number; ventaReportadaPosTurno?: number; efectivoContadoTurno?: number; diferencia_calculada_turno?: number; usuarioId?: number; negocioId?: number } | number
): Promise<{ success: boolean; turno?: Record<string, unknown>; error?: string }> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const turnoId = typeof args === 'object' ? args.turnoId : args;
    const ventaReportadaPosTurno = typeof args === 'object' ? args.ventaReportadaPosTurno : undefined;
    const efectivoContadoTurno = typeof args === 'object' ? args.efectivoContadoTurno : undefined;
    let diferenciaCalculada = typeof args === 'object' ? args.diferencia_calculada_turno : undefined;
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

    // --- IMPLEMENTAR CÁLCULO POS INCREMENTAL (RF2.5) ---
    // Obtener el turno actual para saber su número y día contable
    const turnoActual = await query(
      'SELECT numero_turno, dia_contable_id FROM turnos WHERE id = $1',
      [turnoId]
    );

    if ((turnoActual.rowCount ?? 0) === 0) {
      return { success: false, error: 'Turno no encontrado' };
    }

    const numeroTurno = turnoActual.rows[0].numero_turno as number;
    const diaContableId = turnoActual.rows[0].dia_contable_id as number;

    // Si el turno es #2 o posterior, calcular venta incremental (venta actual - venta anterior)
    if (numeroTurno > 1 && ventaReportadaPosTurno !== undefined) {
      const turnoAnterior = await query(
        'SELECT venta_reportada_pos_turno FROM turnos WHERE dia_contable_id = $1 AND numero_turno = $2',
        [diaContableId, numeroTurno - 1]
      );

      if ((turnoAnterior.rowCount ?? 0) > 0) {
        const ventaAnterior = turnoAnterior.rows[0].venta_reportada_pos_turno as number || 0;
        const ventaIncrementalPosTurno = ventaReportadaPosTurno - ventaAnterior;

        // RECALCULAR DIFERENCIA CORRECTAMENTE - FIX SESIÓN 7
        // Para Turno #2+, usar POS incremental en la fórmula de diferencia
        // diferencia = suma_transacciones - venta_incremental_pos
        // donde suma = efectivo + pagos_digitales + compras + gastos

        // Obtener transacciones del turno para recalcular suma correctamente
        const transResult = await query(
          `SELECT categoria, SUM(valor) as total
           FROM transacciones
           WHERE turno_id = $1
           GROUP BY categoria`,
          [turnoId]
        );

        let pagosDigitales = 0;
        let compras = 0;
        let gastos = 0;

        transResult.rows.forEach((row: any) => {
          const valor = parseFloat(row.total || 0);
          if (row.categoria === 'PAGO_DIGITAL') {
            pagosDigitales += valor;
          } else if (row.categoria === 'COMPRA_PROV') {
            compras += Math.abs(valor);
          } else if (row.categoria === 'GASTO_CAJA') {
            gastos += Math.abs(valor);
          }
        });

        // Calcular suma correctamente: efectivo + pagos + compras + gastos
        const sumaTransacciones = (efectivoContadoTurno || 0) + pagosDigitales + compras + gastos;

        // Diferencia usando venta incremental
        diferenciaCalculada = sumaTransacciones - ventaIncrementalPosTurno;

        console.log(`[TurnoHandler] POS Incremental T${numeroTurno}: ${ventaReportadaPosTurno} - ${ventaAnterior} = ${ventaIncrementalPosTurno}`);
        console.log(`[TurnoHandler] Suma Transacciones: ${sumaTransacciones} (Efectivo: ${efectivoContadoTurno}, Pagos: ${pagosDigitales}, Compras: ${compras}, Gastos: ${gastos})`);
        console.log(`[TurnoHandler] Diferencia recalculada T${numeroTurno}: ${sumaTransacciones} - ${ventaIncrementalPosTurno} = ${diferenciaCalculada}`);
      }
    }

    // Construir UPDATE query con los valores proporcionados
    const updateFields = ['estado = $2'];
    const params: any[] = [turnoId, 'CERRADO'];

    if (ventaReportadaPosTurno !== undefined) {
      params.push(ventaReportadaPosTurno);
      updateFields.push(`venta_reportada_pos_turno = $${params.length}`);
    }

    if (efectivoContadoTurno !== undefined) {
      params.push(efectivoContadoTurno);
      updateFields.push(`efectivo_contado_turno = $${params.length}`);
    }

    if (diferenciaCalculada !== undefined) {
      params.push(diferenciaCalculada);
      updateFields.push(`diferencia_calculada_turno = $${params.length}`);
    }

    const result = await query(
      `UPDATE turnos SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if ((result.rowCount ?? 0) === 0) {
      return { success: false, error: 'Turno no encontrado' };
    }

    console.log(`✅ [TurnoHandler] Turno ${turnoId} cerrado exitosamente.`);
    return { success: true, turno: result.rows[0] as Record<string, unknown> };
  } catch (error) {
    console.error('❌ [TurnoHandler] Error al cerrar turno:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al cerrar turno' };
  }
}

/**
 * Obtener todos los turnos de un día contable
 */
async function handleGetTurnosByDay(
  _event: unknown,
  args: { diaContableId: number; usuarioId?: number; negocioId?: number } | number
): Promise<{ success: boolean; turnos?: Record<string, unknown>[]; error?: string }> {
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

    const result = await query(
      `SELECT * FROM turnos WHERE dia_contable_id = $1 ORDER BY numero_turno ASC`,
      [diaContableId]
    );

    return { success: true, turnos: (result.rows ?? []) as Record<string, unknown>[] };
  } catch (error) {
    console.error('❌ [TurnoHandler] Error al obtener turnos del día:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al obtener turnos del día' };
  }
}

/**
 * Obtener historial de turnos
 */
async function handleGetTurnosHistory(
  _event: unknown,
  args?: { limit?: number; offset?: number; usuarioId?: number; negocioId?: number }
): Promise<{ success: boolean; turnos?: Record<string, unknown>[]; error?: string }> {
  try {
    const limit = args?.limit ?? 10;
    const offset = args?.offset ?? 0;
    const usuarioId = args?.usuarioId;
    const negocioId = args?.negocioId;

    // --- VALIDACIONES ---
    // Si se proporciona usuarioId y negocioId, validar acceso
    if (usuarioId && negocioId) {
      validatePositiveNumber(usuarioId, 'ID de usuario');
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(usuarioId, negocioId);
    }

    const result = await query(
      `SELECT
        t.*,
        u.nombre_completo as creado_por
      FROM turnos t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      ORDER BY numero_turno ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { success: true, turnos: (result.rows ?? []) as Record<string, unknown>[] };
  } catch (error) {
    console.error('❌ [TurnoHandler] Error al obtener historial de turnos:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al obtener historial de turnos' };
  }
}

/**
 * Confirmar cierre de turno por auditor
 */
async function handleConfirmTurnoAudit(
  _event: unknown,
  args: { turnoId: number; auditorId: number; negocioId?: number }
): Promise<{ success: boolean; turno?: Record<string, unknown>; error?: string }> {
  try {
    const { turnoId, auditorId, negocioId } = args;

    // --- VALIDACIONES ---
    validatePositiveNumber(turnoId, 'ID de turno');
    validatePositiveNumber(auditorId, 'ID de auditor');

    // Si se proporciona negocioId, validar que auditor tiene acceso
    if (negocioId) {
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(auditorId, negocioId);
    }

    // El turno debe estar CERRADO para poder auditarlo
    const turnoResult = await query(
      'SELECT estado FROM turnos WHERE id = $1',
      [turnoId]
    );

    if ((turnoResult.rowCount ?? 0) === 0) {
      return { success: false, error: 'Turno no encontrado' };
    }

    const turnoEstado = (turnoResult.rows[0] as Record<string, unknown>).estado;
    if (turnoEstado !== 'CERRADO') {
      return { success: false, error: 'Solo se pueden auditar turnos CERRADOS' };
    }

    // Actualizar turno a REVISADO
    const result = await query(
      `UPDATE turnos SET estado = 'REVISADO' WHERE id = $1 RETURNING *`,
      [turnoId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return { success: false, error: 'No se pudo auditar el turno' };
    }

    console.log(`✅ [TurnoHandler] Turno ${turnoId} auditado y marcado como REVISADO.`);
    return { success: true, turno: result.rows[0] as Record<string, unknown> };
  } catch (error) {
    console.error('❌ [TurnoHandler] Error al confirmar auditoría del turno:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al confirmar auditoría del turno' };
  }
}

/**
 * Obtener resumen de jornada (totales del día)
 */
async function handleGetSummaryDay(
  _event: unknown,
  args?: { diaContableId?: number; usuarioId?: number; negocioId?: number }
): Promise<{
  success: boolean;
  summary?: {
    venta_pos_dia: number;
    efectivo_dia: number;
    pagos_digitales_dia: number;
    compras_dia: number;
    gastos_dia: number;
    diferencia_dia: number;
  };
  error?: string;
}> {
  try {
    const usuarioId = args?.usuarioId;
    const negocioId = args?.negocioId;
    let diaContableId = args?.diaContableId;

    // Si no se proporciona diaContableId, obtener el del día actual
    if (!diaContableId) {
      const today = new Date().toISOString().split('T')[0];
      const diaRes = await query(
        'SELECT id FROM dias_contables WHERE fecha = $1 AND negocio_id = $2',
        [today, negocioId]
      );
      if ((diaRes.rowCount ?? 0) === 0) {
        return { success: true, summary: { venta_pos_dia: 0, efectivo_dia: 0, pagos_digitales_dia: 0, compras_dia: 0, gastos_dia: 0, diferencia_dia: 0 } };
      }
      diaContableId = diaRes.rows[0].id as number;
    }

    // --- VALIDACIONES ---
    if (usuarioId && negocioId) {
      validatePositiveNumber(usuarioId, 'ID de usuario');
      validatePositiveNumber(negocioId, 'ID de negocio');
      await validateUserAccessToNegocio(usuarioId, negocioId);
    }

    // Obtener totales de turnos del día
    const turnosResult = await query(
      `SELECT
        COALESCE(SUM(venta_reportada_pos_turno), 0) as venta_pos_dia,
        COALESCE(SUM(efectivo_contado_turno), 0) as efectivo_dia,
        COALESCE(SUM(diferencia_calculada_turno), 0) as diferencia_dia
       FROM turnos
       WHERE dia_contable_id = $1 AND estado = 'CERRADO'`,
      [diaContableId]
    );

    const ventaPosDia = parseFloat((turnosResult.rows[0]?.venta_pos_dia as number)?.toString() || '0');
    const efectivoDia = parseFloat((turnosResult.rows[0]?.efectivo_dia as number)?.toString() || '0');
    const diferenciaDia = parseFloat((turnosResult.rows[0]?.diferencia_dia as number)?.toString() || '0');

    // Obtener totales de transacciones del día por categoría
    const transResult = await query(
      `SELECT
        categoria,
        COALESCE(SUM(valor), 0) as total
       FROM transacciones t
       JOIN turnos tur ON t.turno_id = tur.id
       WHERE tur.dia_contable_id = $1
       GROUP BY categoria`,
      [diaContableId]
    );

    let pagosDia = 0;
    let comprasDia = 0;
    let gastosDia = 0;

    transResult.rows.forEach((row: any) => {
      const valor = parseFloat(row.total || 0);
      if (row.categoria === 'PAGO_DIGITAL') {
        pagosDia += valor;
      } else if (row.categoria === 'COMPRA_PROV') {
        comprasDia += Math.abs(valor); // Tomar valor absoluto
      } else if (row.categoria === 'GASTO_CAJA') {
        gastosDia += Math.abs(valor); // Tomar valor absoluto
      }
    });

    return {
      success: true,
      summary: {
        venta_pos_dia: ventaPosDia,
        efectivo_dia: efectivoDia,
        pagos_digitales_dia: pagosDia,
        compras_dia: comprasDia,
        gastos_dia: gastosDia,
        diferencia_dia: diferenciaDia
      }
    };
  } catch (error) {
    console.error('❌ [TurnoHandler] Error al obtener resumen de jornada:', error);
    if (error instanceof Error && (error.message.includes('Usuario') || error.message.includes('negocio') || error.message.includes('acceso') || error.message.includes('inválido'))) {
      return handleValidationError(error);
    }
    return { success: false, error: 'Error al obtener resumen de jornada' };
  }
}