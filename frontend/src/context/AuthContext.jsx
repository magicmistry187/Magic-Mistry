import React, { createContext, useContext, useState, useEffect } from 'react';
// ── CONNECTION: Import address API to persist detected location to backend ───
// addressAPI.js → apiConnector → POST /api/address (address.controller.js)
import { createAddressApi } from '../services/operations/addressAPI';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // prevent flash before rehydrate
  const [location, setLocation] = useState('Set Your Location');

  // Rehydrate session from localStorage on app startup
  useEffect(() => {
    try {
      const storedToken    = localStorage.getItem('mm_token');
      const storedUser     = localStorage.getItem('mm_user');
      const storedLocation = localStorage.getItem('mm_location');

      // Clean up the old hardcoded 'Kolkata, West Bengal' fallback that was
      // baked in by a previous bug — reset it so user can set their real location
      const STALE_DEFAULT = 'Kolkata, West Bengal';

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);

        // If the stored location is the stale hardcoded default, clear it
        if (parsedUser.location === STALE_DEFAULT) {
          parsedUser.location = '';
          localStorage.setItem('mm_user', JSON.stringify(parsedUser));
        }
        if (storedLocation === STALE_DEFAULT) {
          localStorage.removeItem('mm_location');
        }

        setUser(parsedUser);
        setIsLoggedIn(true);

        // Resolve display location
        const resolvedLoc =
          (parsedUser.location && parsedUser.location !== STALE_DEFAULT ? parsedUser.location : null) ||
          (storedLocation && storedLocation !== STALE_DEFAULT ? storedLocation : null) ||
          'Set Your Location';

        setLocation(resolvedLoc);
      } else {
        setLocation('Set Your Location');
      }
    } catch {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
      setLocation('Set Your Location');
    } finally {
      setLoading(false);
    }
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

    const updatedUser = {
      ...userData,
      location: userLoc,
    };
    setUser(updatedUser);
    setToken(authToken);
    setIsLoggedIn(true);
    setLocation(userLoc);
    localStorage.setItem('mm_token', authToken);
    localStorage.setItem('mm_user', JSON.stringify(updatedUser));
    localStorage.setItem('mm_location', userLoc);
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

    if (user) {
      const updatedUser = { ...user, location: newLocation };
      setUser(updatedUser);
      localStorage.setItem('mm_user', JSON.stringify(updatedUser));
    }

    // ── CONNECTION TO BACKEND ──────────────────────────────────────────────
    // 2. If user is logged in AND we have GPS coords, persist a full address
    //    record to the backend so it is accessible on other devices / sessions.
    //    This connects the LocationSelectorModal / AddressForm GPS flow to the
    //    backend address.controller.js → createAddress endpoint.
    if (!geoCoords?.lat || !geoCoords?.lng) {
      console.log(
        '%c[Magic Mistry] ⏭️ Skipping backend sync — no GPS coords (city list or manual entry)',
        'color: #94a3b8;'
      );
    } else if (!isLoggedIn || !token) {
      console.log(
        '%c[Magic Mistry] ⏭️ Skipping backend sync — user not logged in',
        'color: #94a3b8;'
      );
    }

    if (isLoggedIn && token && geoCoords?.lat && geoCoords?.lng) {
      try {
        const payload = {
          addressType: 'Home',
          // Backend requires house, street, city, state, pincode, location
          // We use the human-readable string as the street field when GPS is used
          house: '-',                       // placeholder — user can edit via saved addresses
          street: newLocation,              // full reverse-geocoded string
          city: newLocation.split(',')[0] || newLocation,
          state: 'West Bengal',             // service area constraint
          pincode: '000000',                // placeholder — not available from reverse-geocode
          isDefault: false,
          // GeoJSON Point — required by address.model.js for 2dsphere index
          location: {
            type: 'Point',
            coordinates: [geoCoords.lng, geoCoords.lat], // [longitude, latitude]
          },
        };

        // ── CONSOLE LOG: About to hit the backend ─────────────────────────
        console.log(
          '%c[Magic Mistry] 🚀 Sending location to backend...',
          'color: #3b82f6; font-weight: bold;'
        );
        console.log('  Location string :', newLocation);
        console.log('  GPS Coordinates :', `lat=${geoCoords.lat}, lng=${geoCoords.lng}`);
        console.log('  Endpoint        :', 'POST /api/address');
        console.log('  Payload         :', payload);

        // Fire-and-forget: non-blocking, errors logged but don't break UI
        createAddressApi(payload, token).then((result) => {
          if (!result.success) {
            console.warn(
              '%c[Magic Mistry] ❌ Location NOT saved to backend:',
              'color: #ef4444; font-weight: bold;',
              result.message
            );
          } else {
            console.log(
              '%c[Magic Mistry] ✅ Location sent to backend successfully!',
              'color: #22c55e; font-weight: bold;'
            );
            console.log('  Location saved :', newLocation);
            console.log('  Backend DB _id :', result.address?._id);
          }
        });
      } catch (err) {
        // Background sync failure — don't block the user
        console.warn(
          '%c[Magic Mistry] ❌ Unexpected error syncing location to backend:',
          'color: #ef4444; font-weight: bold;',
          err
        );
      }
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
