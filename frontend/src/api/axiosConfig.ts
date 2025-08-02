import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://4mnpqf-3000.csb.app/api',
});

// This code runs before every request is sent.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    // --- DEBUGGING LOG ---
    // This will show us if the token is present for each request.
    console.log('Interceptor: Attaching token:', token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
