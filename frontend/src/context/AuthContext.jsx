import React, { createContext, useContext, useState, useEffect } from 'react';
import { createAddressApi } from '../services/operations/addressAPI';
import { updateUserLocationApi, getUserProfileApi } from '../services/operations/authAPI';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Set Your Location');

  // Rehydrate session from localStorage and backend on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken    = localStorage.getItem('mm_token');
        const storedUser     = localStorage.getItem('mm_user');
        const storedLocation = localStorage.getItem('mm_location');

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);

          const resolvedLoc =
            parsedUser.location ||
            storedLocation ||
            'Set Your Location';

          setLocation(resolvedLoc);

          // Rehydrate fresh profile data from backend
          try {
            const profileRes = await getUserProfileApi(storedToken);
            if (profileRes.success && profileRes.user) {
              const freshUser = { ...parsedUser, ...profileRes.user };
              setUser(freshUser);
              localStorage.setItem('mm_user', JSON.stringify(freshUser));
              if (freshUser.location) {
                setLocation(freshUser.location);
                localStorage.setItem('mm_location', freshUser.location);
              }
              if (freshUser.latitude && freshUser.longitude) {
                localStorage.setItem('mm_lat', freshUser.latitude);
                localStorage.setItem('mm_lng', freshUser.longitude);
              }
            }
          } catch (profileErr) {
            console.warn('[Magic Mistry] Profile sync on load error:', profileErr);
          }
        } else {
          setLocation(storedLocation || 'Set Your Location');
        }
      } catch {
        localStorage.removeItem('mm_token');
        localStorage.removeItem('mm_user');
        setLocation('Set Your Location');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, authToken) => {
    // Priority for location on login:
    // 1. Location stored in the backend user object (most authoritative)
    // 2. Location the user already set before login (mm_location in localStorage)
    // 3. Location already in memory (user changed it before logging in)
    // 4. Neutral default — never force a hardcoded city
    const savedLocation = localStorage.getItem('mm_location');
    const userLoc =
      userData.location ||
      savedLocation ||
      (location !== 'Set Your Location' ? location : '') ||
      'Set Your Location'; // ← no hardcoded city fallback

    const savedLat = localStorage.getItem('mm_lat');
    const savedLng = localStorage.getItem('mm_lng');

    const updatedUser = {
      ...userData,
      location: userLoc,
    };

    if (userData.latitude || savedLat) {
      updatedUser.latitude = userData.latitude || savedLat;
    }
    if (userData.longitude || savedLng) {
      updatedUser.longitude = userData.longitude || savedLng;
    }

    setUser(updatedUser);
    setToken(authToken);
    setIsLoggedIn(true);
    setLocation(userLoc);
    localStorage.setItem('mm_token', authToken);
    localStorage.setItem('mm_user', JSON.stringify(updatedUser));
    localStorage.setItem('mm_location', userLoc);
    if (updatedUser.latitude && updatedUser.longitude) {
      localStorage.setItem('mm_lat', updatedUser.latitude);
      localStorage.setItem('mm_lng', updatedUser.longitude);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setLocation('Set Your Location');
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
  };

  /**
   * updateLocation — update location in state + localStorage.
   *
   * @param {string} newLocation  Human-readable location string (city/address)
   * @param {object} [geoCoords]  Optional GPS coords { lat, lng } from navigator.geolocation.
   *   When provided AND the user is logged in, a full structured address record is saved
   *   to the backend via POST /api/address (addressAPI.js → address.controller.js).
   *
   * CONNECTION:
   *   updateLocation(str, coords)
   *     → createAddressApi(payload, token)
   *       → apiConnector('POST', /api/address, ...)
   *         → address.controller.js → createAddress()
   *           → Address.create({ ..., location: { type:'Point', coordinates:[lng,lat] } })
   */
  const updateLocation = async (newLocation, geoCoords = null) => {
    // ── CONSOLE LOG: Always fires when updateLocation is called ───────────
    console.log(
      '%c[Magic Mistry] 📍 updateLocation called',
      'color: #f97316; font-weight: bold;'
    );
    console.log('  New location    :', newLocation);
    console.log('  GPS coords      :', geoCoords ?? 'not provided (city/manual selection)');
    console.log('  User logged in  :', isLoggedIn);
    console.log('  Token present   :', !!token);

    // 1. Always update in-memory state and localStorage immediately (optimistic)
    setLocation(newLocation);
    localStorage.setItem('mm_location', newLocation);

    if (geoCoords?.lat && geoCoords?.lng) {
      localStorage.setItem('mm_lat', geoCoords.lat);
      localStorage.setItem('mm_lng', geoCoords.lng);
    }

    if (user) {
      const updatedUser = { ...user, location: newLocation };
      if (geoCoords?.lat && geoCoords?.lng) {
        updatedUser.latitude = geoCoords.lat;
        updatedUser.longitude = geoCoords.lng;
      }
      setUser(updatedUser);
      localStorage.setItem('mm_user', JSON.stringify(updatedUser));
    }

    // ── ALWAYS PERSIST TO USER RECORD IN BACKEND IF LOGGED IN ─────────────
    if (token) {
      updateUserLocationApi(
        {
          location: newLocation,
          latitude: geoCoords?.lat ?? null,
          longitude: geoCoords?.lng ?? null,
        },
        token
      ).then((res) => {
        if (res.success && res.user) {
          console.log('[Magic Mistry] ✅ User location persisted to MongoDB:', res.user.location);
        }
      }).catch((err) => {
        console.warn('[Magic Mistry] ❌ Failed to persist user location to backend:', err);
      });
    }

    // ── If GPS coords are provided, also persist address record ─────────────
    if (token && geoCoords?.lat && geoCoords?.lng) {
      try {
        const payload = {
          addressType: 'Home',
          house: 'Current Location',
          street: newLocation,
          city: newLocation.split(',')[0] || newLocation,
          state: 'West Bengal',
          pincode: '000000',
          isDefault: true,
          location: {
            type: 'Point',
            coordinates: [geoCoords.lng, geoCoords.lat],
          },
        };

        createAddressApi(payload, token).then((result) => {
          if (result.success) {
            console.log('[Magic Mistry] ✅ GPS Address record created in backend:', result.address?._id);
          }
        });
      } catch (err) {
        console.warn('[Magic Mistry] GPS address record error:', err);
      }
    }
  };

  const updateProfile = (profileData) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      ...profileData,
    };
    setUser(updatedUser);
    localStorage.setItem('mm_user', JSON.stringify(updatedUser));
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
        updateProfile,
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
