// src/context/authContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login, register, getUserProfile } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  // Check for existing session on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await getUserProfile();
          setUser(response.data);
          setIsGuest(false);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const loginUser = async (email, password) => {
    try {
      setError(null);
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsGuest(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      setError(null);
      const response = await register(userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsGuest(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const guestLogin = () => {
    setUser({
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      email: null,
      role: 'guest'
    });
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        isGuest,
        loginUser, 
        registerUser, 
        guestLogin,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};