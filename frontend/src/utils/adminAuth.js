/**
 * Canonical Admin Authentication & Session Management
 *
 * Provides verified credentials and token for the Magic Mistry Super Admin
 * (magicmistry187@gmail.com / ID: 6ab10d406fae74eeafe5559c).
 * Allows instant, zero-flicker access to the Admin Dashboard for developers and administrators.
 */

export const CANONICAL_ADMIN_USER = {
  _id: '6ab10d406fae74eeafe5559c',
  id: '6ab10d406fae74eeafe5559c',
  userId: '6ab10d406fae74eeafe5559c',
  email: 'magicmistry187@gmail.com',
  fullName: 'Magic Mistry Admin',
  role: 'admin',
  status: 'active',
  isEmailVerified: true,
};

// Dynamic admin token fallback (retrieved from active session or empty string)
export const CANONICAL_ADMIN_TOKEN = '';

/**
 * Returns current admin token from localStorage
 */
export function getAdminToken() {
  if (typeof window === 'undefined') return '';
  try {
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('mm_token') ||
      localStorage.getItem('token') ||
      ''
    );
  } catch {
    return '';
  }
}

/**
 * Synchronously activates the admin session in localStorage
 */
export function activateAdminSession(token, user) {
  if (typeof window === 'undefined') return;
  try {
    const adminToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
    const adminUser = user || CANONICAL_ADMIN_USER;
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('mm_token', adminToken);
      localStorage.setItem('token', adminToken);
    }
    localStorage.setItem('mm_user', JSON.stringify(adminUser));
    localStorage.setItem('user', JSON.stringify(adminUser));
  } catch (err) {
    console.warn('Error activating admin session:', err);
  }
}

/**
 * Check if the provided user profile has admin privileges
 */
export function isAdminUser(user) {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const email = (user.email || '').toLowerCase().trim();
  return role === 'admin' || email === 'magicmistry187@gmail.com';
}
