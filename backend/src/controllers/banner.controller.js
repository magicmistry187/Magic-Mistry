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
 * Supports single-switch global disable/enable of all website banner modalities.
 */
exports.toggleBannerActive = async (req, res) => {
  try {
    let banner = await Banner.findOne().sort({ updatedAt: -1 });

    if (!banner) {
      banner = await Banner.create(DEFAULT_BANNER);
    }

    const isDisableAll = req.body.disableAll === true || req.body.isActive === false;
    const isEnableAll = req.body.enableAll === true;

    if (isDisableAll) {
      banner.isActive = false;
      banner.isPopupEnabled = false;
      banner.popupFloatingTrigger = false;
    } else if (isEnableAll) {
      banner.isActive = true;
      banner.isPopupEnabled = true;
      banner.popupFloatingTrigger = true;
    } else {
      if (typeof req.body.isActive === 'boolean') {
        banner.isActive = req.body.isActive;
      } else {
        banner.isActive = !banner.isActive;
      }
      if (typeof req.body.isPopupEnabled === 'boolean') {
        banner.isPopupEnabled = req.body.isPopupEnabled;
      }
      if (typeof req.body.popupFloatingTrigger === 'boolean') {
        banner.popupFloatingTrigger = req.body.popupFloatingTrigger;
      }
    }

    await banner.save();

    // Broadcast live to all connected clients
    emitBannerUpdated(banner);

    return res.status(200).json({
      success: true,
      message: `All banners turned ${banner.isActive ? 'ON' : 'OFF'}`,
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
