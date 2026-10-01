// ─────────────────────────────────────────────────────────────────────────────
// indiaPostalData.js — High-Performance Offline Indian Postal & Locality Resolver
// Contains 19,097 Indian PIN codes with official Sub Offices, Head Offices,
// Taluks, Districts, and States directly from Department of Posts / data.gov.in
// ─────────────────────────────────────────────────────────────────────────────
const path = require('path');
const fs = require('fs');

let pincodeMap = null;

/**
 * Lazy loads the compact India PIN code dataset (2.69 MB).
 * Kept in-memory as an O(1) hash map for sub-millisecond lookups.
 */
function getPincodeMap() {
  if (!pincodeMap) {
    try {
      const dataPath = path.join(__dirname, '../data/indiaPincodes.json');
      if (fs.existsSync(dataPath)) {
        pincodeMap = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      } else {
        console.warn('[IndiaPostalData] indiaPincodes.json not found at:', dataPath);
        pincodeMap = {};
      }
    } catch (err) {
      console.error('[IndiaPostalData] Error loading indiaPincodes.json:', err.message);
      pincodeMap = {};
    }
  }
  return pincodeMap;
}

/**
 * Clean & Title Case a string
 */
function toTitleCase(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Looks up official India Post information for a 6-digit PIN code.
 *
 * @param {string|number} pincode
 * @returns {{ pincode: string, primaryOffice: string, offices: string[], taluk: string, district: string, state: string } | null}
 */
function getPincodeDetails(pincode) {
  if (!pincode) return null;
  const pin = String(pincode).replace(/\D/g, '').slice(0, 6);
  if (pin.length !== 6) return null;

  const map = getPincodeMap();
  const entry = map[pin];
  if (!entry) return null;

  const [offices = [], taluk = '', district = '', state = ''] = entry;

  // The offices list is already pre-sorted with Head/Sub Offices first.
  // We prefer an office that has Bazar/Colliery/Chowk/Nagar or the first S.O./H.O.
  let primaryOffice = offices[0] || '';
  for (const off of offices) {
    if (/bazar|bazaar|colliery|chowk|market|nagar|main/i.test(off)) {
      primaryOffice = off;
      break;
    }
  }

  return {
    pincode: pin,
    primaryOffice: toTitleCase(primaryOffice),
    offices: offices.map(toTitleCase),
    taluk: toTitleCase(taluk),
    district: toTitleCase(district),
    state: toTitleCase(state),
  };
}

/**
 * Searches offline Indian localities, post offices, taluks, and PIN codes.
 *
 * @param {string} query
 * @param {number} [limit=6]
 * @returns {Array<{ pincode: string, office: string, taluk: string, district: string, state: string, display_name: string }>}
 */
function searchPostalOffices(query, limit = 6, userCoords = null) {
  const q = (query || '').toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const map = getPincodeMap();
  const exactMatches = [];
  const startsWithMatches = [];
  const containsMatches = [];
  const seenKeys = new Set();

  // 1. PIN code prefix match (e.g. "7133", "713373")
  if (/^\d{2,6}$/.test(q)) {
    for (const [pin, [offices, taluk, district, state]] of Object.entries(map)) {
      if (pin.startsWith(q)) {
        const bestOffice = offices[0] || taluk || district;
        const key = `${bestOffice}-${pin}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          exactMatches.push({
            pincode: pin,
            office: toTitleCase(bestOffice),
            taluk: toTitleCase(taluk),
            district: toTitleCase(district),
            state: toTitleCase(state),
            display_name: `${toTitleCase(bestOffice)}, ${toTitleCase(district)}, ${toTitleCase(state)} - ${pin}`,
          });
        }
        if (exactMatches.length >= limit) return exactMatches;
      }
    }
  }

  // 2. Office name / Locality match
  for (const [pin, [offices, taluk, district, state]] of Object.entries(map)) {
    for (const off of offices) {
      const lowerOff = off.toLowerCase();
      const key = `${off}-${pin}`;
      if (seenKeys.has(key)) continue;

      const item = {
        pincode: pin,
        office: toTitleCase(off),
        taluk: toTitleCase(taluk),
        district: toTitleCase(district),
        state: toTitleCase(state),
        display_name: `${toTitleCase(off)}, ${toTitleCase(taluk || district)}, ${toTitleCase(district)}, ${toTitleCase(state)} - ${pin}`,
      };

      if (lowerOff === q) {
        seenKeys.add(key);
        exactMatches.push(item);
      } else if (lowerOff.startsWith(q)) {
        seenKeys.add(key);
        startsWithMatches.push(item);
      } else if (lowerOff.includes(q)) {
        seenKeys.add(key);
        containsMatches.push(item);
      }
    }
  }

  let combined = [...exactMatches, ...startsWithMatches, ...containsMatches];

  // Boost results that match the user's location context (district, state, or PIN prefix)
  if (userCoords && (userCoords.district || userCoords.state || userCoords.pincodePrefix)) {
    const dist = (userCoords.district || '').toLowerCase();
    const st = (userCoords.state || '').toLowerCase();
    const pref = userCoords.pincodePrefix || '';

    combined.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (pref && a.pincode.startsWith(pref)) scoreA += 50;
      if (pref && b.pincode.startsWith(pref)) scoreB += 50;
      if (dist && a.district.toLowerCase().includes(dist)) scoreA += 30;
      if (dist && b.district.toLowerCase().includes(dist)) scoreB += 30;
      if (st && a.state.toLowerCase().includes(st)) scoreA += 10;
      if (st && b.state.toLowerCase().includes(st)) scoreB += 10;
      return scoreB - scoreA;
    });
  }

  return combined.slice(0, limit);
}

/**
 * Enriches a reverse geocoded address object with authoritative India Post locality details.
 * Prevents empty streets or generic "Local Area" placeholders anywhere in India.
 *
 * @param {object} parsed
 * @returns {object} enriched
 */
function enrichAddressWithPostalData(parsed) {
  if (!parsed) return parsed;

  const pin = (parsed.pincode || '').replace(/\D/g, '').slice(0, 6);
  if (!pin || pin.length !== 6) return parsed;

  const postalInfo = getPincodeDetails(pin);
  if (!postalInfo) return parsed;

  const enriched = { ...parsed };
  enriched.availableLocalities = postalInfo.offices || [];

  // 1. If street is missing, empty, or generic ("Local Area", tehsil name, etc.)
  const isGenericStreet =
    !enriched.street ||
    enriched.street === 'Local Area' ||
    enriched.street.toLowerCase() === (enriched.city || '').toLowerCase() ||
    enriched.street.toLowerCase().includes('block') ||
    enriched.street.toLowerCase().includes('tehsil');

  if (isGenericStreet && postalInfo.primaryOffice) {
    enriched.street = postalInfo.primaryOffice;
  } else if (
    enriched.street &&
    postalInfo.primaryOffice &&
    !enriched.street.toLowerCase().includes(postalInfo.primaryOffice.toLowerCase())
  ) {
    // If street exists (e.g. road name) but doesn't mention the locality/bazar, append it
    enriched.street = `${enriched.street}, ${postalInfo.primaryOffice}`;
  }

  // 2. City refinement (especially for Paschim Bardhaman / Asansol / Jamuria / Barabani area)
  if (!enriched.city || enriched.city === 'Local Area') {
    enriched.city = postalInfo.taluk || postalInfo.district;
  }

  // Known city corrections:
  // In Paschim Bardhaman (PINs 7133xx), the municipal corporation and urban hub is Asansol
  if (
    pin.startsWith('7133') &&
    (postalInfo.district.toLowerCase().includes('bardhaman') || postalInfo.district.toLowerCase().includes('burdwan'))
  ) {
    if (enriched.city.toLowerCase() === 'baraboni' || enriched.city.toLowerCase() === 'barabani') {
      enriched.city = 'Asansol';
    }
  }

  // 3. State & District
  if (!enriched.state && postalInfo.state) {
    enriched.state = postalInfo.state;
  }

  return enriched;
}

module.exports = {
  getPincodeDetails,
  searchPostalOffices,
  enrichAddressWithPostalData,
};
