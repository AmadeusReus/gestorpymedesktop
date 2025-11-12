// src/screens/TransaccionesScreen.tsx

import React, { useEffect, useState } from 'react';
import { User } from '../hooks/useAuth';
import { useTransacciones } from '../hooks/useTransacciones';
import { useTurno } from '../hooks/useTurno';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import Tooltip from '../components/Common/Tooltip';
import Pagination from '../components/Common/Pagination';
import '../styles/screens/TransaccionesScreen.css';

interface TransaccionesScreenProps {
  user: User;
  onNavigate?: (screen: string) => void;
}

/**
 * PANTALLA DE TRANSACCIONES
 *
 * Roles:
 * - EMPLEADO: Ve sus transacciones del turno, puede crear nuevas
 * - SUPERVISOR: Ve todas las transacciones del día, puede auditar
 * - ADMIN: Ve todas las transacciones, gestión completa
 *
 * Categorías de Transacción:
 * - PAGO_DIGITAL: Pagos por nequi, bancolombia, etc
 * - GASTO_CAJA: Gastos de caja
 * - COMPRA_PROV: Compras a proveedores
 * - GASTO_GENERAL: Gastos generales
 * - AJUSTE_CAJA: Ajustes de caja
 */

const CATEGORIAS = [
  { value: 'PAGO_DIGITAL', label: 'Pago Digital' },
  { value: 'GASTO_CAJA', label: 'Gasto de Caja' },
  { value: 'COMPRA_PROV', label: 'Compra a Proveedor' },
  { value: 'GASTO_GENERAL', label: 'Gasto General' },
  { value: 'AJUSTE_CAJA', label: 'Ajuste de Caja' },
];

