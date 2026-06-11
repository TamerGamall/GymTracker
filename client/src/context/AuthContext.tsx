import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { clearStoredToken, getStoredToken, setStoredToken } from '../api/client';
import type { PublicUser } from '../types';

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; age: number; gender: 'Male' | 'Female'; height: number; weight: number }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState<boolean>(Boolean(getStoredToken()));
  const [error, setError] = useState<string | null>(null);

  const syncUser = async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.me();
      setUser(response.user);
      setToken(storedToken);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void syncUser();
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authApi.login(payload);
      setStoredToken(response.token);
      setToken(response.token);
      setUser(response.user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; age: number; gender: 'Male' | 'Female'; height: number; weight: number }) => {
    setLoading(true);
    try {
      const response = await authApi.register(payload);
      setStoredToken(response.token);
      setToken(response.token);
      setUser(response.user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const refresh = async () => {
    await syncUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
