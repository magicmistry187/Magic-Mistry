import { apiConnector, BASE_URL } from '../apiConnector';

const BANNER_API = `${BASE_URL}/banners`;

// Default fallback banner structure
export const DEFAULT_FRONTEND_BANNER = {
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
  countdownExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  isCountdownEnabled: true,
  isDismissible: true,
  placement: 'all',
  isPopupEnabled: true,
  popupDelay: 0.4,
  popupFloatingTrigger: true,
};

const getAuthToken = (token) =>
  token ||
  (typeof window !== 'undefined'
    ? localStorage.getItem('adminToken') ||
      localStorage.getItem('mm_token') ||
      localStorage.getItem('token')
    : null);

/**
 * Public: Fetch currently active promotional banner
 */
export async function getActiveBannerApi() {
  try {
    const res = await apiConnector('GET', `${BANNER_API}/active`);
    if (res?.data?.success) {
      return res.data.banner || null;
    }
    return null;
  } catch (err) {
    console.warn('Banner fetch error, defaulting to null:', err.message);
    return null;
  }
}

/**
 * Admin: Fetch full banner settings
 */
export async function getAdminBannerApi(token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      'GET',
      `${BANNER_API}/admin`,
      null,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );
    if (res?.data?.success && res.data.banner) {
      return res.data.banner;
    }
    return DEFAULT_FRONTEND_BANNER;
  } catch (err) {
    console.warn('Error fetching admin banner:', err.message);
    return DEFAULT_FRONTEND_BANNER;
  }
}

/**
 * Admin: Update banner settings
 */
export async function updateAdminBannerApi(bannerData, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      'PUT',
      `${BANNER_API}/admin`,
      bannerData,
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );
    if (res?.data?.success) {
      return { success: true, banner: res.data.banner };
    }
    throw new Error(res?.data?.message || 'Failed to update banner');
  } catch (err) {
    console.error('Error updating banner:', err);
    throw err;
  }
}

/**
 * Quick 1-Tap Toggle: Instantly toggle banner ON or OFF
 */
export async function toggleBannerApi(isActive, token) {
  try {
    const authToken = getAuthToken(token);
    const res = await apiConnector(
      'PATCH',
      `${BANNER_API}/toggle`,
      { isActive },
      authToken ? { Authorization: `Bearer ${authToken}` } : {}
    );
    if (res?.data?.success) {
      return { success: true, banner: res.data.banner };
    }
    throw new Error(res?.data?.message || 'Failed to toggle banner');
  } catch (err) {
    console.error('Error toggling banner:', err);
    throw err;
  }
}
