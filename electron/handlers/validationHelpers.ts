// electron/handlers/validationHelpers.ts

import { query } from '../database';

/**
 * Helper para validaciones comunes en handlers
 * Centraliza la lógica de validación para evitar duplicación
 */

/**
 * Valida que un usuario existe y está activo
 * @throws Error si usuario no existe o está inactivo
 */
export async function validateUserActive(userId: number): Promise<{
  id: number;
  activo: boolean;
}> {
  const result = await query(
    'SELECT id, activo FROM usuarios WHERE id = $1',
    [userId]
  );

  if ((result.rowCount ?? 0) === 0) {
    throw new Error('Usuario no encontrado');
  }

  const user = result.rows[0];

  if (!user.activo) {
    throw new Error('Usuario inactivo');
  }

  return user;
}

/**
 * Valida que un usuario pertenece a un negocio
 * @throws Error si usuario no tiene acceso al negocio
 */
export async function validateUserInNegocio(
  userId: number,
  negocioId: number
): Promise<{
  usuario_id: number;
  negocio_id: number;
  rol: string;
}> {
  const result = await query(
    'SELECT usuario_id, negocio_id, rol FROM miembros WHERE usuario_id = $1 AND negocio_id = $2',
    [userId, negocioId]
  );

  if ((result.rowCount ?? 0) === 0) {
    throw new Error('No tienes acceso a este negocio');
  }

  return result.rows[0];
}

/**
 * Valida que un negocio existe
 * @throws Error si negocio no existe
 */
export async function validateNegocioExists(negocioId: number): Promise<{
  id: number;
  nombre_negocio: string;
}> {
  const result = await query(
    'SELECT id, nombre_negocio FROM negocios WHERE id = $1',
    [negocioId]
  );

  if ((result.rowCount ?? 0) === 0) {
    throw new Error('Negocio no encontrado');
  }

  return result.rows[0];
}

/**
 * Valida que un parámetro numérico es válido
 * @throws Error si número no es válido
 */
export function validatePositiveNumber(value: number | undefined, fieldName: string): number {
  if (value === undefined || value === null || value <= 0) {
    throw new Error(`${fieldName} inválido`);
  }
  return value;
}

/**
 * Validación completa: usuario activo + en negocio
 * @throws Error si alguna validación falla
 */
export async function validateUserAccessToNegocio(
  userId: number,
  negocioId: number
): Promise<{ user: any; member: any; negocio: any }> {
  const user = await validateUserActive(userId);
  const member = await validateUserInNegocio(userId, negocioId);
  const negocio = await validateNegocioExists(negocioId);

  return { user, member, negocio };
}

/**
 * Wrapper para convertir errores de validación en respuesta IPC
 */
export function handleValidationError(error: any): {
  success: boolean;
  error: string;
} {
  const message = error instanceof Error ? error.message : 'Error desconocido';
  return {
    success: false,
    error: message
  };
}
