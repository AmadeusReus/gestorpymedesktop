// src/components/LoginForm.tsx

import React, { useState, FormEvent } from 'react';
// El tipo User se importa del Custom Hook, no lo necesitamos aquí, pero
// necesitamos definir las props que recibe del Hook.

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username && password) {
      // Llama a la función del hook (onLogin), pasando las credenciales.
      onLogin(username, password);
    }
  };

  return (
    <div className="form-wrapper">
      <h2 className="form-title">GestorPyME - Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="form-layout">
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
          disabled={isLoading}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          disabled={isLoading}
          required
        />
        <button type="submit" className="form-button" disabled={isLoading}>
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
        {/* Mostramos el error si existe */}
        {error && <div className="form-error">{error}</div>}
      </form>
    </div>
  );
};

export default LoginForm;