const Banner = require('../models/banner.model');
const { emitBannerUpdated } = require('../socket/socketEmitter');

// Default initial banner payload
const DEFAULT_BANNER = {
  title: 'Flat ₹150 OFF on all AC & Appliance Repairs',
  badgeText: 'FESTIVE SALE',
  badgeEmoji: '🔥',
  couponCode: 'MAGIC150',
  subtext: 'Valid on AC, Refrigerator, and Washing Machine repairs',
  ctaText: 'Book Now',
  ctaLink: '/booking',
  theme: 'sunset',
  gradientStart: '#02182e',
  gradientMiddle: '#1e3a8a',
  gradientEnd: '#f97316',
  textColor: '#ffffff',
  isActive: true,
  countdownExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isCountdownEnabled: true,
  isDismissible: true,
  placement: 'all',
  isPopupEnabled: true,
  popupDelay: 0.4,
  popupFloatingTrigger: true,
};

/**
 * Public: Get the currently active banner for customer website.
 */
exports.getActiveBanner = async (req, res) => {
  try {
    let banner = await Banner.findOne().sort({ updatedAt: -1 });

    if (!banner) {
      banner = await Banner.create(DEFAULT_BANNER);
    }

    // If banner is marked inactive or expired countdown, treat as inactive
    if (!banner.isActive) {
      return res.status(200).json({
        success: true,
        banner: null,
      });
    }

    return res.status(200).json({
      success: true,
      banner,
    });
  } catch (err) {
    console.error('Error fetching active banner:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active banner',
      banner: DEFAULT_BANNER,
    });
  }
};

/**
 * Admin: Get the banner configuration (active or inactive).
 */
exports.getAdminBanner = async (req, res) => {
  try {
    let banner = await Banner.findOne().sort({ updatedAt: -1 });

    if (!banner) {
      banner = await Banner.create(DEFAULT_BANNER);
    }

    return res.status(200).json({
      success: true,
      banner,
    });
  } catch (err) {
    console.error('Error fetching admin banner:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banner settings',
    });
  }
};

/**
 * Admin: Update banner configuration and broadcast live via WebSockets.
 */
exports.updateAdminBanner = async (req, res) => {
  try {
    const updateData = req.body;

    let banner = await Banner.findOne().sort({ updatedAt: -1 });

    if (!banner) {
      banner = new Banner({ ...DEFAULT_BANNER, ...updateData });
    } else {
      Object.assign(banner, updateData);
    }

    await banner.save();

    // Broadcast live to all connected clients
    emitBannerUpdated(banner);

    return res.status(200).json({
      success: true,
      message: 'Banner configuration updated successfully',
      banner,
    });
  } catch (err) {
    console.error('Error updating banner:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update banner configuration',
    });
  }
};

/**
 * Admin: Toggle banner active state directly with instant broadcast.
 */
exports.toggleBannerActive = async (req, res) => {
  try {
    let banner = await Banner.findOne().sort({ updatedAt: -1 });

    if (!banner) {
      banner = await Banner.create(DEFAULT_BANNER);
    }

    const newActiveState =
      typeof req.body.isActive === 'boolean'
        ? req.body.isActive
        : !banner.isActive;

    banner.isActive = newActiveState;
    await banner.save();

    // Broadcast live to all connected clients
    emitBannerUpdated(banner);

    return res.status(200).json({
      success: true,
      message: `Banner turned ${banner.isActive ? 'ON' : 'OFF'}`,
      banner,
    });
  } catch (err) {
    console.error('Error toggling banner:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle banner status',
    });
  }
};
