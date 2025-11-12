// src/components/Layout/DashboardLayout.tsx

import React from 'react';
import { User } from '../../hooks/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/components/DashboardLayout.css';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  title?: string;
  children: React.ReactNode;
  currentScreen?: string;
  onNavigate?: (screen: string) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  title = 'GestorPyME',
  children,
  currentScreen = 'turno',
  onNavigate,
  showBackButton = false,
  onBack
}) => {
  return (
    <div className="dashboard-layout">
      <Sidebar
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentScreen={currentScreen}
      />

      <div className="dashboard-layout__main">
        <Header
          user={user}
          title={title}
          onLogout={onLogout}
          showBackButton={showBackButton}
          onBack={onBack}
        />

        <main className="dashboard-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
