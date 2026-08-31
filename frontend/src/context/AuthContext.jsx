import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createAddressApi, getAddressesApi } from '../services/operations/addressAPI';
import { updateUserLocationApi, getUserProfileApi, updateUserProfileApi } from '../services/operations/authAPI';
import { getVendorProfileApi } from '../services/operations/vendorAPI';
import { parseAddressString } from '../utils/addressParser';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Set Your Location');
  const [addresses, setAddresses] = useState([]);

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

          // Initial fallback while syncing from backend
          const initialUserLoc = parsedUser.location && parsedUser.location !== 'Set Your Location' ? parsedUser.location : '';
          const initialResolvedLoc = initialUserLoc || (storedLocation && storedLocation !== 'Set Your Location' ? storedLocation : 'Set Your Location');
          setLocation(initialResolvedLoc);

          // Rehydrate fresh profile data from backend (AUTHORITATIVE SOURCE)
          if (parsedUser.role === 'admin') {
            // Nothing to sync — keep what's in localStorage as the source of truth
          } else {
            try {
              let profileRes;
              let profileData;

              if (parsedUser.role === 'vendor') {
                profileRes = await getVendorProfileApi(storedToken);
                profileData = profileRes.vendorProfile;
              } else {
                profileRes = await getUserProfileApi(storedToken);
                profileData = profileRes.user;
              }

              if (profileRes.success && profileData) {
                const nestedUser = profileData.user && typeof profileData.user === 'object' ? profileData.user : {};
                const freshUser = {
                  ...parsedUser,
                  ...profileData,
                  ...nestedUser,
                  role: parsedUser.role, // keep stored role authoritative
                };

                // Check authoritative database location
                const dbLocation = (freshUser.location && freshUser.location !== 'Set Your Location' ? freshUser.location : '') ||
                  (profileData.serviceAddress && profileData.serviceAddress !== 'Set Your Location' ? profileData.serviceAddress : '') ||
                  (freshUser.serviceAddress && freshUser.serviceAddress !== 'Set Your Location' ? freshUser.serviceAddress : '');

                if (dbLocation && dbLocation.trim() !== '') {
                  freshUser.location = dbLocation.trim();
                  setLocation(dbLocation.trim());
                  localStorage.setItem('mm_location', dbLocation.trim());
                  if (freshUser.latitude && freshUser.longitude) {
                    localStorage.setItem('mm_lat', freshUser.latitude);
                    localStorage.setItem('mm_lng', freshUser.longitude);
                  }
                } else {
                  // Backend DB has NO address saved: clear stale localStorage location
                  freshUser.location = '';
                  setLocation('Set Your Location');
                  localStorage.removeItem('mm_location');
                  localStorage.removeItem('mm_lat');
                  localStorage.removeItem('mm_lng');
                }

                // Fetch authoritative addresses from Address collection
                try {
                  const addrRes = await getAddressesApi(storedToken);
                  if (addrRes.success && Array.isArray(addrRes.addresses) && addrRes.addresses.length > 0) {
                    setAddresses(addrRes.addresses);
                    const def = addrRes.addresses.find((a) => a.isDefault) || addrRes.addresses[0];
                    const formattedAddr = [def.house || def.flat, def.street, def.landmark, def.city, def.state, def.pincode]
                      .filter(Boolean)
                      .join(', ');
                    if (formattedAddr) {
                      freshUser.location = formattedAddr;
                      setLocation(formattedAddr);
                      localStorage.setItem('mm_location', formattedAddr);
                      if (def.location?.coordinates?.length === 2) {
                        localStorage.setItem('mm_lng', def.location.coordinates[0]);
                        localStorage.setItem('mm_lat', def.location.coordinates[1]);
                      }
                    }
                  } else {
                    // When database has no addresses, completely clear active location
                    setAddresses([]);
                    freshUser.location = '';
                    setLocation('Set Your Location');
                    localStorage.removeItem('mm_location');
                    localStorage.removeItem('mm_lat');
                    localStorage.removeItem('mm_lng');
                  }
                } catch (addrErr) {
                  console.warn('[Magic Mistry] Address fetch on init error:', addrErr);
                }

                setUser(freshUser);
                localStorage.setItem('mm_user', JSON.stringify(freshUser));
              }
            } catch (profileErr) {
              console.warn('[Magic Mistry] Profile sync on load error:', profileErr);
            }
          }
        } else {
          const validStoredLocation = storedLocation && storedLocation !== 'Set Your Location' ? storedLocation : '';
          if (validStoredLocation) {
            setLocation(validStoredLocation);
          } else {
            setLocation('Set Your Location');
            localStorage.removeItem('mm_location');
          }
        }
      } catch {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (storageErr) {
          console.warn('Storage clear error:', storageErr);
        }
        setLocation('Set Your Location');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchAddresses = useCallback(async (authToken) => {
    const t = authToken || token || (typeof window !== 'undefined' ? localStorage.getItem('mm_token') || localStorage.getItem('token') : null);
    if (!t) return [];
    try {
      const res = await getAddressesApi(t);
      if (res.success && Array.isArray(res.addresses)) {
        setAddresses(res.addresses);
        return res.addresses;
      }
      return [];
    } catch (err) {
      console.warn('[Magic Mistry] Failed to fetch addresses:', err);
      return [];
    }
  }, [token]);

  const login = (userData, authToken) => {
    // Database location is the authoritative source:
    const dbLoc = userData.location && userData.location !== 'Set Your Location' ? userData.location.trim() : '';

    const updatedUser = {
      ...userData,
      location: dbLoc,
    };

    setUser(updatedUser);
    setToken(authToken);
    setIsLoggedIn(true);

    if (dbLoc) {
      setLocation(dbLoc);
      localStorage.setItem('mm_location', dbLoc);
      if (userData.latitude && userData.longitude) {
        localStorage.setItem('mm_lat', userData.latitude);
        localStorage.setItem('mm_lng', userData.longitude);
      }
    } else {
      // Backend DB has no location: do NOT store dummy location in localStorage
      setLocation('Set Your Location');
      localStorage.removeItem('mm_location');
      localStorage.removeItem('mm_lat');
      localStorage.removeItem('mm_lng');
    }

    localStorage.setItem('mm_token', authToken);
    localStorage.setItem('mm_user', JSON.stringify(updatedUser));

    // Fetch authoritative saved addresses upon login
    fetchAddresses(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setAddresses([]);
    setLocation('Set Your Location');
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (storageErr) {
      console.warn('Storage clear error on logout:', storageErr);
    }
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
    const isClearing = !newLocation || newLocation === 'Set Your Location';
    const locValue = isClearing ? 'Set Your Location' : newLocation;

    // ── CONSOLE LOG: Always fires when updateLocation is called ───────────
    console.log(
      '%c[Magic Mistry] 📍 updateLocation called',
      'color: #f97316; font-weight: bold;'
    );
    console.log('  New location    :', locValue);
    console.log('  GPS coords      :', geoCoords ?? 'not provided (city/manual selection)');
    console.log('  User logged in  :', isLoggedIn);
    console.log('  Token present   :', !!token);

    // 1. Always update in-memory state and localStorage immediately (optimistic)
    setLocation(locValue);
    if (isClearing) {
      localStorage.removeItem('mm_location');
      localStorage.removeItem('mm_lat');
      localStorage.removeItem('mm_lng');
    } else {
      localStorage.setItem('mm_location', locValue);
      if (geoCoords?.lat && geoCoords?.lng) {
        localStorage.setItem('mm_lat', geoCoords.lat);
        localStorage.setItem('mm_lng', geoCoords.lng);
      }
    }

    if (user) {
      const updatedUser = { ...user, location: isClearing ? '' : locValue };
      if (isClearing) {
        updatedUser.latitude = null;
        updatedUser.longitude = null;
      } else if (geoCoords?.lat && geoCoords?.lng) {
        updatedUser.latitude = geoCoords.lat;
        updatedUser.longitude = geoCoords.lng;
      }
      setUser(updatedUser);
      localStorage.setItem('mm_user', JSON.stringify(updatedUser));
    }

    // ── ALWAYS PERSIST TO USER & ADDRESS RECORD IN BACKEND IF LOGGED IN ──
    if (token) {
      updateUserLocationApi(
        {
          location: isClearing ? '' : locValue,
          latitude: isClearing ? null : (geoCoords?.lat ?? null),
          longitude: isClearing ? null : (geoCoords?.lng ?? null),
        },
        token
      ).then((res) => {
        if (res.success && res.user) {
          console.log('[Magic Mistry] ✅ User location persisted to MongoDB:', res.user.location);
          fetchAddresses(token);
        }
      }).catch((err) => {
        console.warn('[Magic Mistry] ❌ Failed to persist user location to backend:', err);
      });
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) return { success: false, message: 'User not logged in' };
    
    // Optimistically update local user state
    const updatedUser = {
      ...user,
      ...profileData,
    };
    setUser(updatedUser);
    localStorage.setItem('mm_user', JSON.stringify(updatedUser));

    // Persist to backend if token is available
    if (token) {
      try {
        const payload = {
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber,
          location: profileData.location,
          latitude: profileData.latitude,
          longitude: profileData.longitude,
        };
        const res = await updateUserProfileApi(payload, token);
        if (res.success && res.user) {
          const syncedUser = {
            ...updatedUser,
            ...res.user,
          };
          setUser(syncedUser);
          localStorage.setItem('mm_user', JSON.stringify(syncedUser));
          return { success: true, user: syncedUser };
        }
        return res;
      } catch (err) {
        console.warn('[Magic Mistry] Failed to persist profile to backend:', err);
        return { success: false, message: err.message };
      }
    }
    return { success: true, user: updatedUser };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        loading,
        location,
        addresses,
        setAddresses,
        fetchAddresses,
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
