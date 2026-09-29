// ─────────────────────────────────────────────────────────────────────────────
// addressParser.js — Robust Indian address string and object parser (Backend)
// ─────────────────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Orissa', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Jammu and Kashmir', 'Jammu', 'Kashmir', 'Ladakh',
  'Chandigarh', 'Puducherry', 'Pondicherry', 'Andaman and Nicobar',
  'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep'
];

const STATE_ALIASES = {
  wb: 'West Bengal',
  dl: 'Delhi',
  ncr: 'Delhi',
  mh: 'Maharashtra',
  ka: 'Karnataka',
  tn: 'Tamil Nadu',
  up: 'Uttar Pradesh',
  mp: 'Madhya Pradesh',
  gj: 'Gujarat',
  rj: 'Rajasthan',
  ts: 'Telangana',
  tg: 'Telangana',
  ap: 'Andhra Pradesh',
  kl: 'Kerala',
  pb: 'Punjab',
  hr: 'Haryana',
  or: 'Odisha',
  od: 'Odisha',
  jh: 'Jharkhand',
  br: 'Bihar',
  as: 'Assam',
  ch: 'Chandigarh',
  ga: 'Goa',
  uk: 'Uttarakhand',
  ut: 'Uttarakhand',
  hp: 'Himachal Pradesh',
  tr: 'Tripura',
  sk: 'Sikkim',
  ml: 'Meghalaya',
  mn: 'Manipur',
  mz: 'Mizoram',
  nl: 'Nagaland',
  ar: 'Arunachal Pradesh',
};

/**
 * Strips postal sub-office parentheses like "Birbhum (Bolpur)" -> "Bolpur"
 */
