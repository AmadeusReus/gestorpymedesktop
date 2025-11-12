// src/components/Common/Pagination.tsx

import React from 'react';
import Button from './Button';
import '../../styles/components/Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className="pagination">
      <div className="pagination__info">
        <span>
          Mostrando {startItem}-{endItem} de {totalItems} resultados
        </span>
        {onItemsPerPageChange && (
          <div className="pagination__items-per-page">
            <label>Elementos por página:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        )}
      </div>

      <div className="pagination__controls">
        <Button
          variant="secondary"
          size="small"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
        >
          ⟨⟨
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          ⟨ Anterior
        </Button>

        <div className="pagination__page-indicator">
          <span>Página</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="pagination__page-input"
          />
          <span>de {totalPages}</span>
        </div>

        <Button
          variant="secondary"
          size="small"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Siguiente ⟩
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
        >
          ⟩⟩
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
