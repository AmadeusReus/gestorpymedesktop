// src/components/Transactions/TransactionTable.tsx

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/formatUtils';
import './TransactionTable.css';

export interface Transaction {
  id: number;
  valor: string | number;
  categoria: string;
  concepto?: string;
  proveedor_id?: number;
  tipo_gasto_id?: number;
  tipo_pago_digital_id?: number;
  confirmado_auditoria?: boolean;
  [key: string]: any;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete?: (id: number) => void;
  onEdit?: (transaction: Transaction) => void;
  isReadOnly?: boolean;
  itemsPerPage?: number;
  showPagination?: boolean;
  getCategoryLabel?: (categoria: string) => string;
  getSubtypeLabel?: (transaction: Transaction) => string;
  getSubtypeOnlyLabel?: (transaction: Transaction) => string;
  filterCategory?: string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDelete,
  onEdit,
  isReadOnly = false,
  itemsPerPage = 5,
  showPagination = true,
  getCategoryLabel = (cat) => cat.replace('_', ' '),
  getSubtypeLabel = (txn) => txn.concepto || '-',
  getSubtypeOnlyLabel,
  filterCategory,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar por categoría si se especifica y ordenar por más recientes primero
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (filterCategory) {
      filtered = transactions.filter((txn) => txn.categoria === filterCategory);
    }
    // Invertir el array para mostrar las más recientes primero (últimas agregadas)
    return [...filtered].reverse();
  }, [transactions, filterCategory]);

  // Calcular total
  const total = useMemo(() => {
    return filteredTransactions.reduce((sum, txn) => {
      const valor = parseFloat(txn.valor) || 0;
      return sum + valor;
    }, 0);
  }, [filteredTransactions]);

  // Paginar
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIdx, endIdx);

  // Reset page si filtro cambia
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, transactions.length]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const getCategoryColor = (categoria: string): string => {
    switch (categoria) {
      case 'PAGO_DIGITAL':
        return 'digital';
      case 'GASTO_CAJA':
        return 'gasto';
      case 'COMPRA_PROV':
        return 'compra';
      default:
        return 'default';
    }
  };

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Monto</th>
            <th>Categoría</th>
            <th>Subtipo</th>
            <th>Concepto</th>
            {!isReadOnly && <th>[Acción]</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((txn) => (
              <tr key={txn.id} className={`transaction-row category-${getCategoryColor(txn.categoria)}`}>
                <td className="monto">${formatCurrency(parseFloat(txn.valor))}</td>
                <td className="categoria">
                  <span className={`category-badge ${txn.categoria}`}>
                    {txn.categoria === 'PAGO_DIGITAL' ? '+' : '-'} {getCategoryLabel(txn.categoria)}
                  </span>
                </td>
                <td className="subtipo">{getSubtypeOnlyLabel ? getSubtypeOnlyLabel(txn) : getSubtypeLabel(txn)}</td>
                <td className="concepto">{txn.concepto || '-'}</td>
                {!isReadOnly && (
                  <td className="acciones">
                    {onEdit && (
                      <button className="btn-edit" onClick={() => onEdit(txn)} title="Editar">
                        ✏️
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn-delete" onClick={() => onDelete(txn.id)} title="Borrar">
                        🗑️
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isReadOnly ? 3 : 4} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No hay transacciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Resumen en una línea */}
      <div className="transaction-summary">
        <span>Transacciones Registradas: <strong>{filteredTransactions.length}</strong></span>
        <span style={{ margin: '0 10px', color: '#ccc' }}>|</span>
        <span>Total: <strong>${formatCurrency(total)}</strong></span>
      </div>

      {/* Paginación */}
      {showPagination && totalPages > 1 && (
        <div className="transaction-pagination">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn-pagination">
            ← Anterior
          </button>
          <span className="page-info">
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn-pagination">
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};
