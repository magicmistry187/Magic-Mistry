// ─────────────────────────────────────────────────────────────────────────────
// addressParser.js — Robust Indian address string and object parser
// ─────────────────────────────────────────────────────────────────────────────

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Orissa', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Jammu and Kashmir', 'Jammu', 'Kashmir', 'Ladakh',
  'Chandigarh', 'Puducherry', 'Pondicherry', 'Andaman and Nicobar',
  'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep'
];

export const STATE_ALIASES = {
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

export const KNOWN_MAJOR_CITIES = new Set([
  'kolkata', 'bolpur', 'suri', 'rampurhat', 'bardhaman', 'asansol', 'durgapur',
  'siliguri', 'kharagpur', 'haldia', 'howrah', 'ranaghat', 'krishnanagar', 'berhampore',
  'delhi', 'new delhi', 'mumbai', 'bengaluru', 'bangalore', 'hyderabad', 'chennai', 'ahmedabad',
  'pune', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'patna', 'vadodara',
  'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'varanasi',
  'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'prayagraj',
  'ranchi', 'coimbatore', 'jabalpur', 'gwalior', 'vijayawada', 'jodhpur', 'madurai',
  'raipur', 'kota', 'chandigarh', 'guwahati', 'solapur', 'hubballi', 'mysuru', 'tiruchirappalli',
  'bareilly', 'aligarh', 'tiruppur', 'gurgaon', 'gurugram', 'moradabad', 'jalandhar', 'bhubaneswar',
  'salem', 'warangal', 'mira-bhayandar', 'jalgaon', 'guntur', 'thiruvananthapuram', 'kochi',
  'noida', 'ghatshila', 'dehradun', 'jammu', 'shimla', 'gangtok', 'shillong'
]);

export const KNOWN_DISTRICTS = new Set([
  'birbhum', 'bardhaman', 'burdwan', 'purba bardhaman', 'paschim bardhaman',
  'bankura', 'hooghly', 'howrah', 'nadia', 'murshidabad', 'malda',
  'north 24 parganas', 'south 24 parganas', 'darjeeling', 'jalpaiguri',
  'alipurduar', 'cooch behar', 'uttar dinajpur', 'dakshin dinajpur',
  'purulia', 'jhargram', 'paschim medinipur', 'purba medinipur',
  'patna', 'gaya', 'muzaffarpur', 'bhagalpur', 'purnia', 'darbhanga',
  'ranchi', 'dhanbad', 'east singhbhum', 'west singhbhum', 'bokaro',
  'lucknow', 'kanpur', 'varanasi', 'prayagraj', 'agra', 'meerut', 'ghaziabad',
  'jaipur', 'jodhpur', 'kota', 'bikaner', 'ajmer', 'udaipur',
  'bengaluru urban', 'bengaluru rural', 'bangalore urban', 'bangalore rural', 'mysuru',
  'pune', 'nagpur', 'thane', 'mumbai suburban', 'nashik', 'aurangabad',
  'ahmedabad', 'surat', 'vadodara', 'rajkot',
  'chennai', 'coimbatore', 'madurai', 'tiruchirappalli',
  'hyderabad', 'rangareddy', 'medchal',
  'bhopal', 'indore', 'gwalior', 'jabalpur'
]);

/**
 * Strips postal sub-office parentheses like "Birbhum (Bolpur)" -> "Bolpur"
 */
export function cleanPostalParentheses(str) {
  if (!str || typeof str !== 'string') return '';
  const trimmed = str.trim();
  const parenMatch = trimmed.match(/\((.*?)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }
  return trimmed.replace(/[()]/g, '').trim();
}

/**
 * Checks if a string represents an administrative region (district, tehsil, CD block, mandal, etc.)
 */
export function isAdministrativeToken(t) {
  if (!t || typeof t !== 'string') return false;
  const lower = t.toLowerCase().trim();
  return (
    KNOWN_DISTRICTS.has(lower) ||
    lower.includes('tehsil') ||
    lower.includes('cd block') ||
    lower.includes('block') ||
    lower.includes('district') ||
    lower.includes('metropolitan area') ||
    lower.includes('corporation') ||
    lower.includes('division') ||
    lower.includes('subdivision') ||
    lower.includes('mandal') ||
    lower.includes('taluk') ||
    lower.includes('taluka') ||
    lower === 'bolpur sriniketan'
  );
}

/**
 * Parses any Indian address input (full string or partially structured object)
 * into clean, separate address fields: flat, street, landmark, city, state, pincode.
 *
 * @param {string|object} input
 * @returns {{ flat: string, street: string, city: string, state: string, landmark: string, pincode: string }}
 */
export function parseAddressString(input) {
  if (!input) {
    return { flat: '', street: '', city: '', state: '', landmark: '', pincode: '' };
  }

  // 1. If input is ALREADY a structured object
  if (typeof input === 'object' && input !== null) {
    let objFlat = (input.flat || input.house || '').trim();
    let objStreet = (input.street || '').trim();
    let objCity = (input.city || '').trim();
    let objState = (input.state || '').trim();
    let objLandmark = (input.landmark || '').trim();
    let objPincode = (input.pincode === '000000' ? '' : (input.pincode || '')).trim();

    if (objFlat.includes(',') || objFlat.length > 25) {
      objFlat = '';
    }
    if (objCity.includes('(')) {
      objCity = cleanPostalParentheses(objCity);
    }

    const isGeneric = (str) =>
      !str ||
      /^(home|office|other|current location|area|000000|set your location)$/i.test(str);

    if (isGeneric(objStreet) || isAdministrativeToken(objStreet)) objStreet = '';
    if (isGeneric(objCity) || isAdministrativeToken(objCity)) objCity = '';

    // If both street and city are present and street is not a full 3+ comma address string:
    const isStreetFull = objStreet && objStreet.includes(',') && objStreet.split(',').length >= 3;
    if (objCity && objStreet && !isStreetFull) {
      return {
        flat: objFlat,
        street: objStreet,
        city: objCity,
        state: objState,
        landmark: objLandmark,
        pincode: objPincode,
      };
    }

    // Only fallback to full string if street or city is missing or street was a full string:
    const fallbackString = isStreetFull
      ? objStreet
      : (input.addressLine1 || input.fullAddress || input.formattedAddress || '');

    if (fallbackString && fallbackString.includes(',')) {
      input = fallbackString;
    } else {
      return {
        flat: objFlat,
        street: objStreet || objCity || 'Local Area',
        city: objCity || objStreet || 'Local Area',
        state: objState,
        landmark: objLandmark,
        pincode: objPincode,
      };
    }
  }

  // 2. Parse String
  let str = String(input).trim();
  if (
    !str ||
    /^(set your location|set service location|no address set|no saved address yet|no address set\..*|current location|select location)$/i.test(str)
  ) {
    return { flat: '', street: '', city: '', state: '', landmark: '', pincode: '' };
  }

  str = str
    .replace(/,?\s*\bCurrent Location\b/gi, '')
    .replace(/,?\s*\b000000\b/g, '')
    .replace(/,\s*,+/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '');

  let rawParts = str
    .split(',')
    .map((p) => cleanPostalParentheses(p.trim()))
    .filter((p) => p && !/^(current location|location|select location|set your location|set service location|no address set|no saved address yet|000000)$/i.test(p));

  let parts = [...rawParts];
  let extractedPincode = '';
  let extractedState = '';
  let extractedCity = '';
  let extractedLandmark = '';
  let extractedFlat = '';
  let extractedStreet = '';

  // Extract 6-digit Pincode from right to left
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

  // Extract State
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

  // Remove "India" / "Bharat"
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].toLowerCase() === 'india' || parts[i].toLowerCase() === 'bharat') {
      parts.splice(i, 1);
    }
  }

  // Extract Landmark
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i].toLowerCase();
    if (
      p.startsWith('near') ||
      p.startsWith('opp') ||
      p.startsWith('opposite') ||
      p.startsWith('behind') ||
      p.startsWith('beside') ||
      p.startsWith('station') ||
      p.startsWith('landmark') ||
      p.includes('station') ||
      p.includes('metro') ||
      p.includes('temple') ||
      p.includes('masjid') ||
      p.includes('church') ||
      p.includes('school') ||
      p.includes('hospital') ||
      p.includes('mall') ||
      p.includes('plaza') ||
      p.includes('market') ||
      p.includes('park') ||
      p.includes('road more') ||
      p.includes('more')
    ) {
      extractedLandmark = parts[i].replace(/^landmark\s*[:\-]?\s*/i, '');
      parts.splice(i, 1);
      break;
    }
  }

  // Extract Flat / House from first part
  if (parts.length > 1) {
    const first = parts[0].toLowerCase();
    if (
      /^(\d+[a-z]?|no\.?\s*\d+|flat|house|plot|door|room|shop|building|tower|h\.?no|block|#)\b/i.test(first) ||
      (/^\d+[\/\-]?\d*[a-z]?$/i.test(first) && first.length <= 10) ||
      (/\b\d+\b/.test(first) && first.length <= 15)
    ) {
      extractedFlat = parts.shift();
    }
  }

  // Disambiguate City and Street
  if (parts.length > 0) {
    let cityIndex = -1;

    // Check if any part matches a known major city
    for (let i = 0; i < parts.length; i++) {
      const pLower = parts[i].toLowerCase();
      if (KNOWN_MAJOR_CITIES.has(pLower)) {
        cityIndex = i;
        break;
      }
    }

    // Check if the last part is a known district
    if (cityIndex === -1 && parts.length >= 2) {
      const lastLower = parts[parts.length - 1].toLowerCase();
      if (KNOWN_DISTRICTS.has(lastLower)) {
        cityIndex = parts.length - 2;
        parts.splice(parts.length - 1, 1);
      }
    }

    // Default fallback: last part is city
    if (cityIndex === -1) {
      cityIndex = parts.length - 1;
    }

    extractedCity = parts[cityIndex];
    parts.splice(cityIndex, 1);

    // If any remaining part is a known district or administrative block, remove it from street
    parts = parts.filter((p) => !isAdministrativeToken(p));

    extractedStreet = parts.join(', ');
  }

  // Clean parentheses from city
  if (extractedCity && extractedCity.includes('(')) {
    extractedCity = cleanPostalParentheses(extractedCity);
  }

  if (extractedFlat && (extractedFlat.includes(',') || extractedFlat.length > 25)) {
    extractedFlat = '';
  }

  return {
    flat: extractedFlat,
    street: extractedStreet || extractedCity || 'Local Area',
    city: extractedCity || 'Local Area',
    state: extractedState || '',
    landmark: extractedLandmark,
    pincode: extractedPincode,
  };
}

/**
 * Formats an address string or object cleanly:
 * - Removes dummy strings like "Current Location" and "000000"
 * - Cleans parentheses like "Birbhum (Bolpur)" -> "Bolpur"
 * - Prevents house/flat from duplicating the full address line
 * - Deduplicates repeated tokens
 *
 * @param {string|object} input
 * @returns {string}
 */
export function formatCleanAddress(input) {
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
