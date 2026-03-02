import api from './axios'

export const getCurrentUser = async () => {
  const response = await api.get('/users/me')
  return response.data
}

export const updateCurrentUser = async (payload) => {
  const response = await api.put('/users/me', payload)
  return response.data
}

export const deleteCurrentUser = async () => {
  await api.delete('/users/me')
}

/**
 * Registers biometric face embedding.
 * Sends image as multipart/form-data.
 * @param {File} imageFile - JPEG or PNG image file from webcam or upload
 */
export const registerBiometrics = async (imageFile) => {
  const formData = new FormData()
  formData.append('file', imageFile)
  const response = await api.post('/users/me/biometrics', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteFaceEmbedding = async () => {
  const response = await api.delete('/users/me/face_embedding')
  return response.data
}

export const refreshFaceEmbedding = async () => {
  const response = await api.post('/users/me/face_embedding')
  return response.data
}
