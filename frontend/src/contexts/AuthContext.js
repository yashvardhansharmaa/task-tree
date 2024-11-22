import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/login', credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(API_ENDPOINTS.auth.register, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Add logout and other auth methods

  return (
    <AuthContext.Provider value={{ user, loading, login, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 