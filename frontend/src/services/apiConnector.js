import axios from 'axios';

export const BASE_URL =  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
