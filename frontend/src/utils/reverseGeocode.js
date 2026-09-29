// ─────────────────────────────────────────────────────────────────────────────
// reverseGeocode.js — Production-Grade Geolocation & Reverse Geocoding Utility
// ─────────────────────────────────────────────────────────────────────────────
import { parseAddressString, formatCleanAddress, cleanPostalParentheses, KNOWN_DISTRICTS, isAdministrativeToken } from './addressParser.js';
import { BASE_URL } from '../services/apiConnector.js';

/**
 * Gets high-accuracy GPS coordinates using navigator.geolocation.watchPosition
 * Performs multi-sample convergence to achieve true GPS satellite lock (accuracy <= 35m).
 * Avoids the common issue where a single getCurrentPosition returns a coarse network /
 * cell-tower fix that is 2 to 3 km off.
 *
 * @param {PositionOptions} [options]
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, isHighAccuracy: boolean }>}
 */
export function getCurrentCoordinates(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      const err = new Error('Geolocation is not supported by your browser.');
      err.code = 0;
      return reject(err);
    }

    const maxWaitTime = options.timeout || 12000;
    const targetAccuracy = options.desiredAccuracy || 35; // meters (true satellite lock)
    let bestPosition = null;
    let watchId = null;
    let timerId = null;
    let settleTimerId = null;
    let isSettled = false;

    const cleanup = () => {
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (_) {}
        watchId = null;
      }
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (settleTimerId !== null) {
        clearTimeout(settleTimerId);
        settleTimerId = null;
      }
    };

    const finish = (pos) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      const accuracy = pos?.coords?.accuracy || 0;
      console.log(`[Geolocation] ✓ Settled with accuracy ${Math.round(accuracy)}m (lat: ${pos.coords.latitude}, lng: ${pos.coords.longitude})`);
      resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: accuracy,
        isHighAccuracy: accuracy > 0 && accuracy <= 150,
      });
    };

    const fail = (err) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      let msg = 'Unable to retrieve your location.';
      if (err.code === 1) {
        msg = 'Location permission denied. Please allow location access in your browser settings.';
      } else if (err.code === 2) {
        msg = 'Location unavailable. Please make sure device location/GPS is turned on.';
      } else if (err.code === 3) {
        msg = 'Location request timed out. Please try again or search your address manually.';
      }
      const customErr = new Error(msg);
      customErr.code = err.code;
      reject(customErr);
    };

    // Hard ceiling timeout: return the best position collected or timeout error
    timerId = setTimeout(() => {
      if (bestPosition) {
        finish(bestPosition);
      } else {
        fail({ code: 3, message: 'Timeout' });
      }
    }, maxWaitTime);

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const acc = pos.coords.accuracy || 9999;
          console.log(`[Geolocation] Reading: accuracy ${Math.round(acc)}m (lat: ${pos.coords.latitude.toFixed(5)}, lng: ${pos.coords.longitude.toFixed(5)})`);

          if (!bestPosition || acc < (bestPosition.coords.accuracy || 9999)) {
            bestPosition = pos;
          }

          // Case A: Pinpoint GPS satellite lock (accuracy <= 35m) -> Settle immediately
          if (acc <= targetAccuracy) {
            finish(pos);
            return;
          }

          // Case B: Good accuracy (<= 80m) -> Give up to 2 seconds for a pinpoint fix, then settle
          if (acc <= 80 && !settleTimerId) {
            settleTimerId = setTimeout(() => {
              if (bestPosition) finish(bestPosition);
            }, 2000);
          }
        },
        (err) => {
          // If permission denied, fail immediately
          if (err.code === 1 || !bestPosition) {
            fail(err);
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: maxWaitTime,
          ...options,
        }
      );
    } catch (e) {
      // Fallback to simple getCurrentPosition if watchPosition throws
      navigator.geolocation.getCurrentPosition(
        (pos) => finish(pos),
        (err) => fail(err),
        { enableHighAccuracy: true, timeout: maxWaitTime, maximumAge: 0, ...options }
      );
    }
  });
}

