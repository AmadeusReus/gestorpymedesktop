// electron/handlers/catalogoHandlers.ts

import { ipcMain } from 'electron';
import { query } from '../database';

/**
 * Registra todos los manejadores IPC relacionados con Catálogos.
 */
export function registerCatalogoHandlers() {
  // Proveedores
  ipcMain.handle('catalogo:getProveedores', handleGetProveedores);
  ipcMain.handle('catalogo:createProveedor', handleCreateProveedor);
  ipcMain.handle('catalogo:updateProveedor', handleUpdateProveedor);
  ipcMain.handle('catalogo:deleteProveedor', handleDeleteProveedor);

  // Tipos de Gasto
  ipcMain.handle('catalogo:getTiposGasto', handleGetTiposGasto);
  ipcMain.handle('catalogo:createTipoGasto', handleCreateTipoGasto);
  ipcMain.handle('catalogo:updateTipoGasto', handleUpdateTipoGasto);
  ipcMain.handle('catalogo:deleteTipoGasto', handleDeleteTipoGasto);

  // Tipos de Pago Digital
  ipcMain.handle('catalogo:getTiposPagoDigital', handleGetTiposPagoDigital);
  ipcMain.handle('catalogo:createTipoPagoDigital', handleCreateTipoPagoDigital);
  ipcMain.handle('catalogo:updateTipoPagoDigital', handleUpdateTipoPagoDigital);
  ipcMain.handle('catalogo:deleteTipoPagoDigital', handleDeleteTipoPagoDigital);

  console.log('   -> [Handler] Catalogo Handlers registrados.');
}

// ===== PROVEEDORES =====

async function handleGetProveedores(
  _event: unknown,
  args: { negocioId: number } | number
): Promise<Record<string, unknown>[]> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const negocioId = typeof args === 'object' ? args.negocioId : args;

    if (!negocioId) {
      throw new Error('ID de negocio es requerido');
    }

    const result = await query(
      `SELECT * FROM proveedores WHERE negocio_id = $1 ORDER BY nombre ASC`,
      [negocioId]
    );

    return (result.rows ?? []) as Record<string, unknown>[];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al obtener proveedores';
    throw new Error(errorMessage);
  }
}

async function handleCreateProveedor(
  _event: unknown,
  args: { negocioId: number; nombre: string }
): Promise<Record<string, unknown>> {
  try {
    const { negocioId, nombre } = args;

    if (!negocioId || !nombre) {
      throw new Error('Negocio e nombre son requeridos');
    }

    const result = await query(
      `INSERT INTO proveedores (negocio_id, nombre, activo)
       VALUES ($1, $2, TRUE)
       RETURNING *`,
      [negocioId, nombre]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('No se pudo crear el proveedor');
    }

    return result.rows[0] as Record<string, unknown>;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al crear proveedor';
    throw new Error(errorMessage);
  }
}

async function handleUpdateProveedor(
  _event: unknown,
  args: { proveedorId: number; nombre: string; activo: boolean }
): Promise<Record<string, unknown>> {
  try {
    const { proveedorId, nombre, activo } = args;

    if (!proveedorId || !nombre) {
      throw new Error('ID y nombre de proveedor son requeridos');
    }

    const result = await query(
      `UPDATE proveedores
       SET nombre = $1, activo = $2
       WHERE id = $3
       RETURNING *`,
      [nombre, activo, proveedorId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('Proveedor no encontrado');
    }

    return result.rows[0] as Record<string, unknown>;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al actualizar proveedor';
    throw new Error(errorMessage);
  }
}

async function handleDeleteProveedor(
  _event: unknown,
  args: { proveedorId: number } | number
): Promise<Record<string, unknown>> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const proveedorId = typeof args === 'object' ? args.proveedorId : args;

    if (!proveedorId) {
      throw new Error('ID de proveedor es requerido');
    }

    const result = await query(
      `DELETE FROM proveedores WHERE id = $1 RETURNING *`,
      [proveedorId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('Proveedor no encontrado');
    }

    return { success: true, deletedId: proveedorId };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al eliminar proveedor';
    throw new Error(errorMessage);
  }
}

// ===== TIPOS DE GASTO =====

async function handleGetTiposGasto(
  _event: unknown,
  args: { negocioId: number } | number
): Promise<Record<string, unknown>[]> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const negocioId = typeof args === 'object' ? args.negocioId : args;

    if (!negocioId) {
      throw new Error('ID de negocio es requerido');
    }

    const result = await query(
      `SELECT * FROM tipos_gasto WHERE negocio_id = $1 ORDER BY nombre ASC`,
      [negocioId]
    );

    return (result.rows ?? []) as Record<string, unknown>[];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al obtener tipos de gasto';
    throw new Error(errorMessage);
  }
}

