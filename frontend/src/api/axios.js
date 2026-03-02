import axios from 'axios'
// Central Axios instance for all API calls.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
// Handles JWT injection, token refresh on 401, and error normalization.
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// -----------------------------------------------------------------------------
// REQUEST INTERCEPTOR
// Injects the JWT token from localStorage into every request automatically.
// The token is stored as 'access_token' by the AuthContext on login.
// -----------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// -----------------------------------------------------------------------------
// RESPONSE INTERCEPTOR
// Handles 401 Unauthorized globally - clears token and redirects to login.
// This prevents protected pages from showing stale data after token expiry.
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // Redirect to login without using React Router to avoid circular deps
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api