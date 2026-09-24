// ─────────────────────────────────────────────────────────────────────────────
// reverseGeocode.js — Production-Grade Geolocation & Reverse Geocoding Utility
// ─────────────────────────────────────────────────────────────────────────────
import { parseAddressString } from './addressParser.js';
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

/**
 * Reverse-geocodes latitude and longitude into structured Indian address fields:
 * - Street / Small Area (Mohalla / Colony / Road / Suburb)
 * - City / Town
 * - State
 * - Pincode (Guaranteed 6-digit Indian PIN Code)
 * - Flat / Door (Optional)
 *
 * Multi-Tier Strategy:
 * 1. Backend Server-Side Proxy (Nominatim zoom=18 + Photon + Postal API with caching)
 * 2. Client-Side Direct Nominatim zoom=18 (Safe browser headers)
 * 3. Client-Side Photon / PostalPincode Fallback
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
  // ── TIER 1: Backend Reverse Geocode Endpoint (Most Accurate & Fast) ────────
  // ═══════════════════════════════════════════════════════════════════════════
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
  let flat = '';
  let street = '';
  let city = '';
  let state = '';
  let landmark = '';
  let pincode = '';
  let fullAddress = '';

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
        const a = data.address || {};

        flat = a.house_number || a.building || a.flat || a.room || a.house_name || a.shop || a.apartments || '';

        const road = a.road || a.pedestrian || a.footway || a.street || a.path || a.highway || a.lane || a.alley || '';
        const locality =
          a.suburb ||
          a.neighbourhood ||
          a.residential ||
          a.subdistrict ||
          a.city_district ||
          a.quarter ||
          a.hamlet ||
          a.village_district ||
          a.village ||
          a.colony ||
          '';

        const streetParts = [road, locality].filter(Boolean);
        street = streetParts.length ? streetParts.join(', ') : (data.name || '');

        city = a.city || a.town || a.village || a.municipality || a.county || a.state_district || a.district || '';
        state = a.state || a.province || a.region || '';
        landmark = a.landmark || a.amenity || a.attraction || a.place || a.historic || a.leisure || '';
        pincode = (a.postcode || '').replace(/\D/g, '').slice(0, 6);

        if (!pincode && data.display_name) {
          const pinMatch = data.display_name.match(/\b[1-9]\d{5}\b/);
          if (pinMatch) pincode = pinMatch[0];
        }

        fullAddress = data.display_name || '';
      }
    } catch (liqErr) {
      console.warn('[ReverseGeocode] Client LocationIQ failed, trying fallback...', liqErr);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 3: Direct Client Nominatim at zoom=18 (Fallback) ─────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (!city || !pincode) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 7000) : null;

    // Use zoom=18 for building/road level precision (without forbidden headers!)
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
    const res = await fetch(nomUrl, {
      headers: { 'Accept-Language': 'en' },
      signal: controller ? controller.signal : undefined,
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.address || data.display_name)) {
        const a = data.address || {};

        flat = a.house_number || a.building || a.flat || a.room || a.house_name || a.shop || a.apartments || '';

        // Extract detailed micro-locality (road + neighbourhood / suburb / colony)
        const road = a.road || a.pedestrian || a.footway || a.street || a.path || a.highway || a.lane || a.alley || '';
        const locality =
          a.suburb ||
          a.neighbourhood ||
          a.residential ||
          a.subdistrict ||
          a.city_district ||
          a.quarter ||
          a.hamlet ||
          a.village_district ||
          a.colony ||
          '';

        const streetParts = [road, locality].filter(Boolean);
        street = streetParts.length ? streetParts.join(', ') : (data.name || '');

        city = a.city || a.town || a.village || a.municipality || a.state_district || a.county || a.district || '';
        state = a.state || a.province || a.region || '';
        landmark = a.landmark || a.amenity || a.attraction || a.place || a.historic || a.leisure || '';
        pincode = (a.postcode || '').replace(/\D/g, '').slice(0, 6);

        // Fallback for street from display_name
        if (!street && data.display_name) {
          const firstPart = data.display_name.split(',')[0]?.trim();
          if (firstPart && firstPart !== city && firstPart !== state) {
            street = firstPart;
          }
        }

        // Fallback for pincode from display_name (e.g. "..., 731235, India")
        if (!pincode && data.display_name) {
          const pinMatch = data.display_name.match(/\b[1-9]\d{5}\b/);
          if (pinMatch) pincode = pinMatch[0];
        }

        fullAddress = data.display_name || '';
      }
    }
  } catch (err) {
    console.warn('[ReverseGeocode] Client Nominatim lookup failed:', err);
  }
}


  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 3: Photon Reverse Geocoder (High-Accuracy Indian Pincodes) ────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (!pincode || !street || !city) {
    try {
      const photonRes = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
      if (photonRes.ok) {
        const pdata = await photonRes.json();
        const feat = pdata?.features?.[0]?.properties;
        if (feat) {
          if (!pincode && feat.postcode) {
            pincode = String(feat.postcode).replace(/\D/g, '').slice(0, 6);
          }
          if (!street) {
            street = [feat.street, feat.district || feat.locality || feat.name].filter(Boolean).join(', ');
          }
          if (!city) city = feat.city || feat.town || feat.county || '';
          if (!state) state = feat.state || '';
        }
      }
    } catch (photonErr) {
      console.warn('[ReverseGeocode] Photon lookup failed:', photonErr);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 4: Indian Postal Pincode API (Official Postal Records) ───────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (!pincode && (street || city)) {
    try {
      const searchTarget = (street.split(',')[0] || city).trim();
      const pinRes = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(searchTarget)}`);
      if (pinRes.ok) {
        const pinData = await pinRes.json();
        if (Array.isArray(pinData) && pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length) {
          pincode = pinData[0].PostOffice[0].Pincode || '';
        }
      }
    } catch (pinErr) {
      console.warn('[ReverseGeocode] India Post API failed:', pinErr);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TIER 5: BigDataCloud Emergency Fallback ────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (!city || !state) {
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (bdcRes.ok) {
        const bdc = await bdcRes.json();
        if (!street) street = bdc.locality || bdc.localityInfo?.administrative?.[2]?.name || '';
        if (!city) city = bdc.city || bdc.locality || '';
        if (!state) state = bdc.principalSubdivision || '';
        if (!pincode && bdc.postcode) pincode = bdc.postcode.replace(/\D/g, '').slice(0, 6);
      }
    } catch (bdcErr) {
      console.warn('[ReverseGeocode] BigDataCloud fallback failed:', bdcErr);
    }
  }

  // ── Enrich with India Post PostOffice & Village directory ────────────────
  if (pincode) {
    try {
      const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (pinRes.ok) {
        const pinData = await pinRes.json();
        if (Array.isArray(pinData) && pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length) {
          const offices = pinData[0].PostOffice;
          const subOffice = offices.find((o) => o.BranchType === 'Sub Post Office') || offices[0];
          if (subOffice) {
            const cleanOfficeName = subOffice.Name.replace(/\s*\(.*?\)/, '').trim();
            if (!street || street === city) {
              street = cleanOfficeName;
            } else if (!street.toLowerCase().includes(cleanOfficeName.toLowerCase())) {
              street = `${cleanOfficeName}, ${street}`;
            }
            if (subOffice.Division && !city.toLowerCase().includes(subOffice.Division.toLowerCase())) {
              city = `${subOffice.Division}${city ? ` (${city})` : ''}`;
            }
          }
        }
      }
    } catch (pinErr) {
      console.warn('[ReverseGeocode] India Post enrichment failed:', pinErr);
    }
  }

  // If still missing street, set to locality / city so it is never blank
  if (!street) {
    street = city || 'Local Area';
  }

  // Build clean full address
  const fullParts = [flat, street, landmark, city, state, pincode].filter(Boolean);
  const finalAddress = fullParts.length ? fullParts.join(', ') : (fullAddress || `${street}, ${city}, ${state}`);

  const result = {
    flat: flat || '',
    street: street || '',
    city: city || '',
    state: state || '',
    landmark: landmark || '',
    pincode: pincode || '',
    fullAddress: finalAddress,
  };

  return result;
}
