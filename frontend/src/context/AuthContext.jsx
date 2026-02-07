import React, { createContext, useState, useEffect } from 'react';
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  });

  const [user, setUser] = useState(() => 
  localStorage.getItem('authTokens') ? JSON.parse(atob(localStorage.getItem('authTokens').split('.')[1])) : null
  );

  const loginUser = async (username, password) => {
    try {
      const response = await api.post('auth/login/', { username, password });

      if (response.status === 200) {
        setAuthTokens(response.data);
        setUser(JSON.parse(atob(response.data.access.split('.')[1])));
        localStorage.setItem('authTokens', JSON.stringify(response.data));
        return { success: true };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Invalid Credentials" };
    }
  };

  const register = async (username, email, password) => {
    try {
      await api.post('auth/register/', { username, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Registration Failed" };
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('attendanceData');
  };

  return (
    <AuthContext.Provider value = {{ user, authTokens, loginUser, logoutUser, register }}>
      {children}
    </AuthContext.Provider>
  );
};