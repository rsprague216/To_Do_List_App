/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Manages user login, logout, signup, and token persistence.
 * 
 * Features:
 * - JWT token storage in localStorage
 * - Automatic token verification on app load
 * - User state management
 * - Loading states during auth operations
 */

import { createContext, useContext, useState, useEffect } from 'react';

// API base URL - adjust for production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Authentication Context
 * Provides: user, token, login, logout, signup, loading, error
 */
export const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * Wraps the app and provides authentication functionality
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Verify token and load user on mount
   * Checks if stored token is still valid
   */
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          // Token invalid or expired
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  /**
   * Login function
   * Authenticates user and stores token
   * 
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
        // Login failed
        setError(data.error || 'Login failed');
        setLoading(false);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Signup function
   * Creates new user account and logs them in
   * 
   * @param {string} username - Desired username
   * @param {string} password - Desired password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const signup = async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and log user in
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
        // Signup failed
        setError(data.error || 'Signup failed');
        setLoading(false);
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout function
   * Clears user session and token
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  /**
   * Context value provided to children
   */
  const value = {
    user,
    token,
    login,
    logout,
    signup,
    loading,
    error,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
