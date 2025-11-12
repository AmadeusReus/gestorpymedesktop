// src/screens/RevisionScreen.tsx

import React, { useEffect, useState } from 'react';
import { User } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import { httpClient } from '../api/httpClient';
import '../styles/screens/RevisionScreen.css';

interface RevisionScreenProps {
  user: User;
  onNavigate?: (screen: string) => void;
}

/**
 * PANTALLA DE REVISIÓN DE DÍA
 *
 * Solo disponible para:
 * - SUPERVISOR
 * - ADMINISTRADOR
 *
 * Permite:
 * - Ver resumen del día (turnos, transacciones)
 * - Confirmar que todo está correcto
 * - Cerrar el día (cambiar estado a REVISADO)
 *
 * Restricciones:
 * - Todos los turnos deben estar CERRADOS
 * - Todas las transacciones deben estar auditadas (si corresponde)
 * - No se pueden modificar datos después de revisar
 */

const RevisionScreen: React.FC<RevisionScreenProps> = ({
  user,
  onNavigate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dayData, setDayData] = useState<any>(null);

  useEffect(() => {
    loadDayData();
  }, [user.negocioId]);

  const loadDayData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await httpClient.invoke<{
        success: boolean;
        diaContable?: any;
        error?: string;
      }>('dia-contable:getCurrent', {
        negocioId: user.negocioId
      });

      if (response.success) {
        if (response.diaContable) {
          // Formatear la respuesta del backend para que coincida con el componente
          setDayData({
            ...response.diaContable,
            fecha: new Date(response.diaContable.fecha).toLocaleDateString('es-CO')
          });
        } else {
          // No hay día contable aún (sin turnos)
          setDayData({
            fecha: new Date().toLocaleDateString('es-CO'),
            estado: 'ABIERTO',
            turnos: [],
            totalTransacciones: 0,
            totalPagosDigitales: 0,
            totalGastos: 0,
            totalDiferencia: 0,
            transaccionesAuditadas: 0,
            transaccionesPendientes: 0
          });
        }
      } else {
        setError(response.error || 'Error al cargar datos del día');
      }
    } catch (err) {
      console.error('Error cargando datos del día:', err);
      setError('Error al cargar los datos. Verifica la conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewDay = async () => {
    if (!dayData) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar estado local
      if (dayData.estado === 'REVISADO') {
        setError('El día ya fue revisado');
        setIsLoading(false);
        return;
      }

      // Validar que todos los turnos estén CERRADOS
      const allTurnosClosed = dayData.turnos.every((t: any) => t.estado === 'CERRADO');
      if (!allTurnosClosed) {
        setError('No todos los turnos están cerrados');
        setIsLoading(false);
        return;
      }

      // Llamar al backend para revisar el día
      const response = await httpClient.invoke<{
        success: boolean;
        error?: string;
      }>('dia-contable:review', {
        negocioId: user.negocioId
      });

      if (response.success) {
        setSuccess('✅ Día revisado correctamente');
        setDayData({ ...dayData, estado: 'REVISADO' });

        // Volver a turno después de 2 segundos
        setTimeout(() => {
          onNavigate?.('turno');
        }, 2000);
      } else {
        setError(response.error || 'Error al revisar el día');
      }
    } catch (err) {
      console.error('Error revisando día:', err);
      setError('Error al revisar el día. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!dayData) {
    return (
      <div className="revision-screen">
        <Card>
          <p className="revision-screen__loading">Cargando información del día...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="revision-screen">
      {/* Mensajes */}
      {error && (
        <Card className="error-card">
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        </Card>
      )}

      {success && (
        <Card className="success-card">
          <div className="success-message">{success}</div>
        </Card>
      )}

      {/* Estado del Día */}
      <Card title="Estado del Día">
        <div className="revision-screen__day-info">
          <div className="info-item">
            <span>Fecha</span>
            <strong>{dayData.fecha}</strong>
          </div>
          <div className="info-item">
            <span>Estado</span>
            <strong
              className={`badge badge--${dayData.estado === 'REVISADO' ? 'success' : 'warning'}`}
            >
              {dayData.estado}
            </strong>
          </div>
          <div className="info-item">
            <span>Negocio</span>
            <strong>ID: {user.negocioId}</strong>
          </div>
        </div>
      </Card>

      {/* Resumen de Turnos */}
      <Card title={`Turnos (${dayData.turnos.length})`}>
        <div className="revision-screen__turnos">
          {dayData.turnos.map((turno: any) => (
            <div key={turno.id} className="turno-item">
              <div className="turno-header">
                <div className="turno-title">
                  <h4>Turno #{turno.numero_turno}</h4>
                  <span className={`badge badge--${turno.estado.toLowerCase()}`}>
                    {turno.estado}
                  </span>
                </div>
                <div className="turno-operator">
                  {turno.usuario_nombre}
                </div>
              </div>

              <div className="turno-details">
                <div className="detail">
                  <span>Efectivo Contado</span>
                  <strong>${(turno.efectivo ?? 0).toLocaleString('es-CO')}</strong>
                </div>
                <div className="detail">
                  <span>Venta Reportada POS</span>
                  <strong>${(turno.venta_pos ?? 0).toLocaleString('es-CO')}</strong>
                </div>
                <div className="detail">
                  <span>Diferencia</span>
                  <strong className={turno.diferencia < 0 ? 'negative' : 'positive'}>
                    ${(turno.diferencia ?? 0).toLocaleString('es-CO')}
                  </strong>
                </div>
                <div className="detail">
                  <span>Transacciones</span>
                  <strong>{turno.transacciones}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumen de Transacciones */}
      <Card title="Resumen de Transacciones">
        <div className="revision-screen__transactions">
          <div className="transaction-stat">
            <span>Total de Transacciones</span>
            <strong>{dayData.totalTransacciones}</strong>
          </div>
          <div className="transaction-stat">
            <span>Monto Total</span>
            <strong>${(dayData.totalMonto ?? 0).toLocaleString('es-CO')}</strong>
          </div>
          <div className="transaction-stat">
            <span>Auditadas</span>
            <strong className="success">
              ✓ {dayData.transaccionesAuditadas}
            </strong>
          </div>
          <div className="transaction-stat">
            <span>Pendientes</span>
            <strong className={dayData.transaccionesPendientes > 0 ? 'warning' : 'success'}>
              {dayData.transaccionesPendientes}
            </strong>
          </div>
        </div>
      </Card>

      {/* Checklist de Revisión */}
      <Card title="Checklist de Revisión">
        <div className="revision-screen__checklist">
          <div className="check-item">
            <input
              type="checkbox"
              id="check-turnos"
              checked={dayData.turnos.every((t: any) => t.estado === 'CERRADO')}
              disabled
            />
            <label htmlFor="check-turnos">
              Todos los turnos están CERRADOS
            </label>
          </div>

          <div className="check-item">
            <input
              type="checkbox"
              id="check-transactions"
              checked={dayData.transaccionesPendientes === 0}
              disabled
            />
            <label htmlFor="check-transactions">
              Todas las transacciones han sido auditadas
            </label>
          </div>

          <div className="check-item">
            <input
              type="checkbox"
              id="check-verified"
              defaultChecked={false}
            />
            <label htmlFor="check-verified">
              He verificado que todos los datos son correctos
            </label>
          </div>
        </div>
      </Card>

      {/* Botones de Acción */}
      <div className="revision-screen__actions">
        <Button
          variant="secondary"
          onClick={() => onNavigate?.('turno')}
        >
          Volver a Turno
        </Button>

        <Button
          variant="success"
          onClick={handleReviewDay}
          disabled={
            isLoading ||
            dayData.estado === 'REVISADO' ||
            !dayData.turnos.every((t: any) => t.estado === 'CERRADO')
          }
        >
          {isLoading ? 'Revisando...' : 'Revisar y Cerrar Día'}
        </Button>
      </div>

      {/* Advertencia */}
      {dayData.estado === 'REVISADO' && (
        <Card className="info-card">
          <div className="info-message">
            ⚠️ Este día ya ha sido revisado. No se pueden hacer más cambios.
          </div>
        </Card>
      )}
    </div>
  );
};

export default RevisionScreen;
