// src/hooks/useCatalogos.ts

import { useState, useCallback } from 'react';
import { Proveedor, TipoGasto, TipoPagoDigital } from '../types';
import { catalogoService } from '../api';

interface UseCatalogosState {
  proveedores: Proveedor[];
  tiposGasto: TipoGasto[];
  tiposPagoDigital: TipoPagoDigital[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseCatalogosActions {
  // Proveedores
  getProveedores: (negocioId: number) => Promise<void>;
  createProveedor: (negocioId: number, nombre: string) => Promise<void>;
  updateProveedor: (proveedorId: number, nombre: string, activo: boolean) => Promise<void>;
  deleteProveedor: (proveedorId: number) => Promise<void>;

  // Tipos de Gasto
  getTiposGasto: (negocioId: number) => Promise<void>;
  createTipoGasto: (negocioId: number, nombre: string) => Promise<void>;
  updateTipoGasto: (tipoGastoId: number, nombre: string, activo: boolean) => Promise<void>;
  deleteTipoGasto: (tipoGastoId: number) => Promise<void>;

  // Tipos de Pago Digital
  getTiposPagoDigital: (negocioId: number) => Promise<void>;
  createTipoPagoDigital: (negocioId: number, nombre: string) => Promise<void>;
  updateTipoPagoDigital: (tipoPagoDigitalId: number, nombre: string, activo: boolean) => Promise<void>;
  deleteTipoPagoDigital: (tipoPagoDigitalId: number) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

export const useCatalogos = (): UseCatalogosState & UseCatalogosActions => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [tiposGasto, setTiposGasto] = useState<TipoGasto[]>([]);
  const [tiposPagoDigital, setTiposPagoDigital] = useState<TipoPagoDigital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ===== PROVEEDORES =====

  const getProveedores = useCallback(async (negocioId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await catalogoService.getProveedores(negocioId);
      setProveedores(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener proveedores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProveedor = useCallback(
    async (negocioId: number, nombre: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const newProveedor = await catalogoService.createProveedor(negocioId, nombre);
        setProveedores([...proveedores, newProveedor]);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al crear proveedor');
      } finally {
        setIsLoading(false);
      }
    },
    [proveedores]
  );

  const updateProveedor = useCallback(
    async (proveedorId: number, nombre: string, activo: boolean) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const updated = await catalogoService.updateProveedor(proveedorId, nombre, activo);
        setProveedores(proveedores.map((p) => (p.id === proveedorId ? updated : p)));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al actualizar proveedor');
      } finally {
        setIsLoading(false);
      }
    },
    [proveedores]
  );

  const deleteProveedor = useCallback(
    async (proveedorId: number) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await catalogoService.deleteProveedor(proveedorId);
        setProveedores(proveedores.filter((p) => p.id !== proveedorId));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al eliminar proveedor');
      } finally {
        setIsLoading(false);
      }
    },
    [proveedores]
  );

  // ===== TIPOS DE GASTO =====

  const getTiposGasto = useCallback(async (negocioId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await catalogoService.getTiposGasto(negocioId);
      setTiposGasto(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener tipos de gasto');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTipoGasto = useCallback(
    async (negocioId: number, nombre: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const newTipo = await catalogoService.createTipoGasto(negocioId, nombre);
        setTiposGasto([...tiposGasto, newTipo]);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al crear tipo de gasto');
      } finally {
        setIsLoading(false);
      }
    },
    [tiposGasto]
  );

  const updateTipoGasto = useCallback(
    async (tipoGastoId: number, nombre: string, activo: boolean) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const updated = await catalogoService.updateTipoGasto(tipoGastoId, nombre, activo);
        setTiposGasto(tiposGasto.map((t) => (t.id === tipoGastoId ? updated : t)));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al actualizar tipo de gasto');
      } finally {
        setIsLoading(false);
      }
    },
    [tiposGasto]
  );

  const deleteTipoGasto = useCallback(
    async (tipoGastoId: number) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await catalogoService.deleteTipoGasto(tipoGastoId);
        setTiposGasto(tiposGasto.filter((t) => t.id !== tipoGastoId));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al eliminar tipo de gasto');
      } finally {
        setIsLoading(false);
      }
    },
    [tiposGasto]
  );

  // ===== TIPOS DE PAGO DIGITAL =====

  const getTiposPagoDigital = useCallback(async (negocioId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await catalogoService.getTiposPagoDigital(negocioId);
      setTiposPagoDigital(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener tipos de pago digital');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTipoPagoDigital = useCallback(
    async (negocioId: number, nombre: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const newTipo = await catalogoService.createTipoPagoDigital(negocioId, nombre);
        setTiposPagoDigital([...tiposPagoDigital, newTipo]);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al crear tipo de pago digital');
      } finally {
        setIsLoading(false);
      }
    },
    [tiposPagoDigital]
  );

  const updateTipoPagoDigital = useCallback(
    async (tipoPagoDigitalId: number, nombre: string, activo: boolean) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const updated = await catalogoService.updateTipoPagoDigital(tipoPagoDigitalId, nombre, activo);
        setTiposPagoDigital(tiposPagoDigital.map((t) => (t.id === tipoPagoDigitalId ? updated : t)));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al actualizar tipo de pago digital');
      } finally {
        setIsLoading(false);
      }
    },
    [tiposPagoDigital]
  );

  const deleteTipoPagoDigital = useCallback(
    async (tipoPagoDigitalId: number) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await catalogoService.deleteTipoPagoDigital(tipoPagoDigitalId);
        setTiposPagoDigital(tiposPagoDigital.filter((t) => t.id !== tipoPagoDigitalId));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al eliminar tipo de pago digital');
      } finally {
        setIsLoading(false);
      }
    },
    [tiposPagoDigital]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setProveedores([]);
    setTiposGasto([]);
    setTiposPagoDigital([]);
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    proveedores,
    tiposGasto,
    tiposPagoDigital,
    isLoading,
    error,
    success,
    getProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    getTiposGasto,
    createTipoGasto,
    updateTipoGasto,
    deleteTipoGasto,
    getTiposPagoDigital,
    createTipoPagoDigital,
    updateTipoPagoDigital,
    deleteTipoPagoDigital,
    clearError,
    reset,
  };
};
