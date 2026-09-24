// ─────────────────────────────────────────────────────────────────────────────
// reverseGeocode.js — Robust Geolocation & Reverse Geocoding Utility
// ─────────────────────────────────────────────────────────────────────────────
import { parseAddressString } from './addressParser.js';

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
 * Reverse-geocodes latitude and longitude into structured Indian address fields.
 * Uses OpenStreetMap Nominatim with automatic BigDataCloud fallback.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{ flat: string, street: string, city: string, state: string, landmark: string, pincode: string, fullAddress: string }>}
 */
export async function reverseGeocode(latitude, longitude) {
  let addressData = null;

  // ── 1. Primary: OpenStreetMap Nominatim ────────────────────────────────────
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 6500) : null;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'MagicMistry/1.0' },
        signal: controller ? controller.signal : undefined,
      }
    );
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.address || data.display_name)) {
        const a = data.address || {};

        // House / Flat (optional)
        const detectedHouse =
          a.house_number ||
          a.building ||
          a.flat ||
          a.room ||
          a.house_name ||
          a.shop ||
          a.commercial ||
          a.apartments ||
          '';

        // Road / Street
        const road = a.road || a.pedestrian || a.footway || a.street || a.path || a.highway || '';

        // Locality / Suburb / Area
        const locality =
          a.suburb ||
          a.neighbourhood ||
          a.residential ||
          a.subdistrict ||
          a.city_district ||
          a.quarter ||
          a.hamlet ||
          a.village_district ||
          '';

        const detectedStreet = [road, locality].filter(Boolean).join(', ');

        // City / Town
        const detectedCity =
          a.city ||
          a.town ||
          a.village ||
          a.municipality ||
          a.state_district ||
          a.county ||
          a.district ||
          '';

        // State
        const detectedState = a.state || a.province || a.region || '';

        // Landmark
        const detectedLandmark =
          a.landmark || a.attraction || a.amenity || a.place || a.historic || a.leisure || '';

        // Pincode
        const detectedPincode = (a.postcode || '').replace(/\D/g, '').slice(0, 6);

        // Fallback parsing from full display_name if needed
        const combinedStr = data.display_name || '';
        const parsed = parseAddressString(combinedStr);

        const finalFlat = detectedHouse || parsed.flat || '';
        const finalStreet =
          detectedStreet || parsed.street || data.display_name?.split(',')?.[0]?.trim() || '';
        const finalCity = detectedCity || parsed.city || '';
        const finalState = detectedState || parsed.state || '';
        const finalLandmark = detectedLandmark || parsed.landmark || '';
        const finalPincode = detectedPincode || parsed.pincode || '';

        const fullParts = [
          finalFlat,
          finalStreet,
          finalLandmark,
          finalCity,
          finalState,
          finalPincode,
        ].filter(Boolean);

        addressData = {
          flat: finalFlat,
          street: finalStreet,
          city: finalCity,
          state: finalState,
          landmark: finalLandmark,
          pincode: finalPincode,
          fullAddress: fullParts.length ? fullParts.join(', ') : (data.display_name || ''),
        };
      }
    }
  } catch (err) {
    console.warn('[ReverseGeocode] Nominatim request failed or timed out, trying fallback...', err);
  }

  // ── 2. Fallback: BigDataCloud Client Reverse Geocode API ─────────────────────
  if (!addressData || !addressData.city || !addressData.state) {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (res.ok) {
        const bdc = await res.json();
        const street = bdc.locality || bdc.localityInfo?.administrative?.[2]?.name || '';
        const city = bdc.city || bdc.locality || '';
        const state = bdc.principalSubdivision || '';
        const pincode = (bdc.postcode || '').replace(/\D/g, '').slice(0, 6);

        const fullParts = [street, city, state, pincode].filter(Boolean);

        addressData = {
          flat: addressData?.flat || '',
          street: addressData?.street || street,
          city: addressData?.city || city,
          state: addressData?.state || state,
          landmark: addressData?.landmark || '',
          pincode: addressData?.pincode || pincode,
          fullAddress: fullParts.join(', '),
        };
      }
    } catch (err) {
      console.warn('[ReverseGeocode] BigDataCloud fallback failed:', err);
    }
  }

  if (!addressData || (!addressData.city && !addressData.street)) {
    throw new Error('Could not resolve your location address. Please enter manually.');
  }

  return addressData;
}
