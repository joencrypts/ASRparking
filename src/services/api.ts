import axios from 'axios';

// Determine the API base URL based on the environment
const getApiBaseUrl = () => {
  // Always use the Render backend in production
  if (import.meta.env.PROD) {
    return 'https://asrparking.onrender.com/api';
  }
  // In development, use the proxy
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get the auth token
const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem('asr-auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token;
    }
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }
  return null;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // In production, ensure we're using the full Render URL
    if (import.meta.env.PROD) {
      config.baseURL = 'https://asrparking.onrender.com/api';
    }

    // Log request details
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      params: config.params
    });

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response details
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
      config: {
        url: response.config.url,
        baseURL: response.config.baseURL,
        fullURL: `${response.config.baseURL}${response.config.url}`
      }
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      }
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('asr-auth-storage');
      localStorage.removeItem('asr-prebooking-storage');
      window.location.href = '/login';
    }
    
    if (error.message === 'Network Error') {
      console.error('Network Error: Please check your connection and try again');
    }
    
    return Promise.reject(error);
  }
);

export default api;
