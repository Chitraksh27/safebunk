import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // 1. Session Validation on Load
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await api.get('attendance/dashboard/');
      } catch (error) {
        console.log("Session expired or invalid. Logging out.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // 2. THE FIX: Login Function performing API Call
  const login = async (username, password) => {
    try {
      // A. Call the API
      const response = await api.post('attendance/login/', { username, password });
      
      const { user: userData, tokens } = response.data;

      // B. Save to Storage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // C. Update State
      setUser(userData);

      // D. Return Success (So Login.jsx knows to redirect)
      return { success: true };

    } catch (error) {
      console.error("Login Failed:", error);
      
      // Extract error message safely
      const errorMsg = error.response?.data?.detail 
                    || error.response?.data?.message 
                    || "Login failed. Check your credentials.";

      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    // Optional: Redirect to login if not handled by ProtectedRoute
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};