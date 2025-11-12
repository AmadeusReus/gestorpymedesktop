// src/App.tsx

import './App.css';
import { useAuth } from './hooks/useAuth'; // ⬅️ Importamos el Custom Hook

// ⬅️ Importamos los componentes reutilizables
import LoginForm from './components/LoginForm';
import MainApp from './components/MainApp';


function App() {
  // 1. Obtener todo el estado y la lógica del Hook
  const { user, isLoading, error, login, logout, setUserTurno } = useAuth();

  // 2. Función que se pasa al componente LoginForm
  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
  };

  // 3. Renderizado Condicional del Orquestador
  let content;

  if (!user) {
    // Mostrar el formulario, pasando los estados y la lógica del hook
    content = (
      <LoginForm
        onLogin={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    );
  } else {
    // Mostrar la aplicación principal
    content = (
      <MainApp
        user={user}
        onLogout={logout}
        setUserTurno={setUserTurno}
      />
    );
  }

  return <div className="app-container">{content}</div>;
}

export default App;