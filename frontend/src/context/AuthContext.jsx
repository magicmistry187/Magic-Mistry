import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // prevent flash before rehydrate

  // Rehydrate session from localStorage on app startup
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('mm_token');
      const storedUser = localStorage.getItem('mm_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
    } catch {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsLoggedIn(true);
    localStorage.setItem('mm_token', authToken);
    localStorage.setItem('mm_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
