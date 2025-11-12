// src/components/Common/Toast.tsx

import React, { useEffect } from 'react';
import '../../styles/components/Toast.css';

interface ToastProps {
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // milliseconds, 0 = persistent
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast--${type} ${!message ? 'toast--icon-only' : ''}`}>
      <span className="toast__icon">{getIcon()}</span>
      {message && <span className="toast__message">{message}</span>}
    </div>
  );
};

export default Toast;
