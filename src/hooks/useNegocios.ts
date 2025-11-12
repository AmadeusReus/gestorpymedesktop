// src/hooks/useNegocios.ts

import { useState, useCallback } from 'react';
import { httpClient } from '../api/httpClient';

interface Negocio {
  id: number;
  nombre_negocio: string;
  rol: 'empleado' | 'supervisor' | 'administrador';
}

interface UseNegociosState {
  negocios: Negocio[];
  isLoading: boolean;
  error: string | null;
}

interface UseNegociosActions {
  getNegociosByUser: (userId: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useNegocios = (): UseNegociosState & UseNegociosActions => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNegociosByUser = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await httpClient.invoke<{
        success: boolean;
        negocios?: Negocio[];
        error?: string;
      }>('negocio:getByUser', { userId });

      if (response.success && response.negocios) {
        setNegocios(response.negocios);
      } else {
        setError(response.error || 'Error al obtener negocios');
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener negocios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setNegocios([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    negocios,
    isLoading,
    error,
    getNegociosByUser,
    clearError,
    reset
  };
};
