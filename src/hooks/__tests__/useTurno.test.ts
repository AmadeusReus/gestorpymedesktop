import { renderHook, act, waitFor } from '@testing-library/react';
import { useTurno } from '../useTurno';
import * as turnoServiceModule from '../../api';

// Mock del servicio
jest.mock('../../api', () => ({
  turnoService: {
    initTurno: jest.fn(),
    getCurrentTurno: jest.fn(),
    closeTurno: jest.fn(),
    getTurno: jest.fn(),
  },
}));

const mockTurnoService = turnoServiceModule.turnoService as jest.Mocked<typeof turnoServiceModule.turnoService>;

describe('useTurno Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with null turno and no error', () => {
    const { result } = renderHook(() => useTurno());

    expect(result.current.turno).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  it('has all expected methods', () => {
    const { result } = renderHook(() => useTurno());

    expect(typeof result.current.initTurno).toBe('function');
    expect(typeof result.current.getCurrentTurno).toBe('function');
    expect(typeof result.current.closeTurno).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('initializes turno successfully', async () => {
    const mockTurno = {
      id: 1,
      numero_turno: 1,
      estado: 'abierto',
      dia_contable_id: 1,
    };

    mockTurnoService.initTurno.mockResolvedValue(mockTurno);
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      await result.current.initTurno(1);
    });

    expect(result.current.turno).toEqual(mockTurno);
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('sets error on init turno failure', async () => {
    mockTurnoService.initTurno.mockRejectedValue(
      new Error('Error al inicializar')
    );
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      const response = await result.current.initTurno(1);
      expect(response.success).toBe(false);
    });

    expect(result.current.turno).toBeNull();
    expect(result.current.error).toBe('Error al inicializar');
  });

  it('gets current turno', async () => {
    const mockTurno = {
      id: 1,
      numero_turno: 1,
      estado: 'abierto',
      dia_contable_id: 1,
    };

    mockTurnoService.getCurrentTurno.mockResolvedValue(mockTurno);
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      await result.current.getCurrentTurno(1);
    });

    expect(result.current.turno).toEqual(mockTurno);
    expect(result.current.error).toBeNull();
  });

  it('handles not found error gracefully on getCurrentTurno', async () => {
    mockTurnoService.getCurrentTurno.mockRejectedValue(
      new Error('No encontrado')
    );
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      await result.current.getCurrentTurno(1);
    });

    expect(result.current.turno).toBeNull();
    expect(result.current.error).toBeNull(); // Error is cleared for "not found"
  });

  it('closes turno successfully', async () => {
    const mockTurno = {
      id: 1,
      numero_turno: 1,
      estado: 'abierto',
      dia_contable_id: 1,
    };

    const closedTurno = {
      ...mockTurno,
      estado: 'cerrado',
    };

    mockTurnoService.closeTurno.mockResolvedValue(closedTurno);
    const { result } = renderHook(() => useTurno());

    // Set initial turno
    await act(async () => {
      mockTurnoService.getCurrentTurno.mockResolvedValue(mockTurno);
      await result.current.getCurrentTurno(1);
    });

    // Close turno
    await act(async () => {
      await result.current.closeTurno(1);
    });

    expect(result.current.turno).toEqual(closedTurno);
    expect(result.current.success).toBe(true);
  });

  it('returns error when closing without active turno', async () => {
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      const response = await result.current.closeTurno(1);
      expect(response.success).toBe(false);
    });

    expect(result.current.error).toBe('No hay turno activo para cerrar');
  });

  it('refreshes turno data', async () => {
    const mockTurno = {
      id: 1,
      numero_turno: 1,
      estado: 'abierto',
      dia_contable_id: 1,
    };

    const refreshedTurno = {
      ...mockTurno,
      estado: 'en proceso',
    };

    // Set initial turno
    mockTurnoService.getCurrentTurno.mockResolvedValue(mockTurno);
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      await result.current.getCurrentTurno(1);
    });

    // Refresh with updated data
    mockTurnoService.getTurno.mockResolvedValue(refreshedTurno);
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.turno).toEqual(refreshedTurno);
  });

  it('clears error', async () => {
    mockTurnoService.initTurno.mockRejectedValue(
      new Error('Test error')
    );
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      await result.current.initTurno(1);
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('resets all state', async () => {
    const mockTurno = {
      id: 1,
      numero_turno: 1,
      estado: 'abierto',
      dia_contable_id: 1,
    };

    mockTurnoService.getCurrentTurno.mockResolvedValue(mockTurno);
    const { result } = renderHook(() => useTurno());

    await act(async () => {
      await result.current.getCurrentTurno(1);
    });

    expect(result.current.turno).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.turno).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets loading state during operations', async () => {
    const mockTurno = {
      id: 1,
      numero_turno: 1,
      estado: 'abierto',
      dia_contable_id: 1,
    };

    mockTurnoService.initTurno.mockResolvedValue(mockTurno);
    const { result } = renderHook(() => useTurno());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.initTurno(1);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
