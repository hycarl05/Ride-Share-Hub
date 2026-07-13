import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { User, UserRole } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('prebet_user');
    const storedToken = localStorage.getItem('prebet_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('prebet_user');
        localStorage.removeItem('prebet_token');
      }
    }
    setIsLoaded(true);
  }, []);

  const login = useCallback((newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('prebet_user', JSON.stringify(newUser));
    localStorage.setItem('prebet_token', newToken);

    if (newUser.role === 'student') setLocation('/student/dashboard');
    else if (newUser.role === 'driver') setLocation('/driver/dashboard');
    else if (newUser.role === 'admin') setLocation('/admin/dashboard');
  }, [setLocation]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('prebet_user');
    localStorage.removeItem('prebet_token');
    setLocation('/login');
  }, [setLocation]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('prebet_user', JSON.stringify(updatedUser));
  }, []);

  if (!isLoaded) return null;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      role: user?.role || null,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
