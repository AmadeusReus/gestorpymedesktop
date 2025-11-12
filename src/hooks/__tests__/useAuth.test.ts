import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, User } from '../useAuth';

// Mock de window.electronAPI
const mockLogin = jest.fn();

Object.defineProperty(window, 'electronAPI', {
  value: {
    login: mockLogin,
  },
  writable: true,
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with null user and no error', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('has login and logout functions', () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('sets loading state during login attempt', async () => {
    mockLogin.mockResolvedValue({ success: false });
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.login('testuser', 'password');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('sets user on successful login', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      nombreCompleto: 'Test User',
      rol: 'empleado',
      negocioId: 1,
    };

    mockLogin.mockResolvedValue({ success: true, user: mockUser });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed login', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Credenciales inválidas',
    });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('testuser', 'wrongpassword');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Credenciales inválidas');
  });

  it('handles unexpected error response', async () => {
    mockLogin.mockResolvedValue({});
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(
      'Ocurrió un error desconocido durante el inicio de sesión.'
    );
  });

  it('handles network/IPC errors', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toContain('servidor');
  });

  it('clears user and error on logout', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      nombreCompleto: 'Test User',
      rol: 'empleado',
      negocioId: 1,
    };

    mockLogin.mockResolvedValue({ success: true, user: mockUser });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('testuser', 'password');
    });

    expect(result.current.user).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('clears previous error when attempting new login', async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: 'First error',
    });
    mockLogin.mockResolvedValueOnce({ success: false, error: 'Second error' });

    const { result } = renderHook(() => useAuth());

    // First login with error
    await act(async () => {
      await result.current.login('testuser', 'wrongpassword');
    });

    expect(result.current.error).toBe('First error');

    // Second login attempt - error should be cleared first
    await act(async () => {
      await result.current.login('testuser', 'anotherpassword');
    });

    expect(result.current.error).toBe('Second error');
  });

  it('calls electronAPI.login with correct credentials', async () => {
    mockLogin.mockResolvedValue({ success: false });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('myusername', 'mypassword');
    });

    expect(mockLogin).toHaveBeenCalledWith({
      username: 'myusername',
      password: 'mypassword',
    });
  });

  it('handles admin user role', async () => {
    const adminUser: User = {
      id: 1,
      username: 'admin',
      nombreCompleto: 'Admin User',
      rol: 'administrador',
      negocioId: 1,
    };

    mockLogin.mockResolvedValue({ success: true, user: adminUser });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('admin', 'password');
    });

    expect(result.current.user?.rol).toBe('administrador');
  });

  it('handles supervisor user role', async () => {
    const supervisorUser: User = {
      id: 2,
      username: 'supervisor',
      nombreCompleto: 'Supervisor User',
      rol: 'supervisor',
      negocioId: 1,
    };

    mockLogin.mockResolvedValue({ success: true, user: supervisorUser });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('supervisor', 'password');
    });

    expect(result.current.user?.rol).toBe('supervisor');
  });
});
