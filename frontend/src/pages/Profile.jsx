import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateCurrentUser, deleteCurrentUser, refreshFaceEmbedding } from '../api/users'
import { useBiometrics } from '../context/Biometrics'
import Text from '../components/ui/Text'

const Profile = () => {
  const { user, setUser, logout } = useAuth()
  const { enroll, remove, hasEmbedding, loading: bioLoading } = useBiometrics()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    password: '',
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone_number || undefined,
        password: form.password || undefined,
      }
      const updated = await updateCurrentUser(payload)
      setUser(updated)
      setForm((prev) => ({ ...prev, password: '' }))
      setStatus('PROFILE UPDATED')
    } catch {
      setStatus('FAILED TO UPDATE PROFILE')
    } finally {
      setLoading(false)
    }
  }

  const enrollBiometrics = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setStatus(null)
    try {
      await enroll(file)
      setStatus('BIOMETRIC TEMPLATE STORED')
    } catch {
      setStatus('FAILED TO STORE BIOMETRICS')
    } finally {
      setLoading(false)
    }
  }

  const removeBiometrics = async () => {
    setLoading(true)
    setStatus(null)
    try {
      await remove()
      setStatus('BIOMETRIC TEMPLATE REMOVED')
    } catch {
      setStatus('FAILED TO REMOVE BIOMETRICS')
    } finally {
      setLoading(false)
    }
  }

  const reSaveEmbedding = async () => {
    setLoading(true)
    setStatus(null)
    try {
      await refreshFaceEmbedding()
      setStatus('BIOMETRIC TEMPLATE REFRESHED')
    } catch {
      setStatus('FAILED TO REFRESH BIOMETRICS')
    } finally {
      setLoading(false)
    }
  }

  const removeAccount = async () => {
    setLoading(true)
    setStatus(null)
    try {
      await deleteCurrentUser()
      logout()
    } catch {
      setStatus('FAILED TO DELETE ACCOUNT')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 min-h-[calc(100vh-80px)] bg-surface-0 bg-cyber-grid flex flex-col gap-6">
      <div className="border-b border-purple-800 pb-4">
        <Text variant="h2">OPERATOR PROFILE</Text>
        <Text variant="mono">IDENTITY + BIOMETRICS</Text>
      </div>

      {status && (
        <div className="font-mono text-xs text-purple-300 border border-purple-800 p-2">
          {status}
        </div>
      )}

      <form onSubmit={saveProfile} className="bg-surface-1 border border-purple-800 p-4 flex flex-col gap-3">
        <label className="font-mono text-xs text-purple-400">FULL NAME</label>
        <input
          className="cyber-input"
          name="full_name"
          value={form.full_name}
          onChange={onChange}
        />

        <label className="font-mono text-xs text-purple-400">EMAIL</label>
        <input
          className="cyber-input"
          name="email"
          value={form.email}
          onChange={onChange}
        />

        <label className="font-mono text-xs text-purple-400">PHONE</label>
        <input
          className="cyber-input"
          name="phone_number"
          value={form.phone_number}
          onChange={onChange}
        />

        <label className="font-mono text-xs text-purple-400">NEW PASSWORD</label>
        <input
          className="cyber-input"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
        />

        <button type="submit" className="cyber-btn cyber-btn-primary" disabled={loading}>
          SAVE PROFILE
        </button>
      </form>

      <div className="bg-surface-1 border border-purple-800 p-4 flex flex-col gap-3">
        <Text variant="subtext">BIOMETRICS</Text>
        <div className="font-mono text-xs text-purple-400">
          STATUS: {hasEmbedding ? 'ENROLLED' : 'NOT ENROLLED'}
        </div>
        <input type="file" accept="image/*" onChange={enrollBiometrics} />
        <button className="cyber-btn" onClick={reSaveEmbedding} disabled={loading || bioLoading}>
          REFRESH EMBEDDING
        </button>
        <button className="cyber-btn" onClick={removeBiometrics} disabled={loading || bioLoading}>
          REMOVE BIOMETRICS
        </button>
      </div>

      <div className="bg-surface-1 border border-red-700/40 p-4">
        <Text variant="subtext" className="text-red-400">DANGER ZONE</Text>
        <button className="cyber-btn" onClick={removeAccount} disabled={loading}>
          DELETE ACCOUNT
        </button>
      </div>
    </div>
  )
}

export default Profile
