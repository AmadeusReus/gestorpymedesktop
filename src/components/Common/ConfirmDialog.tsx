// src/components/Common/ConfirmDialog.tsx

import React from 'react';
import Button from './Button';
import '../../styles/components/ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  onConfirm,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className={`confirm-dialog confirm-dialog--${variant}`}>
        <div className="confirm-dialog__header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog__body">
          <p>{message}</p>
          {error && (
            <div style={{
              padding: '10px',
              marginTop: '10px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ❌ {error}
            </div>
          )}
        </div>
        <div className="confirm-dialog__footer">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