const TransaccionesScreen: React.FC<TransaccionesScreenProps> = ({
  user,
}) => {
  const { turno, isLoading: turnoLoading } = useTurno();
  const {
    transacciones,
    isLoading,
    error,
    success,
    getTransaccionesByTurno,
    createTransaccion,
    deleteTransaccion,
    confirmTransaccionAudit,
    clearError,
  } = useTransacciones();

  const [showForm, setShowForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    valor: '',
    categoria: 'PAGO_DIGITAL',
    concepto: '',
    proveedor_id: null as number | null,
    tipo_gasto_id: null as number | null,
    tipo_pago_digital_id: null as number | null,
  });

  // Cargar transacciones del turno actual
  useEffect(() => {
    if (turno?.id) {
      loadTransacciones();
    }
  }, [turno?.id]);

  const loadTransacciones = async () => {
    if (turno?.id) {
      await getTransaccionesByTurno(turno.id);
    }
  };

  const handleCreateTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validar turno
    if (!turno?.id) {
      setValidationError('No hay turno activo. Por favor crea un turno primero.');
      return;
    }

    // Validar valor
    const valor = parseFloat(formData.valor);
    if (!formData.valor || isNaN(valor) || valor <= 0) {
      setValidationError('El valor debe ser un número mayor a 0');
      return;
    }

    // Validar máximo
    if (valor > 9999999.99) {
      setValidationError('El valor no puede exceder 9,999,999.99');
      return;
    }

    try {
      clearError();
      await createTransaccion(
        turno.id,
        valor,
        formData.categoria as any,
        formData.concepto || undefined,
        formData.proveedor_id ?? undefined,
        formData.tipo_gasto_id ?? undefined,
        formData.tipo_pago_digital_id ?? undefined
      );

      setFormData({
        valor: '',
        categoria: 'PAGO_DIGITAL',
        concepto: '',
        proveedor_id: null,
        tipo_gasto_id: null,
        tipo_pago_digital_id: null,
      });
      setShowForm(false);
      await loadTransacciones();
    } catch (err: any) {
      setValidationError(err.message || 'Error al crear la transacción');
      console.error('Error creating transaction:', err);
    }
  };

  const handleDeleteTransaccion = async (transaccionId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      return;
    }

    try {
      setValidationError(null);
      clearError();
      await deleteTransaccion(transaccionId);
      await loadTransacciones();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleConfirmAudit = async (transaccionId: number) => {
    try {
      clearError();
      await confirmTransaccionAudit(transaccionId, user.id);
      await loadTransacciones();
    } catch (err) {
      console.error('Error confirming audit:', err);
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    return (
      CATEGORIAS.find((c) => c.value === categoria)?.label || categoria
    );
  };

  // Filtrar transacciones
  const filteredTransacciones = transacciones.filter((t: any) => {
    const conceptoMatch = !searchTerm || (t.concepto || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoriaMatch = !filterCategoria || t.categoria === filterCategoria;
    return conceptoMatch && categoriaMatch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredTransacciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransacciones = filteredTransacciones.slice(startIndex, endIndex);

  // Resetear a página 1 si el filtro cambia
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategoria]);

  // Calcular totales
  const total = filteredTransacciones.reduce(
    (sum, t: any) => sum + (t.valor ?? 0),
    0
  );
  const totalConfirmadas = filteredTransacciones
    .filter((t: any) => t.confirmado_auditoria)
    .reduce((sum, t: any) => sum + (t.valor ?? 0), 0);

  return (
    <div className="transacciones-screen">
      {/* Mensajes */}
      {(error || validationError) && (
        <Card className="error-card">
          <div className="error-message">
            <strong>Error:</strong> {error || validationError}
            <Button
              variant="secondary"
              onClick={() => {
                clearError();
                setValidationError(null);
              }}
              size="small"
            >
              Descartar
            </Button>
          </div>
        </Card>
      )}

      {success && (
        <Card className="success-card">
          <div className="success-message">✅ {success}</div>
        </Card>
      )}

      {/* Header */}
      <Card title="Transacciones del Turno">
        <div className="transacciones-screen__header">
          <div className="transacciones-screen__info">
            <p>
              <strong>Turno:</strong>{' '}
              {turno ? `#${turno.numero_turno}` : 'Sin turno'}
            </p>
            <p>
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            <p>
              <strong>Cantidad:</strong> {transacciones.length}
            </p>
          </div>

          {/* Botón crear - solo empleado y admin */}
          {(user.rol === 'empleado' || user.rol === 'administrador') &&
            turno && (
              <Button
                variant="primary"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancelar' : 'Nueva Transacción'}
              </Button>
            )}
        </div>

        {/* Formulario */}
        {showForm && (user.rol === 'empleado' || user.rol === 'administrador') && (
          <form
            onSubmit={handleCreateTransaccion}
            className="transacciones-screen__form"
          >
            <div className="form-group">
              <label>Valor *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Categoría *</label>
              <select
                required
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Concepto</label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) =>
                  setFormData({ ...formData, concepto: e.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <Button variant="success" type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Transacción'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Tabla de Transacciones */}
      {isLoading && turnoLoading ? (
        <Card>
          <p className="transacciones-screen__loading">
            Cargando transacciones...
          </p>
        </Card>
      ) : transacciones.length === 0 ? (
        <Card>
          <p className="transacciones-screen__empty">
            No hay transacciones registradas para este turno.
          </p>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <Card>
            <div className="transacciones-screen__filters">
              <input
                type="text"
                placeholder="Buscar por concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="transacciones-screen__search"
              />
              <select
                value={filterCategoria || ''}
                onChange={(e) => setFilterCategoria(e.target.value || null)}
                className="transacciones-screen__category-filter"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {(searchTerm || filterCategoria) && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategoria(null);
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </Card>

          <Card title={`Transacciones (${filteredTransacciones.length} de ${transacciones.length})`}>
          <div className="transacciones-screen__table">
            <table>
              <thead>
                <tr>
                  <th>
                    Valor
                    <Tooltip text="Monto de la transacción" />
                  </th>
                  <th>
                    Categoría
                    <Tooltip text="Tipo de transacción (Pago, Gasto, Compra, etc.)" />
                  </th>
                  <th>
                    Concepto
                    <Tooltip text="Descripción o nota de la transacción" />
                  </th>
                  <th>
                    Fecha
                    <Tooltip text="Cuándo se registró la transacción" />
                  </th>
                  <th>
                    Auditada
                    <Tooltip text="Si fue confirmada por el supervisor/auditor" />
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransacciones.map((txn: any) => (
                  <tr key={txn.id}>
                    <td>${(txn.valor ?? 0).toFixed(2)}</td>
                    <td>{getCategoriaLabel(txn.categoria)}</td>
                    <td>{txn.concepto || '-'}</td>
                    <td>
                      {txn.created_at
                        ? new Date(txn.created_at).toLocaleString('es-CO')
                        : '-'}
                    </td>
                    <td>
                      {txn.confirmado_auditoria ? (
                        <span className="badge badge--success">✓ Sí</span>
                      ) : (
                        <span className="badge badge--warning">✗ No</span>
                      )}
                    </td>
                    <td className="transacciones-screen__actions">
                      {user.rol === 'supervisor' ||
                      user.rol === 'administrador' ? (
                        !txn.confirmado_auditoria && (
                          <Button
                            variant="success"
                            size="small"
                            onClick={() => handleConfirmAudit(txn.id)}
                          >
                            Confirmar
                          </Button>
                        )
                      ) : null}

                      {user.rol === 'empleado' &&
                      txn.usuario_id === user.id &&
                      !txn.confirmado_auditoria ? (
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDeleteTransaccion(txn.id)}
                        >
                          Eliminar
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransacciones.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredTransacciones.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items);
                setCurrentPage(1);
              }}
            />
          )}
        </Card>
        </>
      )}

      {/* Resumen */}
      <Card title="Resumen">
        <div className="transacciones-screen__summary">
          <div className="summary-item">
            <span>Total Transacciones:</span>
            <strong>{filteredTransacciones.length}</strong>
          </div>
          <div className="summary-item">
            <span>Monto Total:</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Monto Confirmado:</span>
            <strong>${totalConfirmadas.toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Auditadas:</span>
            <strong>
              {filteredTransacciones.filter((t: any) => t.confirmado_auditoria).length}
            </strong>
          </div>
          <div className="summary-item">
            <span>Pendientes:</span>
            <strong>
              {transacciones.filter((t: any) => !t.confirmado_auditoria).length}
            </strong>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TransaccionesScreen;
