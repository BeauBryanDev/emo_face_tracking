import api from './axios'

/**
 * Fetches paginated emotion history with optional filters.
 * @param {object} params - { page, page_size, emotion_filter, date_from, date_to }
 */
export const getEmotionHistory = async (params = {}) => {
  const response = await api.get('/emotions/history', { params })
  return response.data
}

