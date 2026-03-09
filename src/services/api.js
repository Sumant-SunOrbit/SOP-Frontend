import axios from 'axios';

// 1. Determine the Base URL based on the environment
const getBaseUrl = () => {
  // Priority 1: If VITE_API_URL is defined in .env, use it
  if (window.location.hostname === 'konnect.krisala.com') {
    console.log("Production URL running")
    return 'https://sop-backend-green.vercel.app/api';
    // return import.meta.env.VITE_API_URL;
  }

  // // Priority 2: If running on localhost (development), use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log("Local URL running")
    return 'https://sop-backend-green.vercel.app/api';
    // return 'http://localhost:5002/api';
  }

  // Priority 3: Fallback for production if variable is missing (hardcoded live URL)
  console.log("Fallback URL running")
  return 'https://sop-backend-green.vercel.app/api';
  // return 'https://konnect.krisala.com/sop/api';
  // return 'http://localhost:5002/api';
};

// 2. Create the Axios Instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Often needed if you are using cookies/sessions
});

// REQUEST: Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: Handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid -> Logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // const base = import.meta.env.VITE_BASE_PATH || '';
    // window.location.href = `${base}/login`; 
    window.location.href = `/login`; 
    }
    return Promise.reject(error);
  }
);

export default api;