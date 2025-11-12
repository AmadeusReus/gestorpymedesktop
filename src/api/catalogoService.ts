// src/api/catalogoService.ts

import { httpClient } from './httpClient';
import { Proveedor, TipoGasto, TipoPagoDigital, GenericResponse } from '../types';

/**
 * Servicio para operaciones relacionadas con Catálogos
 */

export const catalogoService = {
  // ===== PROVEEDORES =====

  /**
   * Obtener todos los proveedores
   */
  async getProveedores(negocioId: number): Promise<Proveedor[]> {
    return httpClient.invoke<Proveedor[]>('catalogo:getProveedores', { negocioId });
  },

  /**
   * Crear nuevo proveedor
   */
  async createProveedor(negocioId: number, nombre: string): Promise<Proveedor> {
    return httpClient.invoke<Proveedor>('catalogo:createProveedor', { negocioId, nombre });
  },

  /**
   * Actualizar proveedor
   */
  async updateProveedor(proveedorId: number, nombre: string, activo: boolean): Promise<Proveedor> {
    return httpClient.invoke<Proveedor>('catalogo:updateProveedor', { proveedorId, nombre, activo });
  },

  /**
   * Eliminar proveedor
   */
  async deleteProveedor(proveedorId: number): Promise<GenericResponse> {
    return httpClient.invoke<GenericResponse>('catalogo:deleteProveedor', { proveedorId });
  },

  // ===== TIPOS DE GASTO =====

  /**
   * Obtener todos los tipos de gasto
   */
  async getTiposGasto(negocioId: number): Promise<TipoGasto[]> {
    return httpClient.invoke<TipoGasto[]>('catalogo:getTiposGasto', { negocioId });
  },

  /**
   * Crear nuevo tipo de gasto
   */
  async createTipoGasto(negocioId: number, nombre: string): Promise<TipoGasto> {
    return httpClient.invoke<TipoGasto>('catalogo:createTipoGasto', { negocioId, nombre });
  },

  /**
   * Actualizar tipo de gasto
   */
  async updateTipoGasto(tipoGastoId: number, nombre: string, activo: boolean): Promise<TipoGasto> {
    return httpClient.invoke<TipoGasto>('catalogo:updateTipoGasto', { tipoGastoId, nombre, activo });
  },

  /**
   * Eliminar tipo de gasto
   */
  async deleteTipoGasto(tipoGastoId: number): Promise<GenericResponse> {
    return httpClient.invoke<GenericResponse>('catalogo:deleteTipoGasto', { tipoGastoId });
  },

  // ===== TIPOS DE PAGO DIGITAL =====

  /**
   * Obtener todos los tipos de pago digital
   */
  async getTiposPagoDigital(negocioId: number): Promise<TipoPagoDigital[]> {
    return httpClient.invoke<TipoPagoDigital[]>('catalogo:getTiposPagoDigital', { negocioId });
  },

  /**
   * Crear nuevo tipo de pago digital
   */
  async createTipoPagoDigital(negocioId: number, nombre: string): Promise<TipoPagoDigital> {
    return httpClient.invoke<TipoPagoDigital>('catalogo:createTipoPagoDigital', { negocioId, nombre });
  },

  /**
   * Actualizar tipo de pago digital
   */
  async updateTipoPagoDigital(
    tipoPagoDigitalId: number,
    nombre: string,
    activo: boolean
  ): Promise<TipoPagoDigital> {
    return httpClient.invoke<TipoPagoDigital>(
      'catalogo:updateTipoPagoDigital',
      { tipoPagoDigitalId, nombre, activo }
    );
  },

  /**
   * Eliminar tipo de pago digital
   */
  async deleteTipoPagoDigital(tipoPagoDigitalId: number): Promise<GenericResponse> {
    return httpClient.invoke<GenericResponse>('catalogo:deleteTipoPagoDigital', { tipoPagoDigitalId });
  }
};
