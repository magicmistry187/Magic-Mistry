// ─────────────────────────────────────────────────────────────────────────────
// reverseGeocode.js — Production-Grade Geolocation & Reverse Geocoding Utility
// ─────────────────────────────────────────────────────────────────────────────
import { parseAddressString, formatCleanAddress, cleanPostalParentheses } from './addressParser.js';
import { BASE_URL } from '../services/apiConnector.js';

/**
 * Gets high-accuracy GPS coordinates using navigator.geolocation
 * Wrapped in a Promise with 15s timeout and user-friendly error messages.
 *
 * @param {PositionOptions} [options]
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 */
export function getCurrentCoordinates(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      const err = new Error('Geolocation is not supported by your browser.');
      err.code = 0;
      return reject(err);
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) {
          msg = 'Location permission denied. Please allow location access in your browser settings.';
        } else if (err.code === 2) {
          msg = 'Location unavailable. Please make sure device location/GPS is turned on.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again or enter your address manually.';
        }
        const customErr = new Error(msg);
        customErr.code = err.code;
        reject(customErr);
      },
      defaultOptions
    );
  });
}

// ── Helper: Parse Indian Address from LocationIQ / OSM ───────────────────────
function parseIndianAddress(data) {
  if (!data) return null;
  const a = data.address || {};
  const displayName = data.display_name || '';

  // 1. Detect City / Town / Village (Authoritative)
  let detectedCity = (
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.city_district ||
    ''
  ).trim();

  if (!detectedCity) {
    detectedCity = (a.county || a.state_district || a.district || '').trim();
  }
  detectedCity = cleanPostalParentheses(detectedCity);

  // 2. Detect Flat / House / Building No.
  let detectedFlat = (
    a.house_number ||
    a.building ||
    a.flat ||
    a.room ||
    a.house_name ||
    a.apartments ||
    ''
  ).trim();

  if (!detectedFlat && a.residential && (/^\d+[a-zA-Z0-9\-\/]*$/.test(a.residential.trim()) || a.residential.trim().length <= 10)) {
    detectedFlat = a.residential.trim();
  }
  if (detectedFlat.includes(',') || detectedFlat.length > 25) {
    detectedFlat = '';
  }

  // 3. Detect State
  let state = (a.state || a.province || a.region || '').trim();
  if (!state && displayName) {
    const lowerFull = displayName.toLowerCase();
    if (lowerFull.includes('delhi')) state = 'Delhi';
    else if (lowerFull.includes('chandigarh')) state = 'Chandigarh';
    else if (lowerFull.includes('puducherry') || lowerFull.includes('pondicherry')) state = 'Puducherry';
    else if (lowerFull.includes('ladakh')) state = 'Ladakh';
    else if (lowerFull.includes('jammu') || lowerFull.includes('kashmir')) state = 'Jammu and Kashmir';
    else if (lowerFull.includes('goa')) state = 'Goa';
    else if (lowerFull.includes('andaman')) state = 'Andaman and Nicobar Islands';
    else if (lowerFull.includes('daman') || lowerFull.includes('diu') || lowerFull.includes('dadra')) state = 'Dadra and Nagar Haveli and Daman and Diu';
    else if (lowerFull.includes('lakshadweep')) state = 'Lakshadweep';
    else if (lowerFull.includes('west bengal')) state = 'West Bengal';
  }

  // 4. Detect Pincode
  let pincode = (a.postcode || '').replace(/\D/g, '').slice(0, 6);
  if (!pincode && displayName) {
    const pinMatch = displayName.match(/\b[1-9]\d{5}\b/);
    if (pinMatch) pincode = pinMatch[0];
  }

  // 5. Detect Landmark
  const landmark = (
    a.landmark ||
    a.amenity ||
    a.attraction ||
    a.place ||
    a.historic ||
    a.leisure ||
    ''
  ).trim();

  // 6. Gather all Street / Locality candidates
  const candidateStreetParts = [];

  const addCandidate = (val) => {
    if (!val || typeof val !== 'string') return;
    const cleanVal = cleanPostalParentheses(val.trim());
    if (!cleanVal) return;
    const lower = cleanVal.toLowerCase();

    // Do not add if it equals city, state, country, or pincode
    if (
      lower === detectedCity.toLowerCase() ||
      lower === state.toLowerCase() ||
      lower === 'india' ||
      lower === 'bharat' ||
      /^\d{6}$/.test(lower)
    ) {
      return;
    }

    // Do not add if it matches detectedFlat
    if (detectedFlat && lower === detectedFlat.toLowerCase()) return;

    // Do not add duplicates or substrings
    const alreadyAdded = candidateStreetParts.some(
      (c) => c.toLowerCase() === lower || c.toLowerCase().split(',').map((s) => s.trim()).includes(lower)
    );
    if (!alreadyAdded) {
      candidateStreetParts.push(cleanVal);
    }
  };

  // POI / Landmark (if not flat)
  if (a.amenity) addCandidate(a.amenity);
  if (a.building && a.building !== detectedFlat) addCandidate(a.building);
  if (a.shop) addCandidate(a.shop);
  if (a.place) addCandidate(a.place);

  // Roads / Streets
  if (a.road) addCandidate(a.road);
  if (a.street) addCandidate(a.street);
  if (a.lane) addCandidate(a.lane);
  if (a.pedestrian) addCandidate(a.pedestrian);
  if (a.footway) addCandidate(a.footway);
  if (a.path) addCandidate(a.path);
  if (a.highway) addCandidate(a.highway);
  if (a.alley) addCandidate(a.alley);

  // Neighbourhood / Colony / Sector
  if (a.neighbourhood) addCandidate(a.neighbourhood);
  if (a.colony) addCandidate(a.colony);
  if (a.residential && a.residential !== detectedFlat) addCandidate(a.residential);
  if (a.quarter) addCandidate(a.quarter);
  if (a.sector) addCandidate(a.sector);
  if (a.ward) addCandidate(a.ward);
  if (a.block) addCandidate(a.block);

  // Suburb / Locality / Sub-district
  if (a.suburb) addCandidate(a.suburb);
  if (a.village_district) addCandidate(a.village_district);
  if (a.subdistrict) addCandidate(a.subdistrict);

  // Hamlet
  if (a.hamlet) addCandidate(a.hamlet);

  // County / Block / Tehsil (e.g. "Bolpur Sriniketan")
  if (a.county) addCandidate(a.county);

  // If still empty, check tokens from displayName before city
  if (candidateStreetParts.length === 0 && displayName) {
    const tokens = displayName.split(',').map((t) => cleanPostalParentheses(t.trim())).filter(Boolean);
    for (const t of tokens) {
      const tLower = t.toLowerCase();
      if (
        tLower !== detectedCity.toLowerCase() &&
        tLower !== state.toLowerCase() &&
        tLower !== 'india' &&
        tLower !== 'bharat' &&
        !/^\d{6}$/.test(tLower) &&
        tLower !== (a.state_district || '').toLowerCase()
      ) {
        addCandidate(t);
      }
    }
  }

  let street = candidateStreetParts.filter(Boolean).join(', ');
  if (!street) {
    street = (a.state_district && a.state_district.toLowerCase() !== detectedCity.toLowerCase())
      ? `${detectedCity} Area`
      : 'Main Road';
  }

  // Format clean full address
  const fullParts = [detectedFlat, street, landmark, detectedCity, state, pincode].filter(Boolean);
  const seen = new Set();
  const uniqueParts = [];
  for (const p of fullParts) {
    const lower = p.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueParts.push(p);
    }
  }

  return {
    flat: detectedFlat,
    street,
    city: detectedCity || 'Local Area',
    state: state || '',
    landmark,
    pincode,
    fullAddress: uniqueParts.join(', ') || displayName,
  };
}