// ── Helper: Parse Indian Address from LocationIQ / OSM ───────────────────────
function parseIndianAddress(data, nearbyList = []) {
  if (!data) return null;
  const a = data.address || {};
  const displayName = data.display_name || '';

  // 1. Detect City / Town / Village (Authoritative)
  let detectedCity = (
    a.city ||
    a.town ||
    a.municipality ||
    ''
  ).trim();

  // If no city, but county has a known city (e.g. "Bolpur Sriniketan" -> "Bolpur")
  if (!detectedCity && a.county) {
    const countyFirst = a.county.split(/[\s-]+/)[0];
    if (countyFirst && !isAdministrativeToken(countyFirst)) {
      detectedCity = countyFirst;
    }
  }

  // Handle Village locality:
  let villageLocality = '';
  if (a.village) {
    if (detectedCity && detectedCity.toLowerCase() !== a.village.toLowerCase()) {
      villageLocality = a.village.trim();
    } else if (!detectedCity) {
      if (a.county && a.county.toLowerCase().includes('sriniketan') && a.village.toLowerCase() === 'sriniketan') {
        detectedCity = 'Bolpur';
        villageLocality = 'Sriniketan';
      } else {
        detectedCity = a.village.trim();
      }
    }
  }

  if (!detectedCity) {
    detectedCity = (a.city_district || a.state_district || a.county || '')
      .replace(/\s*(tehsil|cd block|block|district|mandal|taluk|subdistrict)\s*/gi, '')
      .trim();
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

  // 5. Detect Landmark (from reverse or nearby POIs)
  let landmark = (
    a.landmark ||
    a.amenity ||
    a.attraction ||
    a.place ||
    a.historic ||
    a.leisure ||
    ''
  ).trim();
  if (landmark && isAdministrativeToken(landmark)) landmark = '';

  if (!landmark && Array.isArray(nearbyList) && nearbyList.length > 0) {
    const topNamed = nearbyList.find((n) => n.name && n.distance <= 350 && !isAdministrativeToken(n.name));
    if (topNamed) {
      landmark = topNamed.name.startsWith('Near ') ? topNamed.name : `Near ${topNamed.name}`;
    }
  }

  // 6. Gather all Street / Locality candidates
  const streetCandidates = [];

  const addCandidate = (val) => {
    if (!val || typeof val !== 'string') return;
    const cleanVal = cleanPostalParentheses(val.trim());
    if (!cleanVal) return;
    const lower = cleanVal.toLowerCase();

    // NEVER add city, state, country, pincode, district, or administrative names
    if (
      lower === detectedCity.toLowerCase() ||
      lower === state.toLowerCase() ||
      lower === 'india' ||
      lower === 'bharat' ||
      /^\d{6}$/.test(lower) ||
      (a.state_district && (lower === a.state_district.toLowerCase() || lower.includes(a.state_district.toLowerCase()))) ||
      (a.county && (lower === a.county.toLowerCase() || lower.includes(a.county.toLowerCase()))) ||
      (a.city_district && (lower === a.city_district.toLowerCase() || lower.includes(a.city_district.toLowerCase()))) ||
      isAdministrativeToken(cleanVal)
    ) {
      return;
    }

    if (detectedFlat && lower === detectedFlat.toLowerCase()) return;

    const alreadyAdded = streetCandidates.some(
      (c) => c.toLowerCase() === lower || c.toLowerCase().split(',').map((s) => s.trim()).includes(lower)
    );
    if (!alreadyAdded) {
      streetCandidates.push(cleanVal);
    }
  };

  // Roads / Streets
  if (a.road) addCandidate(a.road);
  if (a.street) addCandidate(a.street);
  if (a.lane) addCandidate(a.lane);
  if (a.highway) addCandidate(a.highway);
  if (a.pedestrian) addCandidate(a.pedestrian);
  if (a.footway) addCandidate(a.footway);
  if (a.path) addCandidate(a.path);
  if (a.alley) addCandidate(a.alley);

  // Neighbourhood / Colony / Sector
  if (a.neighbourhood) addCandidate(a.neighbourhood);
  if (a.colony) addCandidate(a.colony);
  if (a.sector) addCandidate(a.sector);
  if (a.quarter) addCandidate(a.quarter);
  if (a.ward) addCandidate(a.ward);
  if (a.block && !isAdministrativeToken(a.block)) addCandidate(a.block);
  if (a.residential && a.residential !== detectedFlat) addCandidate(a.residential);

  // Suburb / Locality / Village
  if (a.suburb) addCandidate(a.suburb);
  if (villageLocality) addCandidate(villageLocality);
  if (a.hamlet) addCandidate(a.hamlet);

  // Specific tokens from display_name (e.g. "Sector 3", "Hasanpura-C", "Bowbazar")
  if (displayName) {
    const tokens = displayName.split(',').map((t) => cleanPostalParentheses(t.trim())).filter(Boolean);
    for (let i = 0; i < Math.min(tokens.length, 3); i++) {
      addCandidate(tokens[i]);
    }
  }

  // If road is still missing, enrich from Nearby POIs
  if (!a.road && Array.isArray(nearbyList) && nearbyList.length > 0) {
    for (let near of nearbyList) {
      if (near.address?.road) {
        addCandidate(near.address.road);
        break;
      }
    }
    for (let near of nearbyList) {
      if (near.address?.suburb) addCandidate(near.address.suburb);
      if (near.address?.neighbourhood) addCandidate(near.address.neighbourhood);
      if (streetCandidates.length >= 2) break;
    }
  }

  // If street is STILL empty, use landmark
  if (streetCandidates.length === 0 && landmark) {
    addCandidate(landmark);
  }

  let street = streetCandidates.join(', ');
  if (!street) {
    street = villageLocality || (landmark ? landmark : (detectedCity || 'Local Area'));
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
          let nearbyList = [];
          if (!data.address?.road) {
            try {
              const nearRes = await fetch(`https://us1.locationiq.com/v1/nearby?key=${locationIqKey}&lat=${lat}&lon=${lng}&radius=450&format=json`);
              if (nearRes.ok) {
                const nearData = await nearRes.json();
                if (Array.isArray(nearData)) nearbyList = nearData;
              }
            } catch (e) {}
          }
          parsedResult = parseIndianAddress(data, nearbyList);
        }
      } else {
        // Fallback zoom 16 if zoom 18 failed
        try {
          const liqUrl16 = `https://us1.locationiq.com/v1/reverse?key=${locationIqKey}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`;
          const liqRes16 = await fetch(liqUrl16);
          if (liqRes16.ok) {
            const data16 = await liqRes16.json();
            if (data16 && (data16.address || data16.display_name)) {
              parsedResult = parseIndianAddress(data16);
            }
          }
        } catch (zErr) {}
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
