const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const toWsBase = (httpBase) => {
  const base = httpBase.replace('/api/v1', '')
  if (base.startsWith('https://')) return base.replace('https://', 'wss://')
  if (base.startsWith('http://')) return base.replace('http://', 'ws://')
  return base
}

export const getStreamUrl = (token) => {
  const wsBase = toWsBase(API_BASE)
  return `${wsBase}/ws/stream?token=${token}`
}
