// src/components/Layout/Sidebar.tsx

import React, { useState } from 'react';
import { User } from '../../hooks/useAuth';
import Button from '../Common/Button';
import '../../styles/components/Sidebar.css';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
  currentScreen?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  onNavigate,
  currentScreen = 'turno'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getRoleLabel = (rol: string) => {
    const roleMap: Record<string, string> = {
      'empleado': 'Empleado',
      'supervisor': 'Supervisor',
      'administrador': 'Administrador'
    };
    return roleMap[rol] || rol;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'turno', label: 'Mi Turno', visible: true },
      { id: 'transacciones', label: 'Transacciones', visible: true },
    ];

    const supervisorItems = [
      { id: 'revision', label: 'Revisión de Día', visible: user.rol === 'supervisor' || user.rol === 'administrador' },
      { id: 'auditoria', label: 'Auditoría', visible: user.rol === 'supervisor' || user.rol === 'administrador' },
    ];

    const adminItems = [
      { id: 'gestion', label: 'Gestión Negocio', visible: user.rol === 'administrador' },
      { id: 'catalogos', label: 'Catálogos', visible: user.rol === 'administrador' },
    ];

    return [...baseItems, ...supervisorItems, ...adminItems].filter(item => item.visible);
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}`}>
      {/* Toggle Button para colapsar */}
      <button
        className="sidebar__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Toggle sidebar"
      >
        <span className="sidebar__toggle-icon">☰</span>
      </button>

      {/* Avatar y Usuario */}
      <div className="sidebar__user-section">
        <div className="sidebar__avatar">{user.nombreCompleto.charAt(0).toUpperCase()}</div>
        {isExpanded && (
          <div className="sidebar__user-info">
            <h3 className="sidebar__username">{user.nombreCompleto}</h3>
            <p className="sidebar__role">{getRoleLabel(user.rol)}</p>
            <p className="sidebar__date">{getTodayDate()}</p>
          </div>
        )}
      </div>

      {/* Separador */}
      <div className="sidebar__divider"></div>

      {/* Status Turno */}
      {user.turno && isExpanded && (
        <div className="sidebar__turno-status">
          <div className="sidebar__status-label">Turno Activo</div>
          <div className={`sidebar__status-badge sidebar__status-badge--${user.turno.estado.toLowerCase()}`}>
            {user.turno.numero_turno ? `T${user.turno.numero_turno}` : 'Sin Turno'}
          </div>
          <div className="sidebar__status-detail">
            {user.turno.estado}
          </div>
        </div>
      )}

      {/* Menú de Navegación */}
      <nav className="sidebar__menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__menu-item ${currentScreen === item.id ? 'sidebar__menu-item--active' : ''}`}
            onClick={() => onNavigate?.(item.id)}
            title={item.label}
          >
            <span className="sidebar__menu-icon">
              {item.id === 'turno' && '📋'}
              {item.id === 'transacciones' && '💰'}
              {item.id === 'revision' && '✅'}
              {item.id === 'auditoria' && '🔍'}
              {item.id === 'gestion' && '⚙️'}
              {item.id === 'catalogos' && '📚'}
            </span>
            {isExpanded && (
              <span className="sidebar__menu-label">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Separador */}
      <div className="sidebar__divider"></div>

      {/* Botón Logout */}
      <div className="sidebar__logout-section">
        {isExpanded ? (
          <Button
            variant="danger"
            size="small"
            fullWidth
            onClick={onLogout}
          >
            Cerrar Sesión
          </Button>
        ) : (
          <button
            className="sidebar__logout-icon"
            onClick={onLogout}
            title="Cerrar Sesión"
          >
            🚪
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
