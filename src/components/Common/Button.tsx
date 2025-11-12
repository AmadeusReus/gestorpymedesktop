// src/components/Common/Button.tsx

import React from 'react';
import '../../styles/components/Button.css';

export type ButtonVariant = 'primary' | 'danger' | 'success' | 'secondary';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  children,
  fullWidth = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';
  const finalClassName = `${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim();

  return (
    <button
      className={finalClassName}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="btn__spinner"></span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
