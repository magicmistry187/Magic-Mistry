import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // prevent flash before rehydrate
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('mm_location') || 'Bangalore, IN';
  });

  // Rehydrate session from localStorage on app startup
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('mm_token');
      const storedUser = localStorage.getItem('mm_user');
      const storedLocation = localStorage.getItem('mm_location');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
        if (parsedUser.location) {
          setLocation(parsedUser.location);
        } else if (storedLocation) {
          setLocation(storedLocation);
        }
      } else if (storedLocation) {
        setLocation(storedLocation);
      }
    } catch {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken) => {
    const updatedUser = {
      ...userData,
      location: userData.location || location,
    };
    setUser(updatedUser);
    setToken(authToken);
    setIsLoggedIn(true);
    localStorage.setItem('mm_token', authToken);
    localStorage.setItem('mm_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
  };

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    localStorage.setItem('mm_location', newLocation);

    if (user) {
      const updatedUser = { ...user, location: newLocation };
      setUser(updatedUser);
      localStorage.setItem('mm_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        loading,
        location,
        updateLocation,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
