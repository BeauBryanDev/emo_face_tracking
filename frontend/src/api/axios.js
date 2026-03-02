import axios from 'axios'
import { attachInterceptors } from './interceptor'

// Central Axios instance for all API calls.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

attachInterceptors(api)

export default api
