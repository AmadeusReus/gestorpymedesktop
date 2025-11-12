// src/components/MainApp.tsx

import React, { useState, useEffect } from 'react';
import { User, Turno } from '../hooks/useAuth';
import { useNegocios } from '../hooks/useNegocios';
import AdminNegocioSelector from '../screens/AdminNegocioSelector';
import TurnoScreen from '../screens/TurnoScreen';
import TransaccionesScreen from '../screens/TransaccionesScreen';
import RevisionScreen from '../screens/RevisionScreen';
import AuditoriaScreen from '../screens/AuditoriaScreen';
import GestionScreen from '../screens/GestionScreen';
import CatalogoScreen from '../screens/CatalogoScreen';
import DashboardLayout from './Layout/DashboardLayout';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  setUserTurno: (turno: Turno | null) => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, setUserTurno }) => {
  const { negocios, getNegociosByUser } = useNegocios();
  const [selectedNegocioId, setSelectedNegocioId] = useState<number | null>(user.negocioId);
  const [currentScreen, setCurrentScreen] = useState('turno');

  // Cargar negocios del usuario si es admin
  useEffect(() => {
    if (user.rol === 'administrador' && user.id) {
      getNegociosByUser(user.id);
    }
  }, [user.id, user.rol, getNegociosByUser]);

  // Mostrar selector de negocio si es admin con múltiples negocios
  if (
    user.rol === 'administrador' &&
    negocios.length > 1 &&
    !selectedNegocioId
  ) {
    return (
      <AdminNegocioSelector
        user={user}
        onSelect={setSelectedNegocioId}
      />
    );
  }

  // Una vez seleccionado el negocio, mostrar la aplicación principal
  if (!selectedNegocioId) {
    return (
      <div className="form-wrapper">
        <h2 className="form-title">Cargando...</h2>
      </div>
    );
  }

  // Usuario con negocio seleccionado
  const userWithNegocio: User = {
    ...user,
    negocioId: selectedNegocioId
  };

  return (
    <DashboardLayout
      user={userWithNegocio}
      onLogout={onLogout}
      title="GestorPyME"
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
    >
      {currentScreen === 'turno' && (
        <TurnoScreen
          user={userWithNegocio}
          onNavigate={setCurrentScreen}
          setUserTurno={setUserTurno}
        />
      )}

      {currentScreen === 'transacciones' && (
        <TransaccionesScreen
          user={userWithNegocio}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'revision' && (
        <RevisionScreen
          user={userWithNegocio}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'auditoria' && (
        <AuditoriaScreen
          user={userWithNegocio}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'gestion' && (
        <GestionScreen
          user={userWithNegocio}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'catalogos' && (
        <CatalogoScreen
          user={userWithNegocio}
          onNavigate={setCurrentScreen}
        />
      )}
    </DashboardLayout>
  );
};

export default MainApp;