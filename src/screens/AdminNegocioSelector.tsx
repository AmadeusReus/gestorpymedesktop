// src/screens/AdminNegocioSelector.tsx

import React, { useEffect } from 'react';
import { User } from '../hooks/useAuth';
import { useNegocios } from '../hooks/useNegocios';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import '../styles/screens/AdminNegocioSelector.css';

interface AdminNegocioSelectorProps {
  user: User;
  onSelect: (negocioId: number) => void;
}

/**
 * PANTALLA DE SELECCIÓN DE NEGOCIO PARA ADMIN
 *
 * Se muestra SOLO cuando:
 * 1. El usuario tiene rol 'administrador'
 * 2. El usuario está asignado a 2 o más negocios
 *
 * Uso:
 * - Admin hace login → Si tiene múltiples negocios → Se muestra esta pantalla
 * - Admin selecciona un negocio → Actualiza user.negocioId → Muestra TurnoScreen
 * - Admin puede cambiar de negocio desde el sidebar en cualquier momento
 */

const AdminNegocioSelector: React.FC<AdminNegocioSelectorProps> = ({ user, onSelect }) => {
  const { negocios, isLoading, error, getNegociosByUser } = useNegocios();

  useEffect(() => {
    if (user.id) {
      getNegociosByUser(user.id);
    }
  }, [user.id, getNegociosByUser]);

  // Si no hay múltiples negocios, no mostrar selector
  if (negocios.length <= 1) {
    return null;
  }

  const handleSelectNegocio = (negocioId: number) => {
    onSelect(negocioId);
  };

  return (
    <div className="admin-negocio-selector">
      <div className="admin-negocio-selector__container">
        <Card title="Selecciona un Negocio" className="admin-negocio-selector__card">
          {isLoading && (
            <div className="admin-negocio-selector__loading">
              <p>Cargando negocios...</p>
            </div>
          )}

          {error && (
            <div className="admin-negocio-selector__error">
              <p>Error: {error}</p>
            </div>
          )}

          {!isLoading && negocios.length > 0 && (
            <div className="admin-negocio-selector__negocios">
              <p className="admin-negocio-selector__info">
                Tienes acceso a {negocios.length} negocio(s). Selecciona uno para continuar:
              </p>

              <div className="admin-negocio-selector__grid">
                {negocios.map((negocio) => (
                  <div key={negocio.id} className="admin-negocio-selector__item">
                    <div className="admin-negocio-selector__negocio-card">
                      <h3 className="admin-negocio-selector__negocio-name">
                        {negocio.nombre_negocio}
                      </h3>
                      <p className="admin-negocio-selector__negocio-role">
                        Rol: {negocio.rol.toUpperCase()}
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => handleSelectNegocio(negocio.id)}
                        className="admin-negocio-selector__select-btn"
                      >
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && negocios.length === 0 && (
            <div className="admin-negocio-selector__empty">
              <p>No se encontraron negocios asignados.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminNegocioSelector;
