import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createAddressApi, getAddressesApi } from '../services/operations/addressAPI';
import { updateUserLocationApi, getUserProfileApi, updateUserProfileApi, logoutApi } from '../services/operations/authAPI';
import { getVendorProfileApi } from '../services/operations/vendorAPI';
import { parseAddressString, formatCleanAddress } from '../utils/addressParser';

function decodeJwtPayload(jwtToken) {
  if (!jwtToken || typeof jwtToken !== 'string') return null;
  try {
    const parts = jwtToken.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('mm_token') || localStorage.getItem('adminToken') || localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mm_user') || localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email && parsed.email.toLowerCase().trim() === 'magicmistry187@gmail.com') {
          parsed.role = 'admin';
        }
        return parsed;
      }
      // Check adminToken or other token
      const anyToken = localStorage.getItem('adminToken') || localStorage.getItem('mm_token') || localStorage.getItem('token');
      if (anyToken) {
        const decoded = decodeJwtPayload(anyToken);
        if (decoded?.email?.toLowerCase().trim() === 'magicmistry187@gmail.com' || decoded?.role === 'admin') {
          return {
            email: 'magicmistry187@gmail.com',
            role: 'admin',
            fullName: 'Magic Mistry Admin',
            id: decoded?.id,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!(localStorage.getItem('mm_token') || localStorage.getItem('adminToken') || localStorage.getItem('token'));
    } catch {
      return false;
    }
  });

  const [location, setLocation] = useState(() => {
    try {
      const storedLoc = localStorage.getItem('mm_location');
      const cleanLoc = formatCleanAddress(storedLoc);
      return cleanLoc || 'Set Your Location';
    } catch {
      return 'Set Your Location';
    }
  });

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Rehydrate session from localStorage and backend on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken    = localStorage.getItem('mm_token') || localStorage.getItem('adminToken') || localStorage.getItem('token');
        const storedUser     = localStorage.getItem('mm_user') || localStorage.getItem('user');
        const storedLocation = localStorage.getItem('mm_location');
        if (storedToken) {
          setToken(storedToken);
          let parsedUser = null;
          if (storedUser) {
            try {
              parsedUser = JSON.parse(storedUser);
            } catch {}
          }
          if (!parsedUser) {
            const decoded = decodeJwtPayload(storedToken);
            if (decoded?.email?.toLowerCase().trim() === 'magicmistry187@gmail.com' || decoded?.role === 'admin') {
              parsedUser = {
                email: 'magicmistry187@gmail.com',
                role: 'admin',
                fullName: 'Magic Mistry Admin',
                id: decoded?.id,
              };
            }
          }
          if (parsedUser) {
            if (parsedUser?.email && parsedUser.email.toLowerCase().trim() === 'magicmistry187@gmail.com') {
              parsedUser.role = 'admin';
            }
            setUser(parsedUser);
          }
          setIsLoggedIn(true);

          // Initial fallback while syncing from backend (safely access parsedUser)
          const initialUserLoc = parsedUser?.location ? formatCleanAddress(parsedUser.location) : '';
          const initialStoredLoc = formatCleanAddress(storedLocation);
          const initialResolvedLoc = initialUserLoc || initialStoredLoc || 'Set Your Location';
          setLocation(initialResolvedLoc);

          // Rehydrate fresh profile data from backend (AUTHORITATIVE SOURCE)
          const isAdminUser = parsedUser?.role === 'admin' || (parsedUser?.email && parsedUser.email.toLowerCase().trim() === 'magicmistry187@gmail.com');
          if (isAdminUser && parsedUser) {
            parsedUser.role = 'admin';
            setUser(parsedUser);
            localStorage.setItem('mm_user', JSON.stringify(parsedUser));
            localStorage.setItem('adminToken', storedToken);
            // Admin role is preserved
          } else if (parsedUser) {
            try {
              let profileRes;
              let profileData;

              const isVendor = parsedUser.role === 'vendor' || !!parsedUser.vendorId || !!parsedUser.serviceRadius;

              if (isVendor) {
                profileRes = await getVendorProfileApi(storedToken);
                if (profileRes?.success && profileRes?.vendorProfile) {
                  profileData = profileRes.vendorProfile;
                }
              } else {
                profileRes = await getUserProfileApi(storedToken);
                if (profileRes?.success && profileRes?.user) {
                  profileData = profileRes.user;
                }
              }

              if (profileRes && profileRes.success && profileData) {
                const nestedUser = profileData.user && typeof profileData.user === 'object' ? profileData.user : {};
                const freshUser = {
                  ...parsedUser,
                  ...profileData,
                  ...nestedUser,
                  role: (profileData?.email?.toLowerCase().trim() === 'magicmistry187@gmail.com' || parsedUser?.email?.toLowerCase().trim() === 'magicmistry187@gmail.com')
                    ? 'admin'
                    : (profileData.role || parsedUser.role || (isVendor ? 'vendor' : 'customer')),
                };

                // Check authoritative database location
                const rawDbLocation = (freshUser.location && freshUser.location !== 'Set Your Location' ? freshUser.location : '') ||
                  (profileData.serviceAddress && profileData.serviceAddress !== 'Set Your Location' ? profileData.serviceAddress : '') ||
                  (freshUser.serviceAddress && freshUser.serviceAddress !== 'Set Your Location' ? freshUser.serviceAddress : '');
                const dbLocation = formatCleanAddress(rawDbLocation);

                if (dbLocation) {
                  freshUser.location = dbLocation;
                  setLocation(dbLocation);
                  localStorage.setItem('mm_location', dbLocation);
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
                    const formattedAddr = formatCleanAddress(def);
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
    const isAdminEmail = userData?.email && userData.email.toLowerCase().trim() === 'magicmistry187@gmail.com';
    const role = isAdminEmail ? 'admin' : (userData.role || 'customer');

    // Database location is the authoritative source:
    const rawDbLoc = userData.location && userData.location !== 'Set Your Location' ? userData.location.trim() : '';
    const dbLoc = formatCleanAddress(rawDbLoc);

    const updatedUser = {
      ...userData,
      role,
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
    if (role === 'admin') {
      localStorage.setItem('adminToken', authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    // Fetch authoritative saved addresses upon login
    fetchAddresses(authToken);
  };

  const logout = () => {
    // 1. Immediately & synchronously clear all client auth state and storage
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

    // 2. Dispatch backend logout API in background (fire-and-forget) to invalidate server cookie/session
    logoutApi().catch((apiErr) => {
      console.warn('Backend logout API error:', apiErr);
    });
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
    const cleanLocation = formatCleanAddress(newLocation);
    const isClearing = !cleanLocation || cleanLocation === 'Set Your Location';
    const locValue = isClearing ? 'Set Your Location' : cleanLocation;

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

    // ── Sync Navbar location pill for vendor profile updates ─────────────────
    // When a vendor updates their serviceAddress or location in the dashboard,
    // reflect it immediately in the Navbar location pill (same as customer flow).
    const rawDisplayLoc =
      (profileData.serviceAddress && profileData.serviceAddress !== 'Set Your Location'
        ? profileData.serviceAddress
        : null) ||
      (profileData.location && profileData.location !== 'Set Your Location'
        ? profileData.location
        : null);
    const newDisplayLocation = formatCleanAddress(rawDisplayLoc);

    if (newDisplayLocation) {
      setLocation(newDisplayLocation);
      localStorage.setItem('mm_location', newDisplayLocation);
      // Persist GPS coords if provided
      if (profileData.latitude && profileData.longitude) {
        localStorage.setItem('mm_lat', profileData.latitude);
        localStorage.setItem('mm_lng', profileData.longitude);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const isVendorUser = updatedUser.role === 'vendor' || !!updatedUser.vendorId || !!updatedUser.serviceRadius;

    // Persist to backend if token is available
    if (token) {
      if (isVendorUser) {
        // Vendors use updateVendorProfileApi in VendorDashboardPage to persist data.
        // updateProfile for vendors only needs to keep client state and Navbar synced.
        return { success: true, user: updatedUser };
      }

      try {
        const payload = {
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber,
          location: newDisplayLocation || profileData.location,
          latitude: profileData.latitude,
          longitude: profileData.longitude,
        };
        const res = await updateUserProfileApi(payload, token);
        if (res.success && res.user) {
          const isAdminEmail = (res.user?.email && res.user.email.toLowerCase().trim() === 'magicmistry187@gmail.com') ||
            (updatedUser?.email && updatedUser.email.toLowerCase().trim() === 'magicmistry187@gmail.com');
          const syncedUser = {
            ...updatedUser,
            ...res.user,
            role: isAdminEmail ? 'admin' : (updatedUser.role || res.user.role || 'customer'),
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
