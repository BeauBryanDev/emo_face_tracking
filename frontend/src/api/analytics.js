import api from './axios'

export const getPcaVisualization = async ({
  include_sessions = true,
  session_limit = 200,
} = {}) => {
  const response = await api.get('/analytics/pca', {
    params: { include_sessions, session_limit },
  })
  return response.data
}

export const storeSessionEmbedding = async (embedding, session_id = null) => {
  const response = await api.post('/analytics/session/embed', {
    embedding,
    session_id,
  })
  return response.data
}

export const getSessionEmbeddingHistory = async (limit = 50) => {
  const response = await api.get('/analytics/session/history', {
    params: { limit },
  })
  return response.data
}

export const clearSessionEmbeddings = async () => {
  const response = await api.delete('/analytics/session')
  return response.data
}
