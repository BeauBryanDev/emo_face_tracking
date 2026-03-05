import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../api/users'
import { registerBiometrics, deleteFaceEmbedding } from '../api/users'
import { useAuth } from './AuthContext'

const BiometricsContext = createContext(null)

export const BiometricsProvider = ({ children }) => {
  const { user } = useAuth()
  const [hasEmbedding, setHasEmbedding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setHasEmbedding(Boolean(user?.has_embedding))
  }, [user])

  const refreshStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCurrentUser()
      setHasEmbedding(Boolean(data?.has_embedding))
      return data
    } catch (e) {
      setError('FAILED TO REFRESH BIOMETRICS')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const enroll = async (imageFile) => {
    setLoading(true)
    setError(null)
    try {
      const res = await registerBiometrics(imageFile)
      await refreshStatus()
      return res
    } catch (e) {
      setError('FAILED TO ENROLL BIOMETRICS')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const remove = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await deleteFaceEmbedding()
      await refreshStatus()
      return res
    } catch (e) {
      setError('FAILED TO REMOVE BIOMETRICS')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(() => ({
    hasEmbedding,
    loading,
    error,
    refreshStatus,
    enroll,
    remove,
  }), [hasEmbedding, loading, error])

  return (
    <BiometricsContext.Provider value={value}>
      {children}
    </BiometricsContext.Provider>
  )
}

export const useBiometrics = () => {
  const ctx = useContext(BiometricsContext)
  if (!ctx) throw new Error('useBiometrics must be used within BiometricsProvider')
  return ctx
}


export default BiometricsContext
