import { registerBiometrics, deleteFaceEmbedding } from './users'

export const enrollFace = async (imageFile) => registerBiometrics(imageFile)

export const removeFace = async () => deleteFaceEmbedding()
