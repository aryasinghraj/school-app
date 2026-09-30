import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '@shared/types';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (token: string, user: UserSession) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('jps_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: UserSession }>('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.error('Failed to validate session token:', err);
      localStorage.removeItem('jps_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (token: string, userData: UserSession) => {
    localStorage.setItem('jps_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('jps_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