/**
 * Reverse-geocodes latitude and longitude into structured Indian address fields:
 * - Street / Small Area (Mohalla / Colony / Road / Village)
 * - City / Town
 * - State
 * - Pincode (6-digit Indian PIN Code)
 * - Flat / Door (Optional)
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{ flat: string, street: string, city: string, state: string, landmark: string, pincode: string, fullAddress: string }>}
 */
export async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid coordinates provided for reverse geocoding.');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 1: Backend Reverse Geocode Endpoint (Most Accurate & Cached) ───────
  // ═══════════════════════════════════════════════════════════════════════════
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 6500) : null;

    const backendUrl = `${BASE_URL}/address/reverse-geocode?lat=${lat}&lng=${lng}`;
    const res = await fetch(backendUrl, {
      signal: controller ? controller.signal : undefined,
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && json.data.city) {
        console.log('[ReverseGeocode] ✓ Successfully resolved via Backend proxy:', json.data);
        return json.data;
      }
    }
  } catch (backendErr) {
    console.warn('[ReverseGeocode] Backend proxy not available, falling back to direct client resolver...', backendErr);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 2: Direct Client LocationIQ (High-Precision Indian Villages & PINs) 
  // ═══════════════════════════════════════════════════════════════════════════
  let parsedResult = null;
  const locationIqKey = import.meta?.env?.VITE_LOCATIONIQ_API_KEY || 'pk.43b9346c8e8046d3fdc74a70f9d0c1b1';

  if (locationIqKey) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6500) : null;

      const liqUrl = `https://us1.locationiq.com/v1/reverse?key=${locationIqKey}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
      const liqRes = await fetch(liqUrl, { signal: controller ? controller.signal : undefined });
      if (timeoutId) clearTimeout(timeoutId);

      if (liqRes.ok) {
        const data = await liqRes.json();
        if (data && (data.address || data.display_name)) {
          parsedResult = parseIndianAddress(data);
        }
      }
    } catch (liqErr) {
      console.warn('[ReverseGeocode] Client LocationIQ failed, trying fallback...', liqErr);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 3: Direct Client Nominatim at zoom=18 (Fallback) ─────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (!parsedResult || !parsedResult.city || !parsedResult.pincode) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 7000) : null;

      const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
      const res = await fetch(nomUrl, {
        headers: { 'Accept-Language': 'en' },
        signal: controller ? controller.signal : undefined,
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && (data.address || data.display_name)) {
          const nomParsed = parseIndianAddress(data);
          if (!parsedResult) {
            parsedResult = nomParsed;
          } else {
            parsedResult.street = parsedResult.street || nomParsed.street;
            parsedResult.city = parsedResult.city || nomParsed.city;
            parsedResult.state = parsedResult.state || nomParsed.state;
            parsedResult.pincode = parsedResult.pincode || nomParsed.pincode;
            parsedResult.fullAddress = parsedResult.fullAddress || nomParsed.fullAddress;
          }
        }
      }
    } catch (err) {
      console.warn('[ReverseGeocode] Client Nominatim lookup failed:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 4: Indian Postal API (ONLY to resolve missing PIN / State) ────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (parsedResult && (!parsedResult.pincode || !parsedResult.state)) {
    try {
      if (!parsedResult.pincode && (parsedResult.street || parsedResult.city)) {
        const searchTarget = (parsedResult.street.split(',')[0] || parsedResult.city).trim();
        const pinRes = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(searchTarget)}`);
        if (pinRes.ok) {
          const pinData = await pinRes.json();
          if (Array.isArray(pinData) && pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length) {
            parsedResult.pincode = pinData[0].PostOffice[0].Pincode || parsedResult.pincode;
            parsedResult.state = parsedResult.state || pinData[0].PostOffice[0].State || '';
          }
        }
      } else if (parsedResult.pincode && !parsedResult.state) {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${parsedResult.pincode}`);
        if (pinRes.ok) {
          const pinData = await pinRes.json();
          if (Array.isArray(pinData) && pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length) {
            parsedResult.state = pinData[0].PostOffice[0].State || parsedResult.state;
          }
        }
      }
    } catch (pinErr) {
      console.warn('[ReverseGeocode] India Post lookup failed:', pinErr);
    }
  }

  const finalResult = parsedResult || {
    flat: '',
    street: 'Local Area',
    city: 'Local Area',
    state: '',
    landmark: '',
    pincode: '',
    fullAddress: 'Local Area',
  };

  // Clean parentheses and formatting on individual fields
  if (finalResult.city) {
    finalResult.city = cleanPostalParentheses(finalResult.city);
  }
  if (finalResult.street) {
    finalResult.street = finalResult.street.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (finalResult.flat && (finalResult.flat.includes(',') || finalResult.flat.length > 25)) {
    finalResult.flat = '';
  }

  // Format clean full address without duplicates or postal parentheses
  finalResult.fullAddress = formatCleanAddress(finalResult) || finalResult.city || finalResult.street || 'Local Area';

  return finalResult;
}

/**
 * Searches places/villages/towns/streets across India using LocationIQ Autocomplete.
 *
 * @param {string} query Search text (e.g. "Sripur", "Bihta", "Indiranagar")
 * @returns {Promise<Array<{ place_id: string, display_name: string, display_place: string, display_address: string, lat: number, lng: number, address: object }>>}
 */
export async function searchLocations(query) {
  const q = (query || '').trim();
  if (!q || q.length < 2) return [];

  // 1. Try backend proxy
  try {
    const res = await fetch(`${BASE_URL}/address/autocomplete?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[searchLocations] Backend autocomplete unavailable, trying direct client...', err);
  }

  // 2. Direct LocationIQ Autocomplete fallback
  const locationIqKey = import.meta?.env?.VITE_LOCATIONIQ_API_KEY || 'pk.43b9346c8e8046d3fdc74a70f9d0c1b1';
  if (locationIqKey) {
    try {
      const url = `https://api.locationiq.com/v1/autocomplete?key=${locationIqKey}&q=${encodeURIComponent(q)}&countrycodes=in&limit=6&format=json`;
      const res = await fetch(url);
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          return items.map((item) => {
            const parsed = parseIndianAddress(item);
            return {
              place_id: item.place_id,
              display_name: item.display_name,
              display_place: item.display_place || parsed?.street || '',
              display_address: item.display_address || `${parsed?.city || ''}, ${parsed?.state || ''}`,
              lat: Number(item.lat),
              lng: Number(item.lon),
              address: parsed,
            };
          });
        }
      }
    } catch (liqErr) {
      console.warn('[searchLocations] Direct LocationIQ autocomplete failed:', liqErr);
    }
  }

  return [];
}
