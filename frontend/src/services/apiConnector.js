import axios from 'axios';

// Dynamic URL Resolution: Seamlessly supports localhost, local network (LAN), and Render production
const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalhost = isBrowser && (
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0' ||
  hostname === '[::1]' ||
  hostname.endsWith('.local') ||
  /^192\.168\.\d+\.\d+$/.test(hostname) ||
  /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)
);

const rawOverride = isBrowser ? localStorage.getItem('mm_api_url') : null;
const customOverride = (rawOverride && rawOverride !== 'null' && rawOverride !== 'undefined' && rawOverride.trim() !== '')
  ? rawOverride.trim()
  : null;

// Clean stale onrender override if the developer is testing locally
if (isLocalhost && customOverride && customOverride.includes('onrender.com')) {
  try { localStorage.removeItem('mm_api_url'); } catch (_) {}
}

const activeOverride = (isLocalhost && customOverride && customOverride.includes('onrender.com')) ? null : customOverride;

let resolvedUrl = activeOverride || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

if (!resolvedUrl || (isLocalhost && !activeOverride && resolvedUrl.includes('onrender.com'))) {
  resolvedUrl = isLocalhost
    ? `http://${hostname && hostname !== '0.0.0.0' ? hostname : 'localhost'}:5000/api`
    : 'https://magic-mistry.onrender.com/api';
}

const rawBaseUrl = resolvedUrl;

export const BASE_URL = rawBaseUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawBaseUrl.replace(/\/+$/, '')
  : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

export const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

if (isBrowser) {
  console.log(`[Magic Mistry] API Base URL: ${BASE_URL} | Socket URL: ${SOCKET_URL}`);
}

/**
 * Health check to verify frontend-to-backend connectivity
 */
export async function checkBackendHealth() {
  const rootUrl = BASE_URL.replace(/\/api\/?$/, '');
  try {
    const res = await axiosInstance.get(`${rootUrl}/`, { timeout: 4000 });
    return {
      connected: true,
      url: BASE_URL,
      socketUrl: SOCKET_URL,
      status: res.status,
      data: res.data,
    };
  } catch (err) {
    return {
      connected: false,
      url: BASE_URL,
      socketUrl: SOCKET_URL,
      error: err.message,
    };
  }
}

export const axiosInstance = axios.create({
  withCredentials: true,
});

export const apiConnector = (method, url, bodyData, headers = {}, params) => {
  const isFormData = bodyData instanceof FormData;
  const hasBody = bodyData !== null && bodyData !== undefined && bodyData !== '';

  // Resolve valid auth header
  const resolvedHeaders = { ...headers };

  // If Authorization is invalid (e.g. 'Bearer undefined', 'Bearer null'), try to retrieve saved token
  if (
    !resolvedHeaders.Authorization ||
    resolvedHeaders.Authorization === 'Bearer undefined' ||
    resolvedHeaders.Authorization === 'Bearer null'
  ) {
    const savedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('mm_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('adminToken') ||
          localStorage.getItem('vendorToken')
        : null;
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      resolvedHeaders.Authorization = `Bearer ${savedToken}`;
    } else {
      delete resolvedHeaders.Authorization;
    }
  }

  // Only set application/json if there is actually a body payload and not FormData
  if (hasBody && !isFormData && !resolvedHeaders['Content-Type']) {
    resolvedHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method: `${method}`,
    url: `${url}`,
    headers: resolvedHeaders,
    params: params ? params : null,
  };

  if (hasBody) {
    config.data = bodyData;
  }

  return axiosInstance(config);
};
