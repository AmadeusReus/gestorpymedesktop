// src/hooks/useAuditoria.ts

import { useState, useCallback } from 'react';
import { Transaccion, Turno } from '../types';
import { turnoService, transaccionService } from '../api';

interface AuditoriaStats {
  totalTransacciones: number;
  transaccionesConfirmadas: number;
  transaccionesPendientes: number;
  diferenciasEncontradas: number;
  totalAuditado: number;
}

interface UseAuditoriaState {
  turnos: Turno[];
  transacciones: Transaccion[];
  stats: AuditoriaStats;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseAuditoriaActions {
  getTurnosByDay: (diaContableId: number) => Promise<void>;
  getTransaccionesByTurno: (turnoId: number) => Promise<void>;
  confirmTurnoAudit: (turnoId: number, auditorId: number) => Promise<void>;
  confirmTransaccionAudit: (transaccionId: number, auditorId: number) => Promise<void>;
  getAuditoriaStats: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useAuditoria = (): UseAuditoriaState & UseAuditoriaActions => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [stats, setStats] = useState<AuditoriaStats>({
    totalTransacciones: 0,
    transaccionesConfirmadas: 0,
    transaccionesPendientes: 0,
    diferenciasEncontradas: 0,
    totalAuditado: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getTurnosByDay = useCallback(async (diaContableId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await turnoService.getTurnosByDay(diaContableId);
      setTurnos(data);
      getAuditoriaStats();
    } catch (err: any) {
      setError(err.message || 'Error al obtener turnos del día');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransaccionesByTurno = useCallback(async (turnoId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await transaccionService.getTransaccionesByTurno(turnoId);
      setTransacciones(data);
      getAuditoriaStats();
    } catch (err: any) {
      setError(err.message || 'Error al obtener transacciones del turno');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmTurnoAudit = useCallback(
    async (turnoId: number, auditorId: number) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const updated = await turnoService.confirmTurnoAudit(turnoId, auditorId);
        setTurnos(turnos.map((t) => (t.id === turnoId ? updated : t)));
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al confirmar turno');
      } finally {
        setIsLoading(false);
      }
    },
    [turnos]
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

  const getAuditoriaStats = useCallback(() => {
    const totalTransacciones = transacciones.length;
    const transaccionesConfirmadas = transacciones.filter(
      (t) => t.confirmado_auditoria
    ).length;
    const transaccionesPendientes = totalTransacciones - transaccionesConfirmadas;

    const totalAuditado = transacciones
      .filter((t) => t.confirmado_auditoria)
      .reduce((sum, t) => sum + t.valor, 0);

    // Calcular diferencias en turnos
    const diferenciasEncontradas = turnos.filter(
      (t) =>
        t.diferencia_calculada_turno &&
        Math.abs(t.diferencia_calculada_turno) > 0
    ).length;

    setStats({
      totalTransacciones,
      transaccionesConfirmadas,
      transaccionesPendientes,
      diferenciasEncontradas,
      totalAuditado
    });
  }, [transacciones, turnos]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setTurnos([]);
    setTransacciones([]);
    setStats({
      totalTransacciones: 0,
      transaccionesConfirmadas: 0,
      transaccionesPendientes: 0,
      diferenciasEncontradas: 0,
      totalAuditado: 0
    });
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    turnos,
    transacciones,
    stats,
    isLoading,
    error,
    success,
    getTurnosByDay,
    getTransaccionesByTurno,
    confirmTurnoAudit,
    confirmTransaccionAudit,
    getAuditoriaStats,
    clearError,
    reset
  };
};
