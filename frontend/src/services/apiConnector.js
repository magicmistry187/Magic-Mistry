import axios from 'axios';

export const axiosInstance = axios.create({
  withCredentials: true,
});

export const apiConnector = (method, url, bodyData, headers, params) => {
  console.log('ApiConnector');

  // If bodyData is FormData, let axios auto-set Content-Type with boundary
  // Do NOT manually set Content-Type for FormData
  const isFormData = bodyData instanceof FormData;

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    params: params ? params : null,
  });
};
