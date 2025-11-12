import { renderHook, act, waitFor } from '@testing-library/react';
import { useCatalogos } from '../useCatalogos';
import * as catalogoServiceModule from '../../api';

// Mock del servicio
jest.mock('../../api', () => ({
  catalogoService: {
    // Proveedores
    getProveedores: jest.fn(),
    createProveedor: jest.fn(),
    updateProveedor: jest.fn(),
    deleteProveedor: jest.fn(),
    // Tipos de Gasto
    getTiposGasto: jest.fn(),
    createTipoGasto: jest.fn(),
    updateTipoGasto: jest.fn(),
    deleteTipoGasto: jest.fn(),
    // Tipos de Pago Digital
    getTiposPagoDigital: jest.fn(),
    createTipoPagoDigital: jest.fn(),
    updateTipoPagoDigital: jest.fn(),
    deleteTipoPagoDigital: jest.fn(),
  },
}));

const mockCatalogoService = catalogoServiceModule.catalogoService as jest.Mocked<typeof catalogoServiceModule.catalogoService>;

describe('useCatalogos Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty catalogs and no error', () => {
    const { result } = renderHook(() => useCatalogos());

    expect(result.current.proveedores).toEqual([]);
    expect(result.current.tiposGasto).toEqual([]);
    expect(result.current.tiposPagoDigital).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  it('has all expected methods', () => {
    const { result } = renderHook(() => useCatalogos());

    expect(typeof result.current.getProveedores).toBe('function');
    expect(typeof result.current.createProveedor).toBe('function');
    expect(typeof result.current.updateProveedor).toBe('function');
    expect(typeof result.current.deleteProveedor).toBe('function');
    expect(typeof result.current.getTiposGasto).toBe('function');
    expect(typeof result.current.createTipoGasto).toBe('function');
    expect(typeof result.current.updateTipoGasto).toBe('function');
    expect(typeof result.current.deleteTipoGasto).toBe('function');
    expect(typeof result.current.getTiposPagoDigital).toBe('function');
    expect(typeof result.current.createTipoPagoDigital).toBe('function');
    expect(typeof result.current.updateTipoPagoDigital).toBe('function');
    expect(typeof result.current.deleteTipoPagoDigital).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('loads proveedores', async () => {
    const mockProveedores = [
      { id: 1, nombre: 'Proveedor 1', activo: true, negocio_id: 1 },
      { id: 2, nombre: 'Proveedor 2', activo: true, negocio_id: 1 },
    ];

    mockCatalogoService.getProveedores.mockResolvedValue(mockProveedores);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.getProveedores(1);
    });

    expect(result.current.proveedores).toEqual(mockProveedores);
    expect(result.current.error).toBeNull();
  });

  it('creates proveedor', async () => {
    const mockProveedor = {
      id: 1,
      nombre: 'New Proveedor',
      activo: true,
      negocio_id: 1,
    };

    mockCatalogoService.createProveedor.mockResolvedValue(mockProveedor);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.createProveedor(1, 'New Proveedor');
    });

    expect(mockCatalogoService.createProveedor).toHaveBeenCalledWith(
      1,
      'New Proveedor'
    );
    expect(result.current.success).toBe(true);
  });

  it('updates proveedor', async () => {
    const mockProveedor = {
      id: 1,
      nombre: 'Updated Proveedor',
      activo: false,
      negocio_id: 1,
    };

    mockCatalogoService.updateProveedor.mockResolvedValue(mockProveedor);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.updateProveedor(1, 'Updated Proveedor', false);
    });

    expect(mockCatalogoService.updateProveedor).toHaveBeenCalledWith(
      1,
      'Updated Proveedor',
      false
    );
  });

  it('deletes proveedor', async () => {
    mockCatalogoService.deleteProveedor.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.deleteProveedor(1);
    });

    expect(mockCatalogoService.deleteProveedor).toHaveBeenCalledWith(1);
  });

  it('loads tipos gasto', async () => {
    const mockTiposGasto = [
      { id: 1, nombre: 'Gasto 1', activo: true, negocio_id: 1 },
      { id: 2, nombre: 'Gasto 2', activo: true, negocio_id: 1 },
    ];

    mockCatalogoService.getTiposGasto.mockResolvedValue(mockTiposGasto);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.getTiposGasto(1);
    });

    expect(result.current.tiposGasto).toEqual(mockTiposGasto);
  });

  it('creates tipo gasto', async () => {
    const mockTipoGasto = {
      id: 1,
      nombre: 'New Gasto',
      activo: true,
      negocio_id: 1,
    };

    mockCatalogoService.createTipoGasto.mockResolvedValue(mockTipoGasto);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.createTipoGasto(1, 'New Gasto');
    });

    expect(result.current.success).toBe(true);
  });

  it('loads tipos pago digital', async () => {
    const mockTiposPago = [
      { id: 1, nombre: 'Nequi', activo: true, negocio_id: 1 },
      { id: 2, nombre: 'Bancolombia', activo: true, negocio_id: 1 },
    ];

    mockCatalogoService.getTiposPagoDigital.mockResolvedValue(mockTiposPago);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.getTiposPagoDigital(1);
    });

    expect(result.current.tiposPagoDigital).toEqual(mockTiposPago);
  });

  it('creates tipo pago digital', async () => {
    const mockTipoPago = {
      id: 1,
      nombre: 'New Pago',
      activo: true,
      negocio_id: 1,
    };

    mockCatalogoService.createTipoPagoDigital.mockResolvedValue(mockTipoPago);
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.createTipoPagoDigital(1, 'New Pago');
    });

    expect(result.current.success).toBe(true);
  });

  it('handles errors', async () => {
    mockCatalogoService.getProveedores.mockRejectedValue(
      new Error('Failed to load')
    );
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.getProveedores(1);
    });

    expect(result.current.error).toBe('Failed to load');
  });

  it('clears error', async () => {
    mockCatalogoService.getProveedores.mockRejectedValue(
      new Error('Test error')
    );
    const { result } = renderHook(() => useCatalogos());

    await act(async () => {
      await result.current.getProveedores(1);
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('sets loading state during operations', async () => {
    mockCatalogoService.getProveedores.mockResolvedValue([]);
    const { result } = renderHook(() => useCatalogos());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.getProveedores(1);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
