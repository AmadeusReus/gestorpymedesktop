// src/api/transaccionService.ts

import { httpClient } from './httpClient';
import { Transaccion, CategoriaTxn, GenericResponse } from '../types';

/**
 * Servicio para operaciones relacionadas con Transacciones
 */

export const transaccionService = {
  /**
   * Crear una nueva transacción
   */
  async createTransaccion(
    turnoId: number,
    valor: number,
    categoria: CategoriaTxn,
    concepto?: string,
    proveedorId?: number,
    tipoGastoId?: number,
    tipoPagoDigitalId?: number
  ): Promise<Transaccion> {
    return httpClient.invoke<Transaccion>(
      'transaccion:create',
      { turnoId, valor, categoria, concepto, proveedorId, tipoGastoId, tipoPagoDigitalId }
    );
  },

  /**
   * Obtener transacciones de un turno
   */
  async getTransaccionesByTurno(turnoId: number): Promise<Transaccion[]> {
    return httpClient.invoke<Transaccion[]>('transaccion:getByTurno', { turnoId });
  },

  /**
   * Obtener todas las transacciones del usuario
   */
  async getTransacciones(limit: number = 50, offset: number = 0): Promise<Transaccion[]> {
    return httpClient.invoke<Transaccion[]>('transaccion:list', { limit, offset });
  },

  /**
   * Obtener transacciones por categoría
   */
  async getTransaccionesByCategory(
    categoria: CategoriaTxn,
    limit: number = 50,
    offset: number = 0
  ): Promise<Transaccion[]> {
    return httpClient.invoke<Transaccion[]>('transaccion:getByCategory', { categoria, limit, offset });
  },

  /**
   * Actualizar una transacción
   */
  async updateTransaccion(
    transaccionId: number,
    valor: number,
    categoria: CategoriaTxn,
    concepto?: string
  ): Promise<Transaccion> {
    return httpClient.invoke<Transaccion>(
      'transaccion:update',
      { transaccionId, valor, categoria, concepto }
    );
  },

  /**
   * Eliminar una transacción
   */
  async deleteTransaccion(transaccionId: number): Promise<GenericResponse> {
    return httpClient.invoke<GenericResponse>('transaccion:delete', { transaccionId });
  },

  /**
   * Confirmar transacción para auditoría
   */
  async confirmTransaccionAudit(transaccionId: number, auditorId: number): Promise<Transaccion> {
    return httpClient.invoke<Transaccion>('transaccion:confirmAudit', { transaccionId, auditorId });
  },

  /**
   * Obtener resumen de transacciones del día
   */
  async getDaySummary(diaContableId: number): Promise<any> {
    return httpClient.invoke<any>('transaccion:daySummary', { diaContableId });
  }
};
