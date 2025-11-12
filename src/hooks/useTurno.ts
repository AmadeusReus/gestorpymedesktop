// src/hooks/useTurno.ts

import { useState, useCallback } from 'react';
import { Turno } from '../types';
import { turnoService } from '../api';

interface UseTurnoState {
  turno: Turno | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseTurnoActions {
  initTurno: (negocioId: number) => Promise<{ success: boolean; message?: string }>;
  getCurrentTurno: (negocioId: number) => Promise<void>;
  closeTurno: (turnoId: number, ventaReportada?: number, efectivoContado?: number, diferenciaCalculada?: number) => Promise<{ success: boolean; message?: string }>;
  getTurnosHistory: (limit?: number, offset?: number) => Promise<Turno[]>;
  refresh: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
  reset: () => void;
}

export const useTurno = (): UseTurnoState & UseTurnoActions => {
  const [turno, setTurno] = useState<Turno | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initTurno = useCallback(async (negocioId: number) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const newTurno = await turnoService.initTurno(negocioId);
      setTurno(newTurno);
      setSuccess(true);
      return { success: true };
    } catch (err: any) {
      const message = err.message || 'Error al inicializar turno';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentTurno = useCallback(async (negocioId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentTurno = await turnoService.getCurrentTurno(negocioId);
      setTurno(currentTurno);
    } catch (err: any) {
      setError(err.message || 'Error al obtener turno actual');
      // No mostrar error si no existe turno (es normal para el primer turno del día)
      if (err.message?.includes('No encontrado')) {
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeTurno = useCallback(
    async (turnoId: number, ventaReportada?: number, efectivoContado?: number, diferenciaCalculada?: number) => {
      if (!turno) {
        setError('No hay turno activo para cerrar');
        return { success: false, message: 'No hay turno activo' };
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const closedTurno = await turnoService.closeTurno(turnoId, ventaReportada, efectivoContado, diferenciaCalculada);
        setTurno(closedTurno);
        setSuccess(true);
        return { success: true };
      } catch (err: any) {
        const message = err.message || 'Error al cerrar turno';
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [turno]
  );

  const getTurnosHistory = useCallback(async (limit: number = 10, offset: number = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const turnos = await turnoService.getTurnosHistory(limit, offset);
      return turnos;
    } catch (err: any) {
      setError(err.message || 'Error al obtener historial de turnos');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (turno) {
      try {
        const refreshedTurno = await turnoService.getTurno(turno.id);
        setTurno(refreshedTurno);
      } catch (err: any) {
        setError(err.message || 'Error al actualizar turno');
      }
    }
  }, [turno]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  const reset = useCallback(() => {
    setTurno(null);
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    turno,
    isLoading,
    error,
    success,
    initTurno,
    getCurrentTurno,
    closeTurno,
    getTurnosHistory,
    refresh,
    clearError,
    clearSuccess,
    reset
  };
};
