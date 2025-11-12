// src/api/turnoService.ts

import { httpClient } from './httpClient';
import { Turno } from '../types';

/**
 * Servicio para operaciones relacionadas con Turnos
 */

export const turnoService = {
  /**
   * Inicializar un nuevo turno para el negocio especificado
   */
  async initTurno(negocioId: number): Promise<Turno> {
    // Obtener usuarioId del localStorage (guardado durante login)
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const usuarioId = user?.id || 0;

    // El handler retorna { success: boolean; turno?: Turno; error?: string }
    // El httpClient extrae el campo 'turno' y lo retorna directamente como Turno
    const turno = await httpClient.invoke<Turno>('turno:init', { usuarioId, negocioId });

    console.log('[TurnoService] Turno created:', turno);
    console.log('[TurnoService] usuario_nombre:', turno.usuario_nombre);

    if (turno && turno.id) {
      return turno;
    } else {
      throw new Error('Error al inicializar turno: respuesta vacía del servidor');
    }
  },

  /**
   * Obtener el turno actual del negocio especificado
   */
  async getCurrentTurno(negocioId: number): Promise<Turno | null> {
    try {
      return await httpClient.invoke<Turno>('turno:current', { negocioId });
    } catch (error) {
      console.error('Error obteniendo turno actual:', error);
      return null;
    }
  },

  /**
   * Obtener detalles de un turno específico
   */
  async getTurno(turnoId: number): Promise<Turno> {
    return httpClient.invoke<Turno>('turno:get', { turnoId });
  },

  /**
   * Cerrar un turno con valores de cierre
   */
  async closeTurno(
    turnoId: number,
    ventaReportadaPosTurno?: number,
    efectivoContadoTurno?: number,
    diferenciaCalculada?: number
  ): Promise<Turno> {
    return httpClient.invoke<Turno>('turno:close', {
      turnoId,
      ventaReportadaPosTurno: ventaReportadaPosTurno || 0,
      efectivoContadoTurno: efectivoContadoTurno || 0,
      diferencia_calculada_turno: diferenciaCalculada || 0
    });
  },

  /**
   * Obtener todos los turnos del día
   */
  async getTurnosByDay(diaContableId: number): Promise<Turno[]> {
    return httpClient.invoke<Turno[]>('turno:getByDay', { diaContableId });
  },

  /**
   * Obtener historial de turnos
   */
  async getTurnosHistory(limit: number = 10, offset: number = 0): Promise<Turno[]> {
    return httpClient.invoke<Turno[]>('turno:history', { limit, offset });
  },

  /**
   * Confirmar cierre de turno por auditor
   */
  async confirmTurnoAudit(turnoId: number, auditorId: number): Promise<Turno> {
    return httpClient.invoke<Turno>('turno:confirmAudit', { turnoId, auditorId });
  },

  /**
   * Obtener resumen de jornada (totales del día)
   */
  async getSummaryDay(diaContableId?: number): Promise<{
    venta_pos_dia: number;
    efectivo_dia: number;
    pagos_digitales_dia: number;
    compras_dia: number;
    gastos_dia: number;
    diferencia_dia: number;
  }> {
    return httpClient.invoke<any>('turno:summaryDay', { diaContableId }).then(result => result.summary);
  }
};
