// src/hooks/useTransacciones.ts

import { useState, useCallback } from 'react';
import { Transaccion, CategoriaTxn } from '../types';
import { transaccionService } from '../api';

interface UseTransaccionesState {
  transacciones: Transaccion[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
  total: number;
}

interface UseTransaccionesActions {
  createTransaccion: (
    turnoId: number,
    valor: number,
    categoria: CategoriaTxn,
    concepto?: string,
    proveedorId?: number,
    tipoGastoId?: number,
    tipoPagoDigitalId?: number
  ) => Promise<void>;
  getTransaccionesByTurno: (turnoId: number) => Promise<void>;
  getTransacciones: (limit?: number, offset?: number) => Promise<void>;
  getTransaccionesByCategory: (categoria: CategoriaTxn, limit?: number, offset?: number) => Promise<void>;
  updateTransaccion: (
    transaccionId: number,
    valor: number,
    categoria: CategoriaTxn,
    concepto?: string
  ) => Promise<void>;
  deleteTransaccion: (transaccionId: number) => Promise<void>;
  confirmTransaccionAudit: (transaccionId: number, auditorId: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useTransacciones = (): UseTransaccionesState & UseTransaccionesActions => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [total, setTotal] = useState(0);

  const createTransaccion = useCallback(
    async (
      turnoId: number,
      valor: number,
      categoria: CategoriaTxn,
      concepto?: string,
      proveedorId?: number,
      tipoGastoId?: number,
      tipoPagoDigitalId?: number
    ) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const newTransaccion = await transaccionService.createTransaccion(
          turnoId,
          valor,
          categoria,
          concepto,
          proveedorId,
          tipoGastoId,
          tipoPagoDigitalId
        );

        setTransacciones([...transacciones, newTransaccion]);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al crear transacción');
      } finally {
        setIsLoading(false);
      }
    },
    [transacciones]
  );

  const getTransaccionesByTurno = useCallback(async (turnoId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await transaccionService.getTransaccionesByTurno(turnoId);
      setTransacciones(data);
      setTotal(data.length);
    } catch (err: any) {
      setError(err.message || 'Error al obtener transacciones del turno');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransacciones = useCallback(async (limit = 50, offset = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await transaccionService.getTransacciones(limit, offset);
      setTransacciones(data);
      setTotal(data.length);
    } catch (err: any) {
      setError(err.message || 'Error al obtener transacciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransaccionesByCategory = useCallback(
    async (categoria: CategoriaTxn, limit = 50, offset = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await transaccionService.getTransaccionesByCategory(categoria, limit, offset);
        setTransacciones(data);
        setTotal(data.length);
      } catch (err: any) {
        setError(err.message || 'Error al obtener transacciones por categoría');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateTransaccion = useCallback(
    async (
      transaccionId: number,
      valor: number,
      categoria: CategoriaTxn,
      concepto?: string
    ) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const updated = await transaccionService.updateTransaccion(
          transaccionId,
          valor,
          categoria,
          concepto
        );

        setTransacciones(
          transacciones.map((t) => (t.id === transaccionId ? updated : t))
        );
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al actualizar transacción');
      } finally {
        setIsLoading(false);
      }
    },
    [transacciones]
  );

  const deleteTransaccion = useCallback(
    async (transaccionId: number) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await transaccionService.deleteTransaccion(transaccionId);
        setTransacciones(transacciones.filter((t) => t.id !== transaccionId));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al eliminar transacción');
      } finally {
        setIsLoading(false);
      }
    },
    [transacciones]
  );

  const confirmTransaccionAudit = useCallback(
    async (transaccionId: number, auditorId: number) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const updated = await transaccionService.confirmTransaccionAudit(
          transaccionId,
          auditorId
        );

        setTransacciones(
          transacciones.map((t) => (t.id === transaccionId ? updated : t))
        );
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al confirmar transacción');
      } finally {
        setIsLoading(false);
      }
    },
    [transacciones]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setTransacciones([]);
    setError(null);
    setSuccess(false);
    setIsLoading(false);
    setTotal(0);
  }, []);

  return {
    transacciones,
    isLoading,
    error,
    success,
    total,
    createTransaccion,
    getTransaccionesByTurno,
    getTransacciones,
    getTransaccionesByCategory,
    updateTransaccion,
    deleteTransaccion,
    confirmTransaccionAudit,
    clearError,
    reset
  };
};
