// src/components/Layout/Header.tsx

import React from 'react';
import { User } from '../../hooks/useAuth';
import Button from '../Common/Button';
import '../../styles/components/Header.css';

interface HeaderProps {
  user: User;
  title?: string;
  onLogout: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  user,
  title = 'GestorPyME',
  onLogout,
  onBack,
  showBackButton = false
}) => {
  const getRoleLabel = (rol: string) => {
    const roleMap: Record<string, string> = {
      'empleado': 'Empleado',
      'supervisor': 'Supervisor',
      'administrador': 'Administrador'
    };
    return roleMap[rol] || rol;
  };

  return (
    <header className="header">
      <div className="header__left">
        {showBackButton && onBack && (
          <button
            className="header__back-button"
            onClick={onBack}
            title="Volver"
            aria-label="Volver"
          >
            ←
          </button>
        )}
        <h1 className="header__title">{title}</h1>
      </div>

      <div className="header__center">
        <div className="header__status">
          <span className="header__status-label">Estado:</span>
          {user.turno ? (
            <span className={`header__status-value header__status-value--${user.turno.estado.toLowerCase()}`}>
              Turno T{user.turno.numero_turno} - {user.turno.estado}
            </span>
          ) : (
            <span className="header__status-value header__status-value--sin-turno">
              Sin Turno
            </span>
          )}
        </div>
      </div>

      <div className="header__right">
        <div className="header__user-info">
          <div className="header__user-name">{user.nombreCompleto}</div>
          <div className="header__user-role">{getRoleLabel(user.rol)}</div>
        </div>

        <div className="header__divider"></div>

        <Button
          variant="danger"
          size="small"
          onClick={onLogout}
          title="Cerrar Sesión"
        >
          🚪
        </Button>
      </div>
    </header>
  );
};

export default Header;
