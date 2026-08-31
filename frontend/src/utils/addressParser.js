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

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (
      !trimmed ||
      /^(set your location|set service location|no address set|no saved address yet|no address set\..*|current location|select location)$/i.test(trimmed)
    ) {
      return { flat: '', street: '', city: '', state: '', landmark: '', pincode: '' };
    }
  }

  // If input is an object
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
    /^(set your location|set service location|no address set|no saved address yet)$/i.test(str);

  if (isGeneric(rawFlat)) rawFlat = '';
  if (isGeneric(rawStreet)) rawStreet = '';

  // Determine if a full address string needs to be broken down:
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
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p && !/^(current location|location|select location|set your location|set service location|no address set|no saved address yet)$/i.test(p));
    let parts = [...rawParts];

    let extractedPincode = '';
    let extractedState = '';
    let extractedCity = '';
    let extractedLandmark = '';
    let extractedFlat = '';
    let extractedStreet = '';

    // 1. Extract 6-digit Pincode from right to left
    for (let i = parts.length - 1; i >= 0; i--) {
      const match = parts[i].match(/\b\d{6}\b/);
      if (match) {
        extractedPincode = match[0];
        const rem = parts[i].replace(/\b\d{6}\b/, '').replace(/[-–]/g, '').trim();
        if (rem) {
          parts[i] = rem;
        } else {
          parts.splice(i, 1);
        }
        break;
      }
    }

    // 2. Extract State (check against known Indian states & aliases from right to left)
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

    // 3. Remove "India" country entry if present
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].toLowerCase() === 'india') {
        parts.splice(i, 1);
      }
    }

    // 4. Extract Landmark if part indicates a landmark
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

    // 5. Extract House / Flat No from first item if it looks like building/flat
    if (parts.length > 0) {
      const first = parts[0].toLowerCase();
      if (
        /^(\d+|no\.?|flat|house|plot|door|room|shop|building|tower|h\.?no|block|#)\b/i.test(first) ||
        (/\b\d+\b/.test(first) && first.length <= 15)
      ) {
        extractedFlat = parts[0];
        parts.shift();
      }
    }

    // 6. If State was not found in known lists, and we have enough parts, check if the part before pincode was the State
    if (!extractedState && parts.length >= 3) {
      const candidateState = parts[parts.length - 1];
      if (candidateState && candidateState.length <= 25 && !/\d/.test(candidateState)) {
        extractedState = candidateState;
        parts.pop();
      }
    }

    // 7. From remaining parts: last part is City, preceding parts are Street/Area
    if (parts.length >= 2) {
      extractedCity = parts[parts.length - 1];
      parts.pop();
      extractedStreet = parts.join(', ');
    } else if (parts.length === 1) {
      if (!extractedCity) {
        extractedCity = parts[0];
      } else {
        extractedStreet = parts[0];
      }
    }

    return {
      flat: extractedFlat || (isFlatFullAddress ? '' : rawFlat) || '',
      street: extractedStreet || (isStreetFullAddress ? '' : rawStreet) || '',
      city: extractedCity || rawCity || '',
      state: extractedState || rawState || '',
      landmark: extractedLandmark || rawLandmark || '',
      pincode: extractedPincode || rawPincode || '',
    };
  }

  // If already clean structured object
  return {
    flat: rawFlat,
    street: rawStreet,
    city: rawCity,
    state: rawState,
    landmark: rawLandmark,
    pincode: rawPincode,
  };
}
