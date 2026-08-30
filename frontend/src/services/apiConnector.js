import axios from 'axios';

export const BASE_URL =  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  withCredentials: true,
});

export const apiConnector = (method, url, bodyData, headers = {}, params) => {
  // If bodyData is FormData, let axios auto-set Content-Type with boundary
  // Do NOT manually set Content-Type for FormData
  const isFormData = bodyData instanceof FormData;

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

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...resolvedHeaders,
    },
    params: params ? params : null,
  });
};
