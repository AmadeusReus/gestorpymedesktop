// src/screens/CatalogoScreen.tsx

import React, { useState, useEffect } from 'react';
import { User } from '../hooks/useAuth';
import { useCatalogos } from '../hooks/useCatalogos';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import Tooltip from '../components/Common/Tooltip';
import Pagination from '../components/Common/Pagination';
import '../styles/screens/CatalogoScreen.css';

interface CatalogoScreenProps {
  user: User;
  onNavigate?: (screen: string) => void;
}

/**
 * PANTALLA DE CATÁLOGOS
 *
 * Solo para ADMINISTRADOR
 *
 * Permite gestionar:
 * - Proveedores
 * - Tipos de Gasto
 * - Tipos de Pago Digital
 */

type CatalogType = 'proveedores' | 'gastos' | 'pagos';

const CatalogoScreen: React.FC<CatalogoScreenProps> = ({
  user,
  onNavigate,
}) => {
  const [selectedTab, setSelectedTab] = useState<CatalogType>('proveedores');
  const [newItem, setNewItem] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    proveedores,
    tiposGasto,
    tiposPagoDigital,
    error,
    success,
    getProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    getTiposGasto,
    createTipoGasto,
    updateTipoGasto,
    deleteTipoGasto,
    getTiposPagoDigital,
    createTipoPagoDigital,
    updateTipoPagoDigital,
    deleteTipoPagoDigital,
    clearError,
  } = useCatalogos();

  // Cargar catálogos al montar o cuando cambie el negocio
  useEffect(() => {
    const loadCatalogos = async () => {
      await getProveedores(user.negocioId);
      await getTiposGasto(user.negocioId);
      await getTiposPagoDigital(user.negocioId);
    };
    loadCatalogos();
  }, [user.negocioId, getProveedores, getTiposGasto, getTiposPagoDigital]);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      clearError();
      if (selectedTab === 'proveedores') {
        await createProveedor(user.negocioId, newItem);
      } else if (selectedTab === 'gastos') {
        await createTipoGasto(user.negocioId, newItem);
      } else if (selectedTab === 'pagos') {
        await createTipoPagoDigital(user.negocioId, newItem);
      }
      setNewItem('');
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const handleToggleItem = async (id: number) => {
    try {
      clearError();
      if (selectedTab === 'proveedores') {
        const item = proveedores.find((p) => p.id === id);
        if (item) {
          await updateProveedor(id, item.nombre, !item.activo);
        }
      } else if (selectedTab === 'gastos') {
        const item = tiposGasto.find((t) => t.id === id);
        if (item) {
          await updateTipoGasto(id, item.nombre, !item.activo);
        }
      } else if (selectedTab === 'pagos') {
        const item = tiposPagoDigital.find((t) => t.id === id);
        if (item) {
          await updateTipoPagoDigital(id, item.nombre, !item.activo);
        }
      }
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      clearError();
      if (selectedTab === 'proveedores') {
        await deleteProveedor(id);
      } else if (selectedTab === 'gastos') {
        await deleteTipoGasto(id);
      } else if (selectedTab === 'pagos') {
        await deleteTipoPagoDigital(id);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const getTitle = () => {
    switch (selectedTab) {
      case 'proveedores':
        return 'Proveedores';
      case 'gastos':
        return 'Tipos de Gasto';
      case 'pagos':
        return 'Tipos de Pago Digital';
    }
  };

  // Mapear items según la pestaña seleccionada
  const currentItems = selectedTab === 'proveedores'
    ? proveedores
    : selectedTab === 'gastos'
    ? tiposGasto
    : tiposPagoDigital;

  // Paginación
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = currentItems.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la pestaña
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  return (
    <div className="catalogo-screen">
      {/* Mensaje de error */}
      {error && (
        <Card className="error-card">
          <div className="error-message">
            <strong>Error:</strong> {error}
            <Button variant="secondary" onClick={clearError} size="small">
              Descartar
            </Button>
          </div>
        </Card>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <Card className="success-card">
          <div className="success-message">
            ✅ Cambio realizado correctamente
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="catalogo-screen__tabs">
        <button
          className={`tab ${selectedTab === 'proveedores' ? 'active' : ''}`}
          onClick={() => setSelectedTab('proveedores')}
        >
          Proveedores
        </button>
        <button
          className={`tab ${selectedTab === 'gastos' ? 'active' : ''}`}
          onClick={() => setSelectedTab('gastos')}
        >
          Tipos de Gasto
        </button>
        <button
          className={`tab ${selectedTab === 'pagos' ? 'active' : ''}`}
          onClick={() => setSelectedTab('pagos')}
        >
          Pagos Digitales
        </button>
      </div>

      {/* Content */}
      <Card title={getTitle()}>
        {/* Agregar Nuevo */}
        <div className="catalogo-screen__form">
          <input
            type="text"
            placeholder={`Nuevo ${getTitle().toLowerCase()}`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddItem();
            }}
          />
          <Button variant="primary" onClick={handleAddItem}>
            Agregar
          </Button>
        </div>

        {/* Lista */}
        <div className="catalogo-screen__list">
          {currentItems.length === 0 ? (
            <p className="catalogo-screen__empty">
              No hay elementos en este catálogo
            </p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>
                      Nombre
                      <Tooltip text="Nombre del elemento en el catálogo" />
                    </th>
                    <th>
                      Estado
                      <Tooltip text="Si está activo o inactivo en el sistema" />
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item: any, index: number) => (
                  <tr key={item.id} className={item.activo ? 'active' : 'inactive'}>
                    <td>{index + 1}</td>
                    <td>{item.nombre}</td>
                    <td>
                      <span className={`badge badge--${item.activo ? 'active' : 'inactive'}`}>
                        {item.activo ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </td>
                    <td className="catalogo-screen__actions">
                      <Button
                        variant={item.activo ? 'secondary' : 'primary'}
                        size="small"
                        onClick={() => handleToggleItem(item.id)}
                      >
                        {item.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              {currentItems.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={currentItems.length}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(items) => {
                    setItemsPerPage(items);
                    setCurrentPage(1);
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Resumen */}
        <div className="catalogo-screen__summary">
          <span>
            Total: <strong>{currentItems.length}</strong>
          </span>
          <span>
            Activos:{' '}
            <strong>
              {currentItems.filter((item: any) => item.activo).length}
            </strong>
          </span>
          <span>
            Inactivos:{' '}
            <strong>
              {currentItems.filter((item: any) => !item.activo).length}
            </strong>
          </span>
        </div>
      </Card>

      {/* Footer */}
      <Button variant="secondary" onClick={() => onNavigate?.('turno')}>
        Volver al Turno
      </Button>
    </div>
  );
};

export default CatalogoScreen;
