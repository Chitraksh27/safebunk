import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // 1. Check Session on Load
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
        console.log("Session invalid. Logging out.");
        logout();
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  // 2. LOGIN (Already Fixed)
  const login = async (username, password) => {
    try {
      const response = await api.post('attendance/login/', { username, password });
      const { user: userData, tokens } = response.data;

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.detail 
                    || error.response?.data?.message 
                    || "Login failed.";
      return { success: false, error: errorMsg };
    }
  };

  // 3. REGISTER (👉 NEW ADDITION TO FIX YOUR ERROR)
  const register = async (username, email, password) => {
    try {
      await api.post('attendance/register/', { username, email, password });
      return { success: true };
    } catch (error) {
      console.error("Registration Error:", error);
      
      // Extract specific validation errors (e.g., "Username taken")
      let errorMsg = "Registration failed.";
      if (error.response?.data) {
          if (error.response.data.username) errorMsg = error.response.data.username[0];
          else if (error.response.data.detail) errorMsg = error.response.data.detail;
          else if (error.response.data.message) errorMsg = error.response.data.message;
      }
      
      return { success: false, error: errorMsg };
    }
  };

  // 4. LOGOUT
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    // 👉 ADD register TO THE VALUE OBJECT
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};