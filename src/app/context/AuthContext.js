'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import ApiClient from '@/utils/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Token management functions
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };

  const clearAuthToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  };

  const apiClient = new ApiClient(getAuthToken, clearAuthToken);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = apiClient.isLoggedIn();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        try {
          const response = await apiClient.getProfile();
          setUser(response.data);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch user profile:', err);
          setUser(null);
          setIsLoggedIn(false);
          apiClient.removeToken(); // Clear token on 401
        }
      }
      setLoading(false);
    };
    checkAuth();

    // Listen for token changes in other tabs
    const handleStorageChange = (event) => {
      if (event.key === 'authToken') {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const register = async (name, email, password) => {
    const response = await apiClient.register(name, email, password);
    setIsLoggedIn(true);
    const userRes = await apiClient.getProfile();
    setUser(userRes.data);
    return response;
  };
  const login = async (email, password) => {
    const response = await apiClient.login(email, password);
    setIsLoggedIn(true);
    const userRes = await apiClient.getProfile();
    setUser(userRes.data);
    return response;
  };
  const logout = async () => {
    try {
      // console.log('Logging out user'); // Commented out for ESLint
      setUser(null);
      setIsLoggedIn(false);
      apiClient.removeToken();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error during logout:', error);
    }
  };
  const deleteAccount = async () => {
    try {
      await apiClient.removeProfile();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Failed to delete account.', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, setUser, register, login, logout, deleteAccount, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
