import axios from 'axios';

// Dynamic URL Resolution: Seamlessly supports localhost and Render production
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

const customOverride = isBrowser ? localStorage.getItem('mm_api_url') : null;
let resolvedUrl = customOverride || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

if (!resolvedUrl || (isLocalhost && !customOverride && resolvedUrl.includes('onrender.com'))) {
  resolvedUrl = isLocalhost ? 'http://localhost:5000/api' : 'https://magic-mistry.onrender.com/api';
}

const rawBaseUrl = resolvedUrl;

export const BASE_URL = rawBaseUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawBaseUrl.replace(/\/+$/, '')
  : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

export const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

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
