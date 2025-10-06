import { useState } from 'react';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem('jwt'),
    isAuthenticated: !!localStorage.getItem('jwt'),
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { token } = data;

      localStorage.setItem('jwt', token);
      setAuthState({ token, isAuthenticated: true });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setAuthState({ token: null, isAuthenticated: false });
  };

  return {
    ...authState,
    login,
    logout,
  };
};
