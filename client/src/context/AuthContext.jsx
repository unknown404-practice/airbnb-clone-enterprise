import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('airbnb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('airbnb_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('airbnb_user', JSON.stringify(res.data.user));
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem('airbnb_token');
          localStorage.removeItem('airbnb_user');
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('airbnb_token', receivedToken);
    localStorage.setItem('airbnb_user', JSON.stringify(receivedUser));
    setIsAuthModalOpen(false);
    return receivedUser;
  };

  const register = async (name, email, password, role = 'guest') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('airbnb_token', receivedToken);
    localStorage.setItem('airbnb_user', JSON.stringify(receivedUser));
    setIsAuthModalOpen(false);
    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue client cleanup even if network fails
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('airbnb_token');
    localStorage.removeItem('airbnb_user');
  };

  const switchRole = async (targetRole) => {
    const res = await api.post('/auth/switch-role', { role: targetRole });
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem('airbnb_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchRole,
        isAuthModalOpen,
        authModalMode,
        openAuth,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
