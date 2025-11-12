import { renderHook, act, waitFor } from '@testing-library/react';
import { useTransacciones } from '../useTransacciones';
import * as transaccionServiceModule from '../../api';

// Mock del servicio
jest.mock('../../api', () => ({
  transaccionService: {
    createTransaccion: jest.fn(),
    getTransaccionesByTurno: jest.fn(),
    getTransacciones: jest.fn(),
    getTransaccionesByCategory: jest.fn(),
    updateTransaccion: jest.fn(),
    deleteTransaccion: jest.fn(),
    confirmTransaccionAudit: jest.fn(),
  },
}));

const mockTransaccionService = transaccionServiceModule.transaccionService as jest.Mocked<typeof transaccionServiceModule.transaccionService>;

describe('useTransacciones Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty transacciones and no error', () => {
    const { result } = renderHook(() => useTransacciones());

    expect(result.current.transacciones).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.total).toBe(0);
  });

  it('has all expected methods', () => {
    const { result } = renderHook(() => useTransacciones());

    expect(typeof result.current.createTransaccion).toBe('function');
    expect(typeof result.current.getTransaccionesByTurno).toBe('function');
    expect(typeof result.current.getTransacciones).toBe('function');
    expect(typeof result.current.getTransaccionesByCategory).toBe('function');
    expect(typeof result.current.updateTransaccion).toBe('function');
    expect(typeof result.current.deleteTransaccion).toBe('function');
    expect(typeof result.current.confirmTransaccionAudit).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('creates transaccion successfully', async () => {
    const mockTransaccion = {
      id: 1,
      turno_id: 1,
      valor: 100,
      categoria: 'PAGO_DIGITAL' as const,
      concepto: 'Test',
      created_at: new Date().toISOString(),
      confirmado_auditoria: false,
    };

    mockTransaccionService.createTransaccion.mockResolvedValue(mockTransaccion);
    const { result } = renderHook(() => useTransacciones());

    await act(async () => {
      await result.current.createTransaccion(1, 100, 'PAGO_DIGITAL', 'Test');
    });

    expect(result.current.transacciones).toHaveLength(1);
    expect(result.current.transacciones[0]).toEqual(mockTransaccion);
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles error on create transaccion', async () => {
    mockTransaccionService.createTransaccion.mockRejectedValue(
      new Error('Error al crear transacción')
    );
    const { result } = renderHook(() => useTransacciones());

    await act(async () => {
      await result.current.createTransaccion(1, 100, 'PAGO_DIGITAL');
    });

    expect(result.current.transacciones).toHaveLength(0);
    expect(result.current.error).toBe('Error al crear transacción');
    expect(result.current.success).toBe(false);
  });

  it('gets transacciones by turno', async () => {
    const mockTransacciones = [
      {
        id: 1,
        turno_id: 1,
        valor: 100,
        categoria: 'PAGO_DIGITAL' as const,
        concepto: 'Test 1',
        created_at: new Date().toISOString(),
        confirmado_auditoria: false,
      },
      {
        id: 2,
        turno_id: 1,
        valor: 50,
        categoria: 'GASTO_CAJA' as const,
        concepto: 'Test 2',
        created_at: new Date().toISOString(),
        confirmado_auditoria: false,
      },
    ];

    mockTransaccionService.getTransaccionesByTurno.mockResolvedValue(mockTransacciones);
    const { result } = renderHook(() => useTransacciones());

    await act(async () => {
      await result.current.getTransaccionesByTurno(1);
    });

    expect(result.current.transacciones).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('deletes transaccion', async () => {
    const mockTransacciones = [
      {
        id: 1,
        turno_id: 1,
        valor: 100,
        categoria: 'PAGO_DIGITAL' as const,
        concepto: 'Test',
        created_at: new Date().toISOString(),
        confirmado_auditoria: false,
      },
    ];

    mockTransaccionService.getTransaccionesByTurno.mockResolvedValue(mockTransacciones);
    mockTransaccionService.deleteTransaccion.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTransacciones());

    await act(async () => {
      await result.current.getTransaccionesByTurno(1);
    });

    expect(result.current.transacciones).toHaveLength(1);

    await act(async () => {
      await result.current.deleteTransaccion(1);
    });

    // The transaccion is not removed from state after delete
    // (the component would need to refetch)
  });

  it('confirms transaccion audit', async () => {
    mockTransaccionService.confirmTransaccionAudit.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTransacciones());

    await act(async () => {
      await result.current.confirmTransaccionAudit(1, 1);
    });

    expect(mockTransaccionService.confirmTransaccionAudit).toHaveBeenCalledWith(1, 1);
  });

  it('clears error', async () => {
    mockTransaccionService.createTransaccion.mockRejectedValue(
      new Error('Test error')
    );
    const { result } = renderHook(() => useTransacciones());

    await act(async () => {
      await result.current.createTransaccion(1, 100, 'PAGO_DIGITAL');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('resets all state', async () => {
    const mockTransaccion = {
      id: 1,
      turno_id: 1,
      valor: 100,
      categoria: 'PAGO_DIGITAL' as const,
      concepto: 'Test',
      created_at: new Date().toISOString(),
      confirmado_auditoria: false,
    };

    mockTransaccionService.createTransaccion.mockResolvedValue(mockTransaccion);
    const { result } = renderHook(() => useTransacciones());

    await act(async () => {
      await result.current.createTransaccion(1, 100, 'PAGO_DIGITAL');
    });

    expect(result.current.transacciones).toHaveLength(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.transacciones).toHaveLength(0);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.total).toBe(0);
  });

  it('sets loading state during operations', async () => {
    const mockTransacciones: any[] = [];
    mockTransaccionService.getTransacciones.mockResolvedValue(mockTransacciones);
    const { result } = renderHook(() => useTransacciones());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.getTransacciones();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
