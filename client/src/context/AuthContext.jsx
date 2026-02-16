import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { getToken, setToken as saveToken, removeToken } from '../utils/localStorage';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          removeToken();
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
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

  const signup = async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
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

  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    signup,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