async function handleCreateTipoGasto(
  _event: unknown,
  args: { negocioId: number; nombre: string }
): Promise<Record<string, unknown>> {
  try {
    const { negocioId, nombre } = args;

    if (!negocioId || !nombre) {
      throw new Error('Negocio y nombre son requeridos');
    }

    const result = await query(
      `INSERT INTO tipos_gasto (negocio_id, nombre, activo)
       VALUES ($1, $2, TRUE)
       RETURNING *`,
      [negocioId, nombre]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('No se pudo crear el tipo de gasto');
    }

    return result.rows[0] as Record<string, unknown>;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al crear tipo de gasto';
    throw new Error(errorMessage);
  }
}

async function handleUpdateTipoGasto(
  _event: unknown,
  args: { tipoGastoId: number; nombre: string; activo: boolean }
): Promise<Record<string, unknown>> {
  try {
    const { tipoGastoId, nombre, activo } = args;

    if (!tipoGastoId || !nombre) {
      throw new Error('ID y nombre del tipo de gasto son requeridos');
    }

    const result = await query(
      `UPDATE tipos_gasto
       SET nombre = $1, activo = $2
       WHERE id = $3
       RETURNING *`,
      [nombre, activo, tipoGastoId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('Tipo de gasto no encontrado');
    }

    return result.rows[0] as Record<string, unknown>;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tipo de gasto';
    throw new Error(errorMessage);
  }
}

async function handleDeleteTipoGasto(
  _event: unknown,
  args: { tipoGastoId: number } | number
): Promise<Record<string, unknown>> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const tipoGastoId = typeof args === 'object' ? args.tipoGastoId : args;

    if (!tipoGastoId) {
      throw new Error('ID de tipo de gasto es requerido');
    }

    const result = await query(
      `DELETE FROM tipos_gasto WHERE id = $1 RETURNING *`,
      [tipoGastoId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('Tipo de gasto no encontrado');
    }

    return { success: true, deletedId: tipoGastoId };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tipo de gasto';
    throw new Error(errorMessage);
  }
}

// ===== TIPOS DE PAGO DIGITAL =====

async function handleGetTiposPagoDigital(
  _event: unknown,
  args: { negocioId: number } | number
): Promise<Record<string, unknown>[]> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const negocioId = typeof args === 'object' ? args.negocioId : args;

    if (!negocioId) {
      throw new Error('ID de negocio es requerido');
    }

    const result = await query(
      `SELECT * FROM tipos_pago_digital WHERE negocio_id = $1 ORDER BY nombre ASC`,
      [negocioId]
    );

    return (result.rows ?? []) as Record<string, unknown>[];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al obtener tipos de pago digital';
    throw new Error(errorMessage);
  }
}

async function handleCreateTipoPagoDigital(
  _event: unknown,
  args: { negocioId: number; nombre: string }
): Promise<Record<string, unknown>> {
  try {
    const { negocioId, nombre } = args;

    if (!negocioId || !nombre) {
      throw new Error('Negocio y nombre son requeridos');
    }

    const result = await query(
      `INSERT INTO tipos_pago_digital (negocio_id, nombre, activo)
       VALUES ($1, $2, TRUE)
       RETURNING *`,
      [negocioId, nombre]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('No se pudo crear el tipo de pago digital');
    }

    return result.rows[0] as Record<string, unknown>;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al crear tipo de pago digital';
    throw new Error(errorMessage);
  }
}

async function handleUpdateTipoPagoDigital(
  _event: unknown,
  args: { tipoPagoDigitalId: number; nombre: string; activo: boolean }
): Promise<Record<string, unknown>> {
  try {
    const { tipoPagoDigitalId, nombre, activo } = args;

    if (!tipoPagoDigitalId || !nombre) {
      throw new Error('ID y nombre del tipo de pago digital son requeridos');
    }

    const result = await query(
      `UPDATE tipos_pago_digital
       SET nombre = $1, activo = $2
       WHERE id = $3
       RETURNING *`,
      [nombre, activo, tipoPagoDigitalId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('Tipo de pago digital no encontrado');
    }

    return result.rows[0] as Record<string, unknown>;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tipo de pago digital';
    throw new Error(errorMessage);
  }
}

async function handleDeleteTipoPagoDigital(
  _event: unknown,
  args: { tipoPagoDigitalId: number } | number
): Promise<Record<string, unknown>> {
  try {
    // Soportar tanto formato de objeto como número directo para compatibilidad
    const tipoPagoDigitalId = typeof args === 'object' ? args.tipoPagoDigitalId : args;

    if (!tipoPagoDigitalId) {
      throw new Error('ID de tipo de pago digital es requerido');
    }

    const result = await query(
      `DELETE FROM tipos_pago_digital WHERE id = $1 RETURNING *`,
      [tipoPagoDigitalId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error('Tipo de pago digital no encontrado');
    }

    return { success: true, deletedId: tipoPagoDigitalId };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tipo de pago digital';
    throw new Error(errorMessage);
  }
}
