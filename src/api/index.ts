// src/api/index.ts

/**
 * Punto de entrada para todos los servicios de API
 */

export { httpClient } from './httpClient';
export type { IpcResponse } from './httpClient';

export { turnoService } from './turnoService';
export { transaccionService } from './transaccionService';
export { catalogoService } from './catalogoService';
