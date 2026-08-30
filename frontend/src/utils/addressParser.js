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
    str === 'Area';

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
    const rawParts = stringToParse.split(',').map((p) => p.trim()).filter(Boolean);
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

    // 2. Extract State (check against known Indian states from right to left)
    for (let i = parts.length - 1; i >= 0; i--) {
      const partLower = parts[i].toLowerCase();
      const matchedState = INDIAN_STATES.find(
        (s) => s.toLowerCase() === partLower || partLower.includes(s.toLowerCase())
      );
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
        p.includes('station') ||
        p.includes('metro') ||
        p.includes('temple') ||
        p.includes('school') ||
        p.includes('hospital') ||
        p.includes('mall')
      ) {
        extractedLandmark = parts[i];
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

    // 6. From remaining parts: last part is City, preceding parts are Street/Area
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
