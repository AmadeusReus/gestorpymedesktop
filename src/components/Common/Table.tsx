// src/components/Common/Table.tsx

import React from 'react';
import '../../styles/components/Table.css';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectRow?: (key: string | number) => void;
  sortable?: boolean;
  onSort?: (column: keyof T) => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

const Table: React.FC<TableProps<any>> = ({
  columns,
  data,
  keyExtractor = (_, index) => index,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No hay datos para mostrar',
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  sortable = false,
  onSort,
  sortBy,
  sortOrder = 'asc',
  className = ''
}) => {
  const handleRowClick = (row: any, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const handleSelectChange = (key: string | number) => {
    if (onSelectRow) {
      onSelectRow(key);
    }
  };

  const handleSortClick = (column: TableColumn<any>) => {
    if (sortable && onSort) {
      onSort(column.key);
    }
  };

  if (isLoading) {
    return <div className="table-loading">Cargando datos...</div>;
  }

  if (isEmpty || data.length === 0) {
    return <div className="table-empty">{emptyMessage}</div>;
  }

  return (
    <div className={`table-wrapper ${className}`}>
      <table className="table">
        <thead className="table__head">
          <tr className="table__row">
            {selectable && (
              <th className="table__cell table__cell--checkbox">
                <input
                  type="checkbox"
                  className="table__checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      data.forEach((row, index) => {
                        handleSelectChange(keyExtractor(row, index));
                      });
                    } else {
                      selectedRows.clear();
                    }
                  }}
                  checked={selectedRows.size === data.length && data.length > 0}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`table__cell table__cell--header ${sortable ? 'table__cell--sortable' : ''}`}
                style={{ textAlign: column.align || 'left', width: column.width }}
                onClick={() => handleSortClick(column)}
              >
                <div className="table__header-content">
                  {column.header}
                  {sortable && sortBy === column.key && (
                    <span className="table__sort-icon">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table__body">
          {data.map((row, index) => {
            const rowKey = keyExtractor(row, index);
            const isSelected = selectedRows.has(rowKey);

            return (
              <tr
                key={rowKey}
                className={`table__row ${isSelected ? 'table__row--selected' : ''} ${onRowClick ? 'table__row--clickable' : ''}`}
                onClick={() => handleRowClick(row, index)}
              >
                {selectable && (
                  <td className="table__cell table__cell--checkbox">
                    <input
                      type="checkbox"
                      className="table__checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectChange(rowKey)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="table__cell"
                    style={{ textAlign: column.align || 'left', width: column.width }}
                  >
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : formatCellValue(row[column.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  if (typeof value === 'number') {
    return value.toLocaleString('es-CO');
  }
  if (value instanceof Date) {
    return value.toLocaleDateString('es-CO');
  }
  return String(value);
}

export default Table;
