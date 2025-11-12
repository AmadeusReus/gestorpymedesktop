/**
 * Tipos TypeScript para GestorPyME
 */

// ===== USUARIO Y AUTENTICACIÓN =====

export interface User {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: 'empleado' | 'supervisor' | 'administrador';
  negocioId: number;
  turno: Turno | null;
}

// ===== TURNO =====

export interface Turno {
  id: number;
  dia_contable_id: number;
  numero_turno: number;
  estado: 'ABIERTO' | 'CERRADO' | 'REVISADO';
  efectivo_contado_turno?: number | null;
  venta_reportada_pos_turno?: number | null;
  diferencia_calculada_turno?: number | null;
  usuario_id?: number;
  usuario_nombre?: string; // Nombre del usuario que creó el turno
  created_at?: string;
}

export interface DiaContable {
  id: number;
  negocio_id: number;
  fecha: string;
  venta_total_pos?: number | null;
  diferencia_final_dia?: number | null;
  estado: 'ABIERTO' | 'REVISADO';
  created_at?: string;
}

// ===== TRANSACCIONES =====

export type CategoriaTxn = 'PAGO_DIGITAL' | 'GASTO_CAJA' | 'COMPRA_PROV' | 'GASTO_GENERAL' | 'AJUSTE_CAJA';

export interface Transaccion {
  id: number;
  turno_id: number | null;
  valor: number;
  categoria: CategoriaTxn;
  concepto?: string | null;
  proveedor_id?: number | null;
  tipo_gasto_id?: number | null;
  tipo_pago_digital_id?: number | null;
  confirmado_auditoria: boolean;
  auditor_id?: number | null;
  created_at?: string;
}

// ===== CATÁLOGOS =====

export interface Proveedor {
  id: number;
  negocio_id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
}

export interface TipoGasto {
  id: number;
  negocio_id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
}

export interface TipoPagoDigital {
  id: number;
  negocio_id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
}

// ===== NEGOCIO =====

export interface Negocio {
  id: number;
  nombre_negocio: string;
  created_at?: string;
}

export interface Miembro {
  id: number;
  usuario_id: number;
  negocio_id: number;
  rol: 'empleado' | 'supervisor' | 'administrador';
  created_at?: string;
}

// ===== RESPUESTAS DE API =====

export interface LoginResponse {
  success: boolean;
  error?: string;
  user?: User;
}

export interface InitTurnoResponse {
  success: boolean;
  error?: string;
  turno?: Turno;
}

export interface GenericResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

// ===== ESTADOS DE UI =====

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// ===== FILTROS Y PAGINACIÓN =====

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  filter?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
