'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('veyra_token');
        const storedUser = localStorage.getItem('veyra_user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          connectSocket(storedToken);

          // Silently fetch fresh user profile
          try {
            const { data } = await api.get('/auth/me');
            if (data.success && data.user) {
              setUser(data.user);
              localStorage.setItem('veyra_user', JSON.stringify(data.user));
            }
          } catch (err) {
            console.warn('Session expired or server unavailable');
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    if (data.success && data.token) {
      localStorage.setItem('veyra_token', data.token);
      localStorage.setItem('veyra_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      connectSocket(data.token);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    if (data.success && data.token) {
      localStorage.setItem('veyra_token', data.token);
      localStorage.setItem('veyra_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      connectSocket(data.token);
      return data;
    }
    throw new Error(data.message || 'Signup failed');
  };

  const logout = useCallback(() => {
    localStorage.removeItem('veyra_token');
    localStorage.removeItem('veyra_user');
    disconnectSocket();
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [router]);

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('veyra_user', JSON.stringify(merged));
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('veyra_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
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

export default AuthContext;
