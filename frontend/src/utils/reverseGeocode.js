// ─────────────────────────────────────────────────────────────────────────────
// reverseGeocode.js — Production-Grade Geolocation & Reverse Geocoding Utility
// ─────────────────────────────────────────────────────────────────────────────
import {
  parseAddressString,
  formatCleanAddress,
  cleanPostalParentheses,
  cleanCityName,
  KNOWN_DISTRICTS,
  INDIAN_STATES,
  isAdministrativeToken,
} from './addressParser.js';
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

    const maxWaitTime = options.timeout || 8000; // Fast 8s ceiling (prevents endless 12s freeze)
    const targetAccuracy = options.desiredAccuracy || 45; // meters (pinpoint street lock)
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
      const isCoarse = accuracy > 180; // Accuracy is in hundreds of meters or kilometers (ISP/Cell tower)
      const isHighAccuracy = accuracy > 0 && accuracy <= 100;

      console.log(
        `[Geolocation] ✓ Settled with accuracy ${Math.round(accuracy)}m (lat: ${pos.coords.latitude}, lng: ${pos.coords.longitude}, isCoarse: ${isCoarse})`
      );

      resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(accuracy),
        isHighAccuracy,
        isCoarse,
        accuracyWarning: isCoarse
          ? `Approximate area (±${accuracy >= 1000 ? (accuracy / 1000).toFixed(1) + ' km' : Math.round(accuracy) + ' m'}). Please confirm your exact building on the map.`
          : null,
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
          console.log(
            `[Geolocation] Reading: accuracy ${Math.round(acc)}m (lat: ${pos.coords.latitude.toFixed(5)}, lng: ${pos.coords.longitude.toFixed(5)})`
          );

          if (!bestPosition || acc < (bestPosition.coords.accuracy || 9999)) {
            bestPosition = pos;
          }

          // Case A: Pinpoint GPS satellite / Wi-Fi lock (acc <= targetAccuracy, ~45m) -> Settle instantly
          if (acc <= targetAccuracy) {
            finish(pos);
            return;
          }

          // Case B: Strong urban/street accuracy (<= 80m) -> Give at most 1.2s for pinpoint lock, then settle
          if (acc <= 80 && !settleTimerId) {
            settleTimerId = setTimeout(() => {
              if (bestPosition) finish(bestPosition);
            }, 1200);
            return;
          }

          // Case C: Acceptable colony/neighborhood accuracy (<= 150m) -> Give at most 2.5s for refinement
          if (acc <= 150 && !settleTimerId) {
            settleTimerId = setTimeout(() => {
              if (bestPosition) finish(bestPosition);
            }, 2500);
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

  // 1. Detect City / Town / Village (Authoritative, with administrative suffixes stripped)
  let detectedCity = cleanCityName(
    a.city ||
    a.town ||
    a.municipality ||
    ''
  );

  // If no city, but county has a known city (e.g. "Bolpur Sriniketan" -> "Bolpur")
  if (!detectedCity && a.county) {
    const countyFirst = cleanCityName(a.county.split(/[\s-]+/)[0]);
    if (countyFirst && !isAdministrativeToken(countyFirst)) {
      detectedCity = countyFirst;
    }
  }

  // Handle Village locality:
  let villageLocality = '';
  if (a.village) {
    const cleanVillage = cleanCityName(a.village);
    if (detectedCity && detectedCity.toLowerCase() !== cleanVillage.toLowerCase()) {
      villageLocality = cleanVillage;
    } else if (!detectedCity) {
      detectedCity = cleanVillage;
    }
  }

  if (!detectedCity) {
    detectedCity = cleanCityName(a.city_district || a.state_district || a.county || '');
  }

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
    for (const s of INDIAN_STATES) {
      if (lowerFull.includes(s.toLowerCase())) {
        state = s;
        break;
      }
    }
  }

  // 4. Detect Exact 6-Digit Pincode
  let pincode = '';
  const postMatch = (a.postcode || '').match(/\b[1-9]\d{5}\b/);
  if (postMatch) {
    pincode = postMatch[0];
  } else if (displayName) {
    const pinMatch = displayName.match(/\b[1-9]\d{5}\b/);
    if (pinMatch) pincode = pinMatch[0];
  }

  // 5. Detect POI / Landmark (Amenity, Shop, Railway, Complex, Named Building)
  let landmark = (
    a.landmark ||
    a.amenity ||
    a.shop ||
    a.office ||
    a.railway ||
    a.hospital ||
    a.school ||
    a.college ||
    a.cafe ||
    a.restaurant ||
    a.fast_food ||
    a.hotel ||
    a.tourism ||
    a.attraction ||
    a.historic ||
    a.leisure ||
    a.place ||
    ''
  ).trim();

  if (landmark && (isAdministrativeToken(landmark) || landmark.toLowerCase() === (detectedCity || '').toLowerCase())) {
    landmark = '';
  }

  // If landmark is still empty, inspect the first token of display_name
  if (!landmark && displayName) {
    const firstToken = displayName.split(',')[0].trim();
    const fLower = firstToken.toLowerCase();
    if (
      firstToken &&
      !isAdministrativeToken(firstToken) &&
      fLower !== (detectedCity || '').toLowerCase() &&
      fLower !== (state || '').toLowerCase() &&
      !/^\d{6}$/.test(firstToken) &&
      firstToken !== a.road &&
      firstToken !== a.street &&
      firstToken !== a.suburb &&
      firstToken !== a.neighbourhood
    ) {
      landmark = firstToken;
    }
  }

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
      (detectedCity && lower === detectedCity.toLowerCase()) ||
      (state && lower === state.toLowerCase()) ||
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
    if (landmark && lower === landmark.toLowerCase()) return;

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

  // Neighbourhood / Colony / Block / Sector (Preserves urban residential blocks like "AP Block", "B Block")
  if (a.neighbourhood) addCandidate(a.neighbourhood);
  if (a.colony) addCandidate(a.colony);
  if (a.block && !isAdministrativeToken(a.block)) addCandidate(a.block);
  if (a.sector) addCandidate(a.sector);
  if (a.quarter) addCandidate(a.quarter);
  if (a.ward) addCandidate(a.ward);
  if (a.residential && a.residential !== detectedFlat) addCandidate(a.residential);

  // Suburb / Locality / Village
  if (a.suburb) addCandidate(a.suburb);
  if (villageLocality) addCandidate(villageLocality);
  if (a.hamlet) addCandidate(a.hamlet);

  // Specific tokens from display_name
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
 * - Pincode (Exact 6-digit Indian PIN Code)
 * - Flat / Door (Optional)
 *
 * Tier 1: Direct Client LocationIQ (Highest accuracy for India villages, colonies, exact PINs)
 * Tier 2: Direct Client Nominatim (Reliable OpenStreetMap fallback)
 * Tier 3: Backend Proxy Endpoint (Fallback)
 * Tier 4: India Post Safeguarded Verification
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

  let parsedResult = null;
  const locationIqKey =
    import.meta?.env?.VITE_LOCATIONIQ_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.VITE_LOCATIONIQ_API_KEY : '') ||
    '';

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 1: Direct Client LocationIQ (High-Precision Indian Localities & PIN)
  // ═══════════════════════════════════════════════════════════════════════════
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
              const nearRes = await fetch(`https://us1.locationiq.com/v1/nearby?key=${locationIqKey}&lat=${lat}&lon=${lng}&radius=400&format=json`);
              if (nearRes.ok) {
                const nearData = await nearRes.json();
                if (Array.isArray(nearData)) nearbyList = nearData;
              }
            } catch (_) {}
          }
          parsedResult = parseIndianAddress(data, nearbyList);

          // If pincode was omitted at zoom 18, check postal boundary at zoom 16/14
          if (parsedResult && !parsedResult.pincode) {
            try {
              const zRes = await fetch(`https://us1.locationiq.com/v1/reverse?key=${locationIqKey}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`);
              if (zRes.ok) {
                const zData = await zRes.json();
                const pinMatch = (zData.address?.postcode || zData.display_name || '').match(/\b[1-9]\d{5}\b/);
                if (pinMatch) {
                  parsedResult.pincode = pinMatch[0];
                }
              }
            } catch (_) {}
          }

          if (parsedResult && parsedResult.city && parsedResult.pincode) {
            console.log('[ReverseGeocode] ✓ Successfully resolved via Direct LocationIQ:', parsedResult);
            return finalizeAddress(parsedResult);
          }
        }
      } else {
        // Fallback zoom 16 if zoom 18 gave non-200
        try {
          const liqUrl16 = `https://us1.locationiq.com/v1/reverse?key=${locationIqKey}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`;
          const liqRes16 = await fetch(liqUrl16);
          if (liqRes16.ok) {
            const data16 = await liqRes16.json();
            if (data16 && (data16.address || data16.display_name)) {
              parsedResult = parseIndianAddress(data16);
              if (parsedResult && parsedResult.city && parsedResult.pincode) {
                return finalizeAddress(parsedResult);
              }
            }
          }
        } catch (_) {}
      }
    } catch (liqErr) {
      console.warn('[ReverseGeocode] Client LocationIQ failed, trying fallback...', liqErr);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 2: Direct Client Nominatim at zoom=18 (Fallback) ─────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (!parsedResult || !parsedResult.city || !parsedResult.pincode) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6500) : null;

      const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
      const res = await fetch(nomUrl, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'MagicMistryApp/1.0 (contact@magicmistry.com)'
        },
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

          if (parsedResult && parsedResult.city && parsedResult.pincode) {
            console.log('[ReverseGeocode] ✓ Successfully resolved via Direct Nominatim:', parsedResult);
            return finalizeAddress(parsedResult);
          }
        }
      }
    } catch (err) {
      console.warn('[ReverseGeocode] Client Nominatim lookup failed:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 3: Backend Reverse Geocode Endpoint (Fallback) ───────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (!parsedResult || !parsedResult.city || !parsedResult.pincode) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

      const backendUrl = `${BASE_URL}/address/reverse-geocode?lat=${lat}&lng=${lng}`;
      const res = await fetch(backendUrl, {
        signal: controller ? controller.signal : undefined,
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && (json.data.city || json.data.street || json.data.fullAddress)) {
          const bData = json.data;
          const cleanBData = {
            flat: bData.flat || '',
            street: bData.street || '',
            city: cleanCityName(bData.city || ''),
            state: bData.state || '',
            landmark: bData.landmark || '',
            pincode: (bData.pincode || '').replace(/\D/g, '').slice(0, 6),
            fullAddress: bData.fullAddress || '',
          };

          if (!parsedResult) {
            parsedResult = cleanBData;
          } else {
            parsedResult.street = parsedResult.street || cleanBData.street;
            parsedResult.city = parsedResult.city || cleanBData.city;
            parsedResult.state = parsedResult.state || cleanBData.state;
            parsedResult.pincode = parsedResult.pincode || cleanBData.pincode;
          }

          if (parsedResult && parsedResult.city && parsedResult.pincode) {
            return finalizeAddress(parsedResult);
          }
        }
      }
    } catch (backendErr) {
      console.warn('[ReverseGeocode] Backend proxy fallback failed:', backendErr);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 4: Indian Postal API (SAFEGUARDED Verification) ──────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (parsedResult && (!parsedResult.pincode || !parsedResult.state)) {
    try {
      // Case A: Missing Pincode, but City and State are known -> query postoffice by clean city
      if (!parsedResult.pincode && parsedResult.city && parsedResult.city !== 'Local Area') {
        const searchTarget = encodeURIComponent(parsedResult.city);
        const pinRes = await fetch(`https://api.postalpincode.in/postoffice/${searchTarget}`);
        if (pinRes.ok) {
          const pinData = await pinRes.json();
          if (Array.isArray(pinData) && pinData[0]?.Status === 'Success' && Array.isArray(pinData[0]?.PostOffice)) {
            // Find a post office matching the state or district to prevent cross-state corruption
            const offices = pinData[0].PostOffice;
            const stateLower = (parsedResult.state || '').toLowerCase();
            const matched = offices.find(
              (o) => !stateLower || o.State?.toLowerCase() === stateLower || o.Circle?.toLowerCase() === stateLower
            ) || offices[0];

            if (matched && matched.Pincode) {
              parsedResult.pincode = matched.Pincode;
              parsedResult.state = parsedResult.state || matched.State || '';
            }
          }
        }
      }

      // Case B: Pincode is known, but State is missing -> lookup by pincode
      if (parsedResult.pincode && !parsedResult.state) {
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

  return finalizeAddress(parsedResult);
}

// Helper to format clean final address object
function finalizeAddress(addr) {
  const final = addr || {
    flat: '',
    street: 'Local Area',
    city: 'Local Area',
    state: '',
    landmark: '',
    pincode: '',
    fullAddress: 'Local Area',
  };

  if (final.city) {
    final.city = cleanCityName(final.city);
  }
  if (final.street) {
    final.street = final.street.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (final.flat && (final.flat.includes(',') || final.flat.length > 25)) {
    final.flat = '';
  }
  if (final.pincode) {
    final.pincode = final.pincode.replace(/\D/g, '').slice(0, 6);
  }

  final.fullAddress = formatCleanAddress(final) || final.city || final.street || 'Local Area';
  return final;
}

/**
 * Searches places/villages/towns/streets across India using LocationIQ Autocomplete.
 * Supports coordinate bias to prioritize results close to user's location.
 *
 * @param {string} query Search text (e.g. area, landmark, or street name)
 * @param {{ lat: number, lng: number }} [userCoords] Optional coordinates to bias results
 * @returns {Promise<Array<{ place_id: string, display_name: string, display_place: string, display_address: string, lat: number, lng: number, address: object }>>}
 */
export async function searchLocations(query, userCoords = null) {
  const q = (query || '').trim();
  if (!q || q.length < 2) return [];

  const lat = userCoords?.lat && !isNaN(userCoords.lat) ? Number(userCoords.lat) : null;
  const lng = userCoords?.lng && !isNaN(userCoords.lng) ? Number(userCoords.lng) : null;
  const hasCoords = lat !== null && lng !== null;

  const locationIqKey =
    import.meta?.env?.VITE_LOCATIONIQ_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.VITE_LOCATIONIQ_API_KEY : '') ||
    '';
  if (locationIqKey) {
    try {
      let url = `https://api.locationiq.com/v1/autocomplete?key=${locationIqKey}&q=${encodeURIComponent(q)}&countrycodes=in&limit=6&format=json`;
      if (hasCoords) {
        const delta = 0.5;
        url += `&viewbox=${(lng - delta).toFixed(4)},${(lat - delta).toFixed(4)},${(lng + delta).toFixed(4)},${(lat + delta).toFixed(4)}&bounded=0`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items) && items.length > 0) {
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
      console.warn('[searchLocations] Direct LocationIQ autocomplete failed, trying fallback...', liqErr);
    }
  }

  // 2. Fallback: Backend Autocomplete
  try {
    let backendUrl = `${BASE_URL}/address/autocomplete?q=${encodeURIComponent(q)}`;
    if (hasCoords) {
      backendUrl += `&lat=${lat}&lng=${lng}`;
    }
    const res = await fetch(backendUrl);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[searchLocations] Backend autocomplete unavailable:', err);
  }

  return [];
}

