const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Convert HTTP base URL to WebSocket base URL
const toWsBase = (httpBase) => {
  const base = httpBase.replace('/api/v1', '')
  if (base.startsWith('https://')) return base.replace('https://', 'wss://')
  if (base.startsWith('http://')) return base.replace('http://', 'ws://')
  return base
}
// Convert HTTP base URL to WebSocket base URL

export const getStreamToken = async () => {
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grant_type: 'client_credentials' }),
  })
  return res.json()
}

export const getStreamUrl = (token) => {
  const wsBase = toWsBase(API_BASE)
  return `${wsBase}/ws/stream?token=${token}`
}
