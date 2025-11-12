// src/screens/AuditoriaScreen.tsx

import React, { useEffect, useState } from 'react';
import { User } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import '../styles/screens/AuditoriaScreen.css';

interface AuditoriaScreenProps {
  user: User;
  onNavigate?: (screen: string) => void;
}

/**
 * PANTALLA DE AUDITORÍA
 *
 * Disponible para:
 * - SUPERVISOR (ve su negocio)
 * - ADMINISTRADOR (ve su negocio seleccionado)
 *
 * Permite:
 * - Ver historial de transacciones auditadas
 * - Confirmar/rechazar transacciones
 * - Ver estadísticas
 * - Generar reportes
 */

const AuditoriaScreen: React.FC<AuditoriaScreenProps> = ({
  user,
  onNavigate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });

  useEffect(() => {
    loadAuditData();
  }, [user.negocioId]);

  const loadAuditData = async () => {
    setIsLoading(true);
    try {
      // Mock data - en producción esto vendría del backend
      setAuditStats({
        totalTransacciones: 245,
        confirmadas: 240,
        pendientes: 5,
        rechazadas: 0,
        montoTotal: 5000000,
        montoConfirmado: 4900000,
        montoPendiente: 100000,
      });

      setTransactions([
        {
          id: 1,
          valor: 50000,
          categoria: 'PAGO_DIGITAL',
          concepto: 'Pago Nequi',
          usuario_id: 2,
          usuario_nombre: 'Empleado Uno',
          turno_id: 1,
          turno_numero: 1,
          confirmado: true,
          auditor_id: 4,
          auditor_nombre: 'Supervisor Test',
          created_at: '2025-11-06 10:30:00',
          confirmed_at: '2025-11-06 10:45:00',
        },
        {
          id: 2,
          valor: 100000,
          categoria: 'GASTO_CAJA',
          concepto: 'Cambio',
          usuario_id: 2,
          usuario_nombre: 'Empleado Uno',
          turno_id: 1,
          turno_numero: 1,
          confirmado: false,
          auditor_id: null,
          auditor_nombre: null,
          created_at: '2025-11-06 11:00:00',
          confirmed_at: null,
        },
      ]);
    } catch (err) {
      console.error('Error loading audit data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async (transactionId: number) => {
    console.log('Confirming transaction:', transactionId);
    // Backend call would go here
  };

  const handleRejectTransaction = async (transactionId: number) => {
    console.log('Rejecting transaction:', transactionId);
    // Backend call would go here
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'pending') return !t.confirmado;
    if (filter === 'confirmed') return t.confirmado;
    return true;
  });

  return (
    <div className="auditoria-screen">
      {/* Stats */}
      <Card title="Estadísticas de Auditoría">
        {auditStats && (
          <div className="auditoria-screen__stats">
            <div className="stat-card">
              <span className="stat-label">Total Transacciones</span>
              <strong className="stat-value">
                {auditStats.totalTransacciones}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Confirmadas</span>
              <strong className="stat-value success">
                ✓ {auditStats.confirmadas}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Pendientes</span>
              <strong className={`stat-value ${auditStats.pendientes > 0 ? 'warning' : ''}`}>
                {auditStats.pendientes}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Monto Total</span>
              <strong className="stat-value">
                ${(auditStats.montoTotal ?? 0).toLocaleString('es-CO')}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Monto Confirmado</span>
              <strong className="stat-value success">
                ${(auditStats.montoConfirmado ?? 0).toLocaleString('es-CO')}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Monto Pendiente</span>
              <strong className={`stat-value ${auditStats.montoPendiente > 0 ? 'warning' : ''}`}>
                ${(auditStats.montoPendiente ?? 0).toLocaleString('es-CO')}
              </strong>
            </div>
          </div>
        )}
      </Card>

      {/* Filtros */}
      <Card title="Filtros">
        <div className="auditoria-screen__filters">
          <div className="filter-group">
            <label>Estado</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Desde</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Hasta</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </div>

          <Button variant="secondary" onClick={loadAuditData}>
            Aplicar Filtros
          </Button>
        </div>
      </Card>

      {/* Transacciones */}
      <Card title={`Transacciones (${filteredTransactions.length})`}>
        {isLoading ? (
          <p className="auditoria-screen__loading">Cargando...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="auditoria-screen__empty">
            No hay transacciones para los filtros seleccionados.
          </p>
        ) : (
          <div className="auditoria-screen__table">
            <table>
              <thead>
                <tr>
                  <th>Valor</th>
                  <th>Categoría</th>
                  <th>Concepto</th>
                  <th>Usuario</th>
                  <th>Turno</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Auditor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className={txn.confirmado ? 'confirmed' : 'pending'}>
                    <td>${(txn.valor ?? 0).toLocaleString('es-CO')}</td>
                    <td>{txn.categoria}</td>
                    <td>{txn.concepto || '-'}</td>
                    <td>{txn.usuario_nombre}</td>
                    <td>#{txn.turno_numero}</td>
                    <td>{txn.created_at}</td>
                    <td>
                      <span className={`badge badge--${txn.confirmado ? 'confirmed' : 'pending'}`}>
                        {txn.confirmado ? '✓ Confirmada' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td>{txn.auditor_nombre || '-'}</td>
                    <td className="auditoria-screen__actions">
                      {!txn.confirmado && (
                        <>
                          <Button
                            variant="success"
                            size="small"
                            onClick={() => handleConfirmTransaction(txn.id)}
                          >
                            Confirmar
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleRejectTransaction(txn.id)}
                          >
                            Rechazar
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Acciones */}
      <div className="auditoria-screen__footer">
        <Button variant="secondary" onClick={() => onNavigate?.('turno')}>
          Volver
        </Button>
        <Button variant="primary">
          Generar Reporte
        </Button>
      </div>
    </div>
  );
};

export default AuditoriaScreen;