function cleanPostalParentheses(str) {
  if (!str || typeof str !== 'string') return '';
  const trimmed = str.trim();
  const parenMatch = trimmed.match(/\((.*?)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }
  return trimmed.replace(/[()]/g, '').trim();
}

/**
 * Parses any Indian address input (full string or object) into clean fields.
 */
function parseAddressString(input) {
  if (!input) {
    return { flat: '', street: '', city: '', state: '', landmark: '', pincode: '' };
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (
      !trimmed ||
      /^(set your location|set service location|no address set|no saved address yet|no address set\..*|current location|select location)$/i.test(trimmed)
    ) {
      return { flat: '', street: '', city: '', state: '', landmark: '', pincode: '' };
    }
  }

  let rawFlat = (typeof input === 'object' ? input.flat || input.house || input.addressLine1 : '') || '';
  let rawStreet = (typeof input === 'object' ? input.street : '') || '';
  let rawCity = (typeof input === 'object' ? input.city : '') || '';
  let rawState = (typeof input === 'object' ? input.state : '') || '';
  let rawLandmark = (typeof input === 'object' ? input.landmark : '') || '';
  let rawPincode = (typeof input === 'object' ? input.pincode : '') || '';

  const isGeneric = (str) =>
    !str ||
    str === 'Home' ||
    str === 'Shop' ||
    str === 'Office' ||
    str === 'Other' ||
    str === 'Current Location' ||
    str === 'Area' ||
    str === '000000' ||
    /^(set your location|set service location|no address set|no saved address yet)$/i.test(str);

  if (isGeneric(rawFlat)) rawFlat = '';
  if (isGeneric(rawStreet)) rawStreet = '';
  if (isGeneric(rawCity)) rawCity = '';
  if (rawPincode === '000000') rawPincode = '';

  const isStreetFullAddress = rawStreet && rawStreet.includes(',') && rawStreet.split(',').length >= 3;
  const isFlatFullAddress = rawFlat && rawFlat.includes(',') && rawFlat.split(',').length >= 3;

  let stringToParse = '';
  if (typeof input === 'string') {
    stringToParse = input;
  } else if (isStreetFullAddress) {
    stringToParse = rawStreet;
  } else if (isFlatFullAddress) {
    stringToParse = rawFlat;
  }

  if (stringToParse) {
    const rawParts = stringToParse
      .replace(/,?\s*\bCurrent Location\b/gi, '')
      .replace(/,?\s*\b000000\b/g, '')
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p && !/^(current location|location|select location|set your location|set service location|no address set|no saved address yet|000000)$/i.test(p));
    let parts = [...rawParts];

    let extractedPincode = '';
    let extractedState = '';
    let extractedCity = '';
    let extractedLandmark = '';
    let extractedFlat = '';
    let extractedStreet = '';

    // 1. Extract 6-digit Pincode from right to left
    for (let i = parts.length - 1; i >= 0; i--) {
      const match = parts[i].match(/\b[1-9]\d{5}\b/);
      if (match) {
        extractedPincode = match[0];
        const rem = parts[i].replace(/\b[1-9]\d{5}\b/, '').replace(/[-–]/g, '').trim();
        if (rem) {
          parts[i] = rem;
        } else {
          parts.splice(i, 1);
        }
        break;
      }
    }

    // 2. Extract State from right to left
    for (let i = parts.length - 1; i >= 0; i--) {
      const partLower = parts[i].toLowerCase().replace(/[^a-z\s&]/g, '').trim();
      const matchedState =
        INDIAN_STATES.find(
          (s) => s.toLowerCase() === partLower || partLower.includes(s.toLowerCase()) || s.toLowerCase().includes(partLower)
        ) || STATE_ALIASES[partLower];

      if (matchedState) {
        extractedState = matchedState;
        parts.splice(i, 1);
        break;
      }
    }

    // 3. Extract City from right to left
    if (parts.length > 0) {
      const rawCandidate = parts[parts.length - 1];
      const cleanedCandidate = cleanPostalParentheses(rawCandidate);
      extractedCity = cleanedCandidate;
      parts.pop();
    }

    // 4. Extract Flat/House number from leftmost part if it looks like a flat/house
    if (parts.length > 1) {
      const first = parts[0];
      const isHousePattern =
        /^(plot|flat|h\.?\s*no|house|room|shop|block|bldg|building|apt|apartment|sector|phase|#)/i.test(first) ||
        /^\d+([-\/][a-zA-Z0-9]+)?$/.test(first) ||
        (first.length <= 15 && /\d/.test(first));

      if (isHousePattern) {
        extractedFlat = parts.shift();
      }
    }

    // 5. Remaining parts become Street and Landmark
    if (parts.length > 0) {
      extractedStreet = parts.join(', ');
    } else if (!extractedStreet && extractedCity) {
      extractedStreet = extractedCity;
    }

    return {
      flat: (extractedFlat && !extractedFlat.includes(',') && extractedFlat.length <= 25) ? extractedFlat : '',
      street: extractedStreet || rawStreet || '',
      city: extractedCity || rawCity || '',
      state: extractedState || rawState || '',
      landmark: extractedLandmark || rawLandmark || '',
      pincode: extractedPincode || rawPincode || '',
    };
  }

  let cleanFlat = (isFlatFullAddress ? '' : rawFlat).trim();
  if (cleanFlat.includes(',') || cleanFlat.length > 25) {
    cleanFlat = '';
  }

  let cleanCity = rawCity.trim();
  if (cleanCity.includes('(')) {
    cleanCity = cleanPostalParentheses(cleanCity);
  }

  return {
    flat: cleanFlat,
    street: rawStreet,
    city: cleanCity,
    state: rawState,
    landmark: rawLandmark,
    pincode: rawPincode === '000000' ? '' : rawPincode,
  };
}

/**
 * Formats an address cleanly without dummy tokens or duplicates.
 */
function formatCleanAddress(input) {
  if (!input) return '';

  if (typeof input === 'string') {
    let str = input.trim();
    if (
      /^(set your location|set service location|no address set|no saved address yet|no address set\..*|current location|select location)$/i.test(
        str
      )
    ) {
      return '';
    }

    str = str
      .replace(/,?\s*\bCurrent Location\b/gi, '')
      .replace(/,?\s*\b000000\b/g, '')
      .replace(/,\s*,+/g, ',')
      .replace(/^[\s,]+|[\s,]+$/g, '');

    const tokens = str.split(',').map((t) => t.trim()).filter(Boolean);
    const seen = new Set();
    const unique = [];

    for (let t of tokens) {
      if (t.includes('(')) {
        t = cleanPostalParentheses(t);
      }
      const lower = t.toLowerCase();
      if (!seen.has(lower) && lower !== 'current location' && lower !== '000000' && lower !== 'area' && lower !== 'home') {
        const alreadyContained = unique.some((u) => {
          const uParts = u.toLowerCase().split(',').map((s) => s.trim());
          return uParts.includes(lower);
        });
        if (!alreadyContained) {
          seen.add(lower);
          unique.push(t);
        }
      }
    }
    return unique.join(', ');
  }

  const parsed = parseAddressString(input);
  const parts = [
    parsed.flat,
    parsed.street,
    parsed.landmark,
    parsed.city,
    parsed.state,
    parsed.pincode,
  ].filter(Boolean);

  const seen = new Set();
  const unique = [];

  for (const p of parts) {
    const cleanP = String(p).replace(/\s*\(.*?\)\s*/g, ' ').trim();
    const lower = cleanP.toLowerCase();
    if (
      cleanP &&
      !seen.has(lower) &&
      lower !== 'current location' &&
      lower !== '000000' &&
      lower !== 'area' &&
      lower !== 'home'
    ) {
      const alreadyContained = unique.some((u) =>
        u
          .toLowerCase()
          .split(',')
          .map((s) => s.trim())
          .includes(lower)
      );
      if (!alreadyContained) {
        seen.add(lower);
        unique.push(cleanP);
      }
    }
  }

  return unique.join(', ');
}

module.exports = {
  INDIAN_STATES,
  STATE_ALIASES,
  cleanPostalParentheses,
  parseAddressString,
  formatCleanAddress,
};
