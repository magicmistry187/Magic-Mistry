const mongoose = require('mongoose');
const Address = require('../models/address.model');
const User = require('../models/user.model');
const { cleanPostalParentheses, formatCleanAddress, KNOWN_DISTRICTS } = require('../utils/addressParser');

exports.createAddress = async (req, res) => {
  try {
    const {
      addressType,
      house,
      flat,
      street,
      landmark,
      city,
      state,
      country,
      pincode,
      location,
      latitude,
      longitude,
      lat,
      lng,
      isDefault,
    } = req.body;

    const rawHouse = (house || flat || '').trim();
    // Prevent full address string from being wrongly saved into house/flat
    const isRealHouse = rawHouse && !rawHouse.includes(',') && rawHouse.length <= 25;
    const houseVal = isRealHouse ? rawHouse : '';
    const streetVal = (street || '').trim();
    const addressLine1Val = (req.body.addressLine1 || streetVal || houseVal).trim();
    const rawCity = (city || '').trim();
    const cityVal = cleanPostalParentheses(rawCity);
    const stateVal = (state || '').trim();
    const rawPincode = (pincode || '').trim();
    const pincodeVal = rawPincode === '000000' ? '' : rawPincode;
    const landmarkVal = (landmark || '').trim();
    const countryVal = (country || 'India').trim();

    // Validation
    if (!addressLine1Val && !streetVal) {
      return res.status(400).json({
        success: false,
        message: 'Street or address line is required.',
      });
    }

    if (!cityVal || !stateVal) {
      return res.status(400).json({
        success: false,
        message: 'City and state are required.',
      });
    }

    // Parse coordinates if provided
    let coords = null;
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2 && !isNaN(Number(location.coordinates[0])) && !isNaN(Number(location.coordinates[1]))) {
      coords = [Number(location.coordinates[0]), Number(location.coordinates[1])];
    } else if (longitude !== undefined && latitude !== undefined && !isNaN(Number(longitude)) && !isNaN(Number(latitude))) {
      coords = [Number(longitude), Number(latitude)];
    } else if (lng !== undefined && lat !== undefined && !isNaN(Number(lng)) && !isNaN(Number(lat))) {
      coords = [Number(lng), Number(lat)];
    }

    const addressCount = await Address.countDocuments({
      user: req.user.id,
    });

    const makeDefault = addressCount === 0 ? true : !!isDefault;

    if (makeDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } },
      );
    }

    const addressData = {
      user: req.user.id,
      addressType: addressType || 'Home',
      house: houseVal,
      addressLine1: addressLine1Val,
      street: streetVal || addressLine1Val,
      landmark: landmarkVal,
      city: cityVal,
      state: stateVal,
      country: countryVal,
      pincode: pincodeVal,
      isDefault: makeDefault,
    };

    if (coords) {
      addressData.location = {
        type: 'Point',
        coordinates: coords,
      };
    }

    const address = await Address.create(addressData);

    return res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: address,
      address: address,
    });
  } catch (error) {
    console.error('Create Address Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create address: ' + (error.message || error),
    });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.id,
    });

    const cleanedAddresses = addresses.map((addr) => {
      const doc = addr.toObject ? addr.toObject() : { ...addr };
      // Self-heal corrupted house field
      if (doc.house && (doc.house.includes(',') || doc.house.length > 25)) {
        doc.house = '';
      }
      // Self-heal dummy street or pincode
      if (doc.street === 'Current Location' && doc.addressLine1 && doc.addressLine1 !== 'Current Location') {
        doc.street = doc.addressLine1;
      }
      if (doc.pincode === '000000') {
        doc.pincode = '';
      }
      if (doc.city && doc.city.includes('(')) {
        doc.city = cleanPostalParentheses(doc.city);
      }
      return doc;
    });

    return res.status(200).json({
      success: true,
      message: 'Addresses fetched successfully.',
      data: cleanedAddresses,
      addresses: cleanedAddresses,
      count: cleanedAddresses.length,
    });
  } catch (error) {
    console.error('Get Addresses Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }
    const doc = address.toObject ? address.toObject() : { ...address };
    if (doc.house && (doc.house.includes(',') || doc.house.length > 25)) {
      doc.house = '';
    }
    if (doc.street === 'Current Location' && doc.addressLine1 && doc.addressLine1 !== 'Current Location') {
      doc.street = doc.addressLine1;
    }
    if (doc.pincode === '000000') {
      doc.pincode = '';
    }
    if (doc.city && doc.city.includes('(')) {
      doc.city = cleanPostalParentheses(doc.city);
    }

    return res.status(200).json({
      success: true,
      message: 'Address fetched successfully.',
      data: doc,
      address: doc,
    });
  } catch (error) {
    console.error('Get Address Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const rawId = req.params.id || req.body._id || req.body.id || req.body.addressId || req.query.id;
    const cleanId = rawId && rawId !== 'undefined' && rawId !== 'null' ? rawId : null;

    if (!cleanId || !mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid address ID is required to update an address.',
      });
    }

    const existingAddress = await Address.findOne({
      _id: cleanId,
      user: req.user.id,
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.addressId;

    const rawHouse = (req.body.house || req.body.flat || '').trim();
    const isRealHouse = rawHouse && !rawHouse.includes(',') && rawHouse.length <= 25;
    updatePayload.house = isRealHouse ? rawHouse : '';
    if (req.body.addressLine1) {
      updatePayload.addressLine1 = req.body.addressLine1.trim();
    } else if (updatePayload.house && req.body.street) {
      updatePayload.addressLine1 = `${updatePayload.house}, ${req.body.street.trim()}`;
    } else if (updatePayload.house) {
      updatePayload.addressLine1 = updatePayload.house;
    } else if (req.body.street) {
      updatePayload.addressLine1 = req.body.street.trim();
    }

    if (updatePayload.city) {
      updatePayload.city = cleanPostalParentheses(updatePayload.city);
    }
    if (updatePayload.pincode === '000000') {
      updatePayload.pincode = '';
    }

    if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
      updatePayload.location = {
        type: 'Point',
        coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
      };
    } else if (req.body.lng !== undefined && req.body.lat !== undefined) {
      updatePayload.location = {
        type: 'Point',
        coordinates: [Number(req.body.lng), Number(req.body.lat)],
      };
    }

    let updatedAddress;

    if (existingAddress) {
      if (req.body.isDefault) {
        await Address.updateMany(
          {
            user: req.user.id,
            _id: { $ne: existingAddress._id },
          },
          {
            $set: { isDefault: false },
          },
        );
      }

      updatedAddress = await Address.findByIdAndUpdate(
        existingAddress._id,
        {
          $set: updatePayload,
        },
        {
          new: true,
          runValidators: true,
        },
      );
    } else {
      // If no address exists yet for this user/vendor, create it
      const houseVal = (req.body.house || req.body.flat || '').trim();
      const streetVal = (req.body.street || '').trim();
      const addressLine1Val = (req.body.addressLine1 || houseVal || streetVal).trim();
      const cityVal = (req.body.city || '').trim();
      const stateVal = (req.body.state || '').trim();
      const pincodeVal = (req.body.pincode || '').trim();

      if (!addressLine1Val && !streetVal) {
        return res.status(400).json({
          success: false,
          message: 'Street or address line is required.',
        });
      }
      if (!cityVal || !stateVal || !pincodeVal) {
        return res.status(400).json({
          success: false,
          message: 'City, state, and pincode are required.',
        });
      }

      let coords = null;
      if (req.body.location?.coordinates?.length === 2 && !isNaN(Number(req.body.location.coordinates[0])) && !isNaN(Number(req.body.location.coordinates[1]))) {
        coords = [Number(req.body.location.coordinates[0]), Number(req.body.location.coordinates[1])];
      } else if (req.body.longitude !== undefined && req.body.latitude !== undefined && !isNaN(Number(req.body.longitude)) && !isNaN(Number(req.body.latitude))) {
        coords = [Number(req.body.longitude), Number(req.body.latitude)];
      }

      const newAddrData = {
        user: req.user.id,
        addressType: req.body.addressType || req.body.type || 'Home',
        house: houseVal,
        addressLine1: addressLine1Val,
        street: streetVal || addressLine1Val,
        landmark: (req.body.landmark || '').trim(),
        city: cityVal,
        state: stateVal,
        country: (req.body.country || 'India').trim(),
        pincode: pincodeVal,
        isDefault: true,
      };

      if (coords) {
        newAddrData.location = { type: 'Point', coordinates: coords };
      }

      updatedAddress = await Address.create(newAddrData);
    }

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: updatedAddress,
      address: updatedAddress,
    });
  } catch (error) {
    console.error('Update Address Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }
    const wasDefault = address.isDefault;

    await Address.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    if (wasDefault) {
      const anotherAddress = await Address.findOne({
        user: req.user.id,
      });

      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }
    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Address Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// ── Helper: Check for administrative district / tehsil / block names ──────────
function isAdministrativeToken(t) {
  if (!t || typeof t !== 'string') return true;
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
    lower.includes('taluka')
  );
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

// ── Reverse Geocode Controller with High-Accuracy Pincode & Small Area Resolution ──
const geocodeCache = new Map();
const autocompleteCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

exports.reverseGeocode = async (req, res) => {
  try {
    const lat = Number(req.query.lat || req.query.latitude);
    const lng = Number(req.query.lng || req.query.lon || req.query.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required.',
      });
    }

    // Check cache
    const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    const cached = geocodeCache.get(cacheKey);
    if (
      cached &&
      Date.now() - cached.timestamp < CACHE_TTL_MS &&
      cached.data &&
      !isAdministrativeToken(cached.data.street) &&
      !cached.data.street.toLowerCase().includes('bolpur sriniketan') &&
      !cached.data.street.toLowerCase().includes('main road')
    ) {
      return res.status(200).json({ success: true, data: cached.data });
    }

    let parsedResult = null;
    const locationIqKey = process.env.LOCATIONIQ_API_KEY || 'pk.43b9346c8e8046d3fdc74a70f9d0c1b1';

    // ── 1. Primary: LocationIQ (High-Accuracy Indian Villages, Streets & PINs) ─
    if (locationIqKey) {
      try {
        const liqUrl = `https://us1.locationiq.com/v1/reverse?key=${locationIqKey}&lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
        const liqRes = await fetch(liqUrl);
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
              } catch (nearErr) {
                console.warn('[ReverseGeocode] Nearby POI fetch failed:', nearErr.message);
              }
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
        console.warn('[ReverseGeocode] LocationIQ failed:', liqErr.message);
      }
    }

    // ── 2. Fallback: Nominatim at zoom=18 (if LocationIQ failed or missed city/pin) ──
    if (!parsedResult || !parsedResult.city || !parsedResult.pincode) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
        const nomRes = await fetch(nomUrl, {
          headers: {
            'User-Agent': 'MagicMistry/1.0 (contact@magicmistry.com)',
            'Accept-Language': 'en',
          },
        });

        if (nomRes.ok) {
          const data = await nomRes.json();
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
        console.warn('[ReverseGeocode] Nominatim zoom=18 failed:', err.message);
      }
    }

    // ── 3. Fallback: India Post Pincode Lookup (ONLY to resolve missing PIN / State) ─
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
        console.warn('[ReverseGeocode] India Post validation failed:', pinErr.message);
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

    finalResult.fullAddress = formatCleanAddress(finalResult) || finalResult.city || finalResult.street || 'Local Area';

    // Cache result
    geocodeCache.set(cacheKey, { timestamp: Date.now(), data: finalResult });
    if (geocodeCache.size > 500) {
      const oldest = geocodeCache.keys().next().value;
      geocodeCache.delete(oldest);
    }

    return res.status(200).json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    console.error('Reverse Geocode Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reverse-geocode coordinates.',
    });
  }
};

// ── Location Autocomplete Controller (LocationIQ India Autocomplete) ────────
exports.autocomplete = async (req, res) => {
  try {
    const q = (req.query.q || req.query.query || '').trim();
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const cacheKey = q.toLowerCase();
    const cached = autocompleteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.status(200).json({ success: true, data: cached.data });
    }

    const locationIqKey = process.env.LOCATIONIQ_API_KEY || 'pk.43b9346c8e8046d3fdc74a70f9d0c1b1';
    let suggestions = [];

    if (locationIqKey) {
      try {
        const autoUrl = `https://api.locationiq.com/v1/autocomplete?key=${locationIqKey}&q=${encodeURIComponent(q)}&countrycodes=in&limit=6&format=json`;
        const autoRes = await fetch(autoUrl);
        if (autoRes.ok) {
          const items = await autoRes.json();
          if (Array.isArray(items)) {
            suggestions = items.map((item) => {
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
        console.warn('[Autocomplete] LocationIQ failed:', liqErr.message);
      }
    }

    // Fallback to Nominatim search if LocationIQ returns empty
    if (suggestions.length === 0) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=in&format=json&addressdetails=1&limit=6`;
        const nomRes = await fetch(nomUrl, {
          headers: {
            'User-Agent': 'MagicMistry/1.0 (contact@magicmistry.com)',
            'Accept-Language': 'en',
          },
        });
        if (nomRes.ok) {
          const items = await nomRes.json();
          if (Array.isArray(items)) {
            suggestions = items.map((item) => {
              const parsed = parseIndianAddress(item);
              return {
                place_id: item.place_id,
                display_name: item.display_name,
                display_place: parsed?.street || item.name || '',
                display_address: `${parsed?.city || ''}, ${parsed?.state || ''}`,
                lat: Number(item.lat),
                lng: Number(item.lon),
                address: parsed,
              };
            });
          }
        }
      } catch (nomErr) {
        console.warn('[Autocomplete] Nominatim search failed:', nomErr.message);
      }
    }

    autocompleteCache.set(cacheKey, { timestamp: Date.now(), data: suggestions });
    if (autocompleteCache.size > 500) {
      const oldest = autocompleteCache.keys().next().value;
      autocompleteCache.delete(oldest);
    }

    return res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (err) {
    console.error('Autocomplete Controller Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions.',
    });
  }
};
