import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginUser } from '../api/auth'
import { getCurrentUser } from '../api/users'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null)
  const [token, setToken]         = useState(() => localStorage.getItem('access_token'))
  const [loading, setLoading]     = useState(true)
  const [bootPhase, setBootPhase] = useState('INITIALIZING')

  // ---------------------------------------------------------------------------
  // On mount: if token exists, fetch the current user profile to restore session
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false)
        setBootPhase('READY')
        return
      }
      try {
        setBootPhase('AUTHENTICATING')
        const userData = await getCurrentUser()
        setUser(userData)
        setBootPhase('READY')
      } catch {
        // Token is invalid or expired - clear it
        localStorage.removeItem('access_token')
        setToken(null)
        setUser(null)
        setBootPhase('READY')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ---------------------------------------------------------------------------
  // LOGIN
  // Authenticates, stores JWT, fetches user profile
  // ---------------------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    setBootPhase('AUTHENTICATING')
    const { access_token } = await loginUser(email, password)

    localStorage.setItem('access_token', access_token)
    setToken(access_token)

    const userData = await getCurrentUser()
    setUser(userData)
    setBootPhase('READY')

    return userData
  }, [])

  // ---------------------------------------------------------------------------
  // LOGOUT
  // Clears all local state and storage
  // ---------------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
    setBootPhase('READY')
  }, [])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        bootPhase,
        isAuthenticated,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to consume AuthContext.
 * Throws if used outside AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
