import api from './axios'

/**
 * Registers a new user account.
 * @param {object} payload - { full_name, email, password, age }
 * @returns {Promise} UserResponse with id, full_name, email
 */
export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload)
  return response.data
}

/**
 * Authenticates a user and returns a JWT token.
 * Uses URLSearchParams because FastAPI OAuth2 expects form data not JSON.
 * @param {string} email
 * @param {string} password
 * @returns {Promise} { access_token, token_type }
 */
export const loginUser = async (email, password) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return response.data
}