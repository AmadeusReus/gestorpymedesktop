// src/components/Transactions/TransactionModal.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Transaction, TransactionTable } from './TransactionTable';
import ConfirmDialog from '../Common/ConfirmDialog';
import Toast from '../Common/Toast';
import './TransactionModal.css';

export type TransactionCategory = 'PAGO_DIGITAL' | 'GASTO_CAJA' | 'COMPRA_PROV';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: TransactionCategory;
  transactions: Transaction[];
  onAddTransaction: (data: any) => Promise<void>;
  onDeleteTransaction: (id: number) => Promise<void>;
  isReadOnly?: boolean;
  turnoAbierto?: boolean;

  // Dropdowns y opciones
  subtypes?: Array<{ id: number; nombre: string; activo: boolean }>;
  onAddNewSubtype?: (nombre: string) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  category,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  isReadOnly = false,
  turnoAbierto = true,
  subtypes = [],
  onAddNewSubtype,
}) => {
  const valorInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    subtipo: subtypes.length > 0 ? subtypes[0].id : '',
    valor: '',
    concepto: '',
  });

  const [showNewSubtypeForm, setShowNewSubtypeForm] = useState(false);
  const [newSubtypeName, setNewSubtypeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSubtypeId, setFilterSubtypeId] = useState<string>('TODOS');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Limpiar formulario cuando las transacciones cambian (después de agregar o borrar)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      valor: '',
      concepto: '',
    }));
    setError(null);
    setShowSuccessToast(true); // Mostrar toast de éxito

    // Focus en input de valor con requestAnimationFrame para Electron
    if (valorInputRef.current) {
      requestAnimationFrame(() => {
        if (valorInputRef.current) {
          valorInputRef.current.focus();
          valorInputRef.current.click();
        }
      });
    }
  }, [transactions.length]); // Se ejecuta cuando cambia el número de transacciones

  const getCategoryTitle = useCallback(() => {
    switch (category) {
      case 'PAGO_DIGITAL':
        return 'Registrar Pagos Digitales';
      case 'GASTO_CAJA':
        return 'Registrar Gasto de Caja';
      case 'COMPRA_PROV':
        return 'Registrar Compra a Proveedor';
    }
  }, [category]);

  const getSubtypeLabel = useCallback(() => {
    switch (category) {
      case 'PAGO_DIGITAL':
        return 'Tipo De Pago';
      case 'GASTO_CAJA':
        return 'Tipo de Gasto';
      case 'COMPRA_PROV':
        return 'Proveedor';
    }
  }, [category]);

  const getAddButtonLabel = useCallback(() => {
    switch (category) {
      case 'PAGO_DIGITAL':
        return 'Agregar Pago';
      case 'GASTO_CAJA':
        return 'Agregar Gasto';
      case 'COMPRA_PROV':
        return 'Agregar Compra';
    }
  }, [category]);

  const getSubtypeDisplay = (transaction: Transaction): string => {
    if (category === 'PAGO_DIGITAL') {
      const subtype = subtypes.find((s) => s.id === transaction.tipo_pago_digital_id);
      return subtype ? subtype.nombre : 'N/A';
    } else if (category === 'GASTO_CAJA') {
      const subtype = subtypes.find((s) => s.id === transaction.tipo_gasto_id);
      return subtype ? subtype.nombre : 'N/A';
    } else {
      const subtype = subtypes.find((s) => s.id === transaction.proveedor_id);
      return subtype ? subtype.nombre : 'N/A';
    }
  };

  const getSubtypeFullLabel = (transaction: Transaction): string => {
    const subtypeLabel = getSubtypeDisplay(transaction);
    return transaction.concepto ? `${subtypeLabel} - ${transaction.concepto}` : subtypeLabel;
  };

  const getTransactionSubtypeId = (transaction: Transaction): number | null => {
    if (category === 'PAGO_DIGITAL') {
      return transaction.tipo_pago_digital_id ?? null;
    } else if (category === 'GASTO_CAJA') {
      return transaction.tipo_gasto_id ?? null;
    } else {
      return transaction.proveedor_id ?? null;
    }
  };

  const filterTransactionsBySubtype = (txns: Transaction[]): Transaction[] => {
    if (filterSubtypeId === 'TODOS') {
      return txns;
    }
    return txns.filter((t) => getTransactionSubtypeId(t) === parseInt(filterSubtypeId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // VALIDAR ANTES de setIsSubmitting
    if (!formData.subtipo || !formData.valor) {
      setError(`Selecciona un ${getSubtypeLabel()} y un valor`);
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      setError('El valor debe ser un número positivo');
      return;
    }

    // AHORA sí, marcar como enviando
    setIsSubmitting(true);
    try {
      // Enviar valor siempre positivo - el backend decide si negarlo según la categoría
      const transactionData: any = {
        valor: valor,
        categoria: category,
        concepto: formData.concepto || undefined,
      };

      if (category === 'PAGO_DIGITAL') {
        transactionData.tipoPagoDigitalId = parseInt(formData.subtipo);
      } else if (category === 'GASTO_CAJA') {
        transactionData.tipoGastoId = parseInt(formData.subtipo);
      } else {
        transactionData.proveedorId = parseInt(formData.subtipo);
      }

      await onAddTransaction(transactionData);
      // La limpieza se hace en el useEffect cuando transactions cambia
      // El focus también se hace en el useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewSubtype = async () => {
    if (!newSubtypeName.trim() || !onAddNewSubtype) return;

    setIsSubmitting(true);
    try {
      await onAddNewSubtype(newSubtypeName);
      setNewSubtypeName('');
      setShowNewSubtypeForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar nueva opción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = (id: number) => {
    // Solo guardar el ID para la confirmación, NO usar confirm() bloqueante
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId === null) return;

    try {
      await onDeleteTransaction(deleteConfirmId);
      // La limpieza se hace en el useEffect cuando transactions cambia
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar transacción');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const categoryFilteredTransactions = transactions.filter((t) => t.categoria === category);
  const filteredTransactions = filterTransactionsBySubtype(categoryFilteredTransactions);

  if (!isOpen) return null;

  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getCategoryTitle()}</h2>
          <button className="modal-close" onClick={onClose} title="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Historial de transacciones */}
          <div className="modal-section">
            <div className="filters">
              <label>Filtrar por {getSubtypeLabel()}:</label>
              <select
                value={filterSubtypeId}
                onChange={(e) => setFilterSubtypeId(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px' }}
              >
                <option value="TODOS">Todos</option>
                {subtypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <TransactionTable
              transactions={filteredTransactions}
              onDelete={isReadOnly || !turnoAbierto ? undefined : handleDeleteTransaction}
              isReadOnly={isReadOnly || !turnoAbierto}
              itemsPerPage={3}
              showPagination={true}
              getSubtypeOnlyLabel={getSubtypeDisplay}
              getSubtypeLabel={getSubtypeFullLabel}
            />
          </div>

          {/* Total Registrado */}
          <div className="modal-total">
            <span>
              Total {category === 'PAGO_DIGITAL' ? 'Digital' : 'Registrado'}
              {filterSubtypeId !== 'TODOS' && ` (${subtypes.find((s) => s.id === parseInt(filterSubtypeId))?.nombre || ''})`}:
            </span>
            <strong>
              ${Math.abs(filteredTransactions.reduce((sum, t) => sum + parseFloat(t.valor), 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </strong>
          </div>

          {/* Formulario para agregar (solo si no es read-only) */}
          {!isReadOnly && turnoAbierto && (
            <div className="modal-section form-section">
              <form onSubmit={handleAddTransaction}>
                <div className="form-group">
                  <label>{getSubtypeLabel()}:</label>
                  <div className="subtype-input">
                    <select
                      name="subtipo"
                      value={formData.subtipo}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Selecciona una opción</option>
                      {subtypes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                    {onAddNewSubtype && (
                      <button
                        type="button"
                        className="btn-add-subtype"
                        onClick={() => setShowNewSubtypeForm(!showNewSubtypeForm)}
                        title="Agregar nueva opción"
                      >
                        +
                      </button>
                    )}
                  </div>

                  {showNewSubtypeForm && (
                    <div className="new-subtype-form">
                      <input
                        type="text"
                        placeholder={`Nuevo ${getSubtypeLabel().toLowerCase()}`}
                        value={newSubtypeName}
                        onChange={(e) => setNewSubtypeName(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="btn-confirm"
                        onClick={handleAddNewSubtype}
                        disabled={isSubmitting || !newSubtypeName.trim()}
                      >
                        Agregar
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Concepto (opcional):</label>
                    <input
                      type="text"
                      name="concepto"
                      value={formData.concepto}
                      onChange={handleInputChange}
                      placeholder="Ej: notas adicionales"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>Valor:</label>
                    <div className="valor-input">
                      <span>$</span>
                      <input
                        ref={valorInputRef}
                        type="text"
                        name="valor"
                        value={formData.valor}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        inputMode="decimal"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  ✔️ {getAddButtonLabel()}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ConfirmDialog para eliminar (NO-BLOQUEANTE) */}
    <ConfirmDialog
      isOpen={deleteConfirmId !== null}
      title="Confirmar eliminación"
      message="¿Estás seguro de que quieres borrar esta transacción? Esta acción no se puede deshacer."
      confirmText="Sí, borrar"
      cancelText="Cancelar"
      variant="danger"
      isLoading={isSubmitting}
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
    />

    {/* Toast de éxito - Solo icono (sin mensaje) */}
    {showSuccessToast && (
      <Toast
        type="success"
        duration={1000}
        onClose={() => setShowSuccessToast(false)}
      />
    )}
    </>
  );
};
