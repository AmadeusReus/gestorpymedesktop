// src/components/Common/FormInputCurrency.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { formatCurrency, parseFormattedCurrency } from '../../utils/formatUtils';
import '../../styles/components/FormInput.css';

interface FormInputCurrencyProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  value?: number | string;
  onChange?: (value: number, formattedValue: string) => void;
  showPreview?: boolean; // Mostrar preview del formato mientras escribes
}

const FormInputCurrency: React.FC<FormInputCurrencyProps> = ({
  label,
  error,
  helperText,
  required = false,
  fullWidth = true,
  className = '',
  id,
  value: externalValue,
  onChange,
  showPreview = true,
  onBlur,
  ...rest
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const [displayValue, setDisplayValue] = useState<string>('');
  const [previewValue, setPreviewValue] = useState<string>('');

  // Sincronizar con valor externo
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      const numValue = typeof externalValue === 'string'
        ? parseFormattedCurrency(externalValue)
        : externalValue;
      setDisplayValue(String(numValue));
      setPreviewValue(formatCurrency(numValue));
    }
  }, [externalValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Solo permitir números
    const numbersOnly = inputValue.replace(/[^\d]/g, '');
    setDisplayValue(numbersOnly);

    // Mostrar preview formateado
    if (numbersOnly) {
      const numValue = parseInt(numbersOnly, 10) || 0;
      setPreviewValue(formatCurrency(numValue));
    } else {
      setPreviewValue('');
    }

    // Notificar cambio
    if (onChange) {
      const numValue = numbersOnly ? parseInt(numbersOnly, 10) : 0;
      onChange(numValue, formatCurrency(numValue));
    }
  }, [onChange]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Al perder focus, formatear el display
    if (displayValue) {
      const numValue = parseInt(displayValue, 10) || 0;
      setDisplayValue(String(numValue));
      setPreviewValue(formatCurrency(numValue));
    } else {
      setPreviewValue('');
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`form-input-group ${fullWidth ? 'form-input-group--full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-input-label">
          {label}
          {required && <span className="form-input-required">*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          className={`form-input ${error ? 'form-input--error' : ''}`}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          inputMode="numeric"
          {...rest}
        />

        {/* Preview del formato mientras escribes */}
        {showPreview && previewValue && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#666',
            pointerEvents: 'none',
            fontWeight: '500'
          }}>
            ${previewValue}
          </div>
        )}
      </div>

      {error && <div className="form-input-error">{error}</div>}
      {helperText && !error && <div className="form-input-helper">{helperText}</div>}
    </div>
  );
};

export default FormInputCurrency;
