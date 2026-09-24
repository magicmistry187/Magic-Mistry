const mongoose = require('mongoose');
const Address = require('../models/address.model');
const User = require('../models/user.model');

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

    const houseVal = (house || flat || '').trim();
    const streetVal = (street || '').trim();
    const addressLine1Val = (req.body.addressLine1 || houseVal || streetVal).trim();
    const cityVal = (city || '').trim();
    const stateVal = (state || '').trim();
    const pincodeVal = (pincode || '').trim();
    const landmarkVal = (landmark || '').trim();
    const countryVal = (country || 'India').trim();

    // Validation
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

    return res.status(200).json({
      success: true,
      message: 'Addresses fetched successfully.',
      data: addresses,
      count: addresses.length,
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
    return res.status(200).json({
      success: true,
      message: 'Address fetched successfully.',
      data: address,
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

    if (req.body.flat && !req.body.house) {
      updatePayload.house = req.body.flat;
      updatePayload.addressLine1 = req.body.flat;
    } else if (req.body.house) {
      updatePayload.addressLine1 = req.body.house;
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

// ── Reverse Geocode Controller with High-Accuracy Pincode & Small Area Resolution ──
const geocodeCache = new Map();
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
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.status(200).json({ success: true, data: cached.data });
    }

    let flat = '';
    let street = '';
    let city = '';
    let state = '';
    let landmark = '';
    let pincode = '';
    let fullAddress = '';

    // ── 1. Nominatim at zoom=18 (high-detail street/building level) ──────────
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
        const a = data.address || {};

        flat = a.house_number || a.building || a.flat || a.room || a.house_name || a.shop || a.apartments || '';

        // Extract detailed street & small area (road + suburb / neighbourhood)
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

        // If road was empty, check if first part of display_name is the street
        if (!street && data.display_name) {
          const firstPart = data.display_name.split(',')[0]?.trim();
          if (firstPart && firstPart !== city && firstPart !== state) {
            street = firstPart;
          }
        }

        // If pincode was not in a.postcode, look for 6-digit pincode in display_name
        if (!pincode && data.display_name) {
          const pinMatch = data.display_name.match(/\b[1-9]\d{5}\b/);
          if (pinMatch) pincode = pinMatch[0];
        }

        fullAddress = data.display_name || '';
      }
    } catch (err) {
      console.warn('[ReverseGeocode] Nominatim zoom=18 failed:', err.message);
    }

    // ── 2. Fallback / Enrichment for missing Pincode or Small Area via Photon ──
    if (!pincode || !street) {
      try {
        const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
        const photonRes = await fetch(photonUrl);
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
      } catch (err) {
        console.warn('[ReverseGeocode] Photon enrichment failed:', err.message);
      }
    }

    // ── 3. Fallback for Pincode via Nominatim zoom=14 (Area/Postcode level) ────
    if (!pincode) {
      try {
        const nom14Url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=14`;
        const nom14Res = await fetch(nom14Url, {
          headers: {
            'User-Agent': 'MagicMistry/1.0 (contact@magicmistry.com)',
            'Accept-Language': 'en',
          },
        });
        if (nom14Res.ok) {
          const data14 = await nom14Res.json();
          const a14 = data14.address || {};
          pincode = (a14.postcode || '').replace(/\D/g, '').slice(0, 6);
          if (!pincode && data14.display_name) {
            const pinMatch = data14.display_name.match(/\b[1-9]\d{5}\b/);
            if (pinMatch) pincode = pinMatch[0];
          }
        }
      } catch (err) {
        console.warn('[ReverseGeocode] Nominatim zoom=14 failed:', err.message);
      }
    }

    // ── 4. Fallback for Indian Post Office Pincode API if still missing ───────
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
      } catch (err) {
        console.warn('[ReverseGeocode] PostalPincode API failed:', err.message);
      }
    }

    // Ensure street is never empty if we have city or locality
    if (!street) {
      street = city || 'Area';
    }

    const fullParts = [flat, street, landmark, city, state, pincode].filter(Boolean);
    const result = {
      flat: flat || '',
      street: street || '',
      city: city || '',
      state: state || '',
      landmark: landmark || '',
      pincode: pincode || '',
      fullAddress: fullParts.length ? fullParts.join(', ') : fullAddress,
    };

    // Cache result
    geocodeCache.set(cacheKey, { timestamp: Date.now(), data: result });
    if (geocodeCache.size > 500) {
      const oldest = geocodeCache.keys().next().value;
      geocodeCache.delete(oldest);
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Reverse Geocode Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reverse-geocode coordinates.',
    });
  }
};
