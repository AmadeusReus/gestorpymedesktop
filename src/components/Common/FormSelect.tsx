// src/components/Common/FormSelect.tsx

import React from 'react';
import '../../styles/components/FormSelect.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder = 'Selecciona una opción',
  required = false,
  fullWidth = true,
  className = '',
  id,
  ...rest
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-select-group ${fullWidth ? 'form-select-group--full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-select-label">
          {label}
          {required && <span className="form-select-required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`form-select ${error ? 'form-select--error' : ''}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="form-select-error">{error}</div>}
      {helperText && !error && <div className="form-select-helper">{helperText}</div>}
    </div>
  );
};

export default FormSelect;
