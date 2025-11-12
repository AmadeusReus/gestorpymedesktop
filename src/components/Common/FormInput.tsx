// src/components/Common/FormInput.tsx

import React from 'react';
import '../../styles/components/FormInput.css';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  fullWidth = true,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-input-group ${fullWidth ? 'form-input-group--full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-input-label">
          {label}
          {required && <span className="form-input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${error ? 'form-input--error' : ''}`}
        {...rest}
      />
      {error && <div className="form-input-error">{error}</div>}
      {helperText && !error && <div className="form-input-helper">{helperText}</div>}
    </div>
  );
};

export default FormInput;
