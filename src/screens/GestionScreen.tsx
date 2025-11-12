// src/screens/GestionScreen.tsx

import React, { useState } from 'react';
import { User } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import '../styles/screens/GestionScreen.css';

interface GestionScreenProps {
  user: User;
  onNavigate?: (screen: string) => void;
}

/**
 * PANTALLA DE GESTIÓN DE NEGOCIO
 *
 * Solo para ADMINISTRADOR
 *
 * Permite:
 * - Ver estadísticas del negocio
 * - Gestionar turnos (crear/borrar en caso de recuperación)
 * - Ver historial de operaciones
 * - Configurar opciones del negocio
 */

const GestionScreen: React.FC<GestionScreenProps> = ({
  user,
  onNavigate,
}) => {
  const [selectedTab, setSelectedTab] = useState<'stats' | 'turnos' | 'historial' | 'config'>('stats');

  return (
    <div className="gestion-screen">
      {/* Tabs */}
      <div className="gestion-screen__tabs">
        <button
          className={`tab ${selectedTab === 'stats' ? 'active' : ''}`}
          onClick={() => setSelectedTab('stats')}
        >
          Estadísticas
        </button>
        <button
          className={`tab ${selectedTab === 'turnos' ? 'active' : ''}`}
          onClick={() => setSelectedTab('turnos')}
        >
          Gestión de Turnos
        </button>
        <button
          className={`tab ${selectedTab === 'historial' ? 'active' : ''}`}
          onClick={() => setSelectedTab('historial')}
        >
          Historial
        </button>
        <button
          className={`tab ${selectedTab === 'config' ? 'active' : ''}`}
          onClick={() => setSelectedTab('config')}
        >
          Configuración
        </button>
      </div>

      {/* Content */}
      <div className="gestion-screen__content">
        {selectedTab === 'stats' && (
          <Card title="Estadísticas del Negocio">
            <div className="gestion-screen__stats">
              <div className="stat">
                <span>Turnos Hoy</span>
                <strong>2</strong>
              </div>
              <div className="stat">
                <span>Transacciones Hoy</span>
                <strong>24</strong>
              </div>
              <div className="stat">
                <span>Movimiento Total</span>
                <strong>$1,500,000</strong>
              </div>
              <div className="stat">
                <span>Diferencia</span>
                <strong className="positive">$50,000</strong>
              </div>
            </div>
          </Card>
        )}

        {selectedTab === 'turnos' && (
          <Card title="Gestión de Turnos">
            <div className="gestion-screen__turnos">
              <p>Opciones de gestión manual de turnos (solo en casos especiales)</p>
              <div className="turnos-actions">
                <Button variant="primary">
                  Crear Turno Manual
                </Button>
                <Button variant="danger">
                  Borrar Turno
                </Button>
              </div>
              <div className="info-box">
                <p>
                  ⚠️ Estas opciones están disponibles solo cuando no hay datos
                  registrados para el día. Para recuperación de errores.
                </p>
              </div>
            </div>
          </Card>
        )}

        {selectedTab === 'historial' && (
          <Card title="Historial de Operaciones">
            <div className="gestion-screen__historial">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Operación</th>
                    <th>Usuario</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2025-11-06 10:30</td>
                    <td>Crear Turno</td>
                    <td>Empleado Uno</td>
                    <td>Turno #1</td>
                  </tr>
                  <tr>
                    <td>2025-11-06 10:45</td>
                    <td>Crear Transacción</td>
                    <td>Empleado Uno</td>
                    <td>$50,000 - PAGO_DIGITAL</td>
                  </tr>
                  <tr>
                    <td>2025-11-06 11:00</td>
                    <td>Cerrar Turno</td>
                    <td>Empleado Uno</td>
                    <td>Turno #1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {selectedTab === 'config' && (
          <Card title="Configuración del Negocio">
            <div className="gestion-screen__config">
              <div className="config-item">
                <label>Nombre del Negocio</label>
                <input type="text" value={`Negocio ${user.negocioId}`} disabled />
              </div>
              <div className="config-item">
                <label>ID del Negocio</label>
                <input type="text" value={user.negocioId.toString()} disabled />
              </div>
              <div className="config-item">
                <label>Zona Horaria</label>
                <select>
                  <option>America/Bogota</option>
                </select>
              </div>
              <div className="config-item">
                <label>Moneda</label>
                <input type="text" value="COP ($)" disabled />
              </div>
              <Button variant="primary">
                Guardar Cambios
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Footer */}
      <Button variant="secondary" onClick={() => onNavigate?.('turno')}>
        Volver al Turno
      </Button>
    </div>
  );
};

export default GestionScreen;
