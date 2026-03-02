import React, { useEffect, useMemo, useState } from 'react'
import { getPcaVisualization, getSessionEmbeddingHistory, storeSessionEmbedding, clearSessionEmbeddings } from '../api/analytics'
import Text from '../components/ui/Text'

const Analytics = () => {
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pcaHint, setPcaHint] = useState(null)
  const [sessionHistory, setSessionHistory] = useState([])
  const [embeddingInput, setEmbeddingInput] = useState('')
  const [sessionId, setSessionId] = useState('')

  const formatTs = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toISOString().replace('T', ' ').substring(0, 19)
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        setPcaHint(null)
        const data = await getPcaVisualization()
        const history = await getSessionEmbeddingHistory(50)
        setPayload(data)
        setSessionHistory(history?.records || [])
      } catch (e) {
        const status = e?.response?.status
        const detail = e?.response?.data?.detail
        if (status === 422 && typeof detail === 'string' && detail.toLowerCase().includes('insufficient')) {
          setPcaHint(detail)
        } else {
          setError('FAILED TO LOAD PCA DATA')
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const points = payload?.points || []
  const bounds = useMemo(() => {
    if (!points.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const p of points) {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    }
    return { minX, maxX, minY, maxY }
  }, [points])

  const mapPoint = (p, width, height, pad = 12) => {
    const xRange = bounds.maxX - bounds.minX || 1
    const yRange = bounds.maxY - bounds.minY || 1
    const x = pad + ((p.x - bounds.minX) / xRange) * (width - pad * 2)
    const y = pad + ((p.y - bounds.minY) / yRange) * (height - pad * 2)
    return { x, y }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Text variant="mono" className="animate-pulse text-purple-400">
          LOADING PCA PAYLOAD...
        </Text>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Text variant="mono" className="text-red-500">{error}</Text>
      </div>
    )
  }

  return (
    <div className="p-6 min-h-[calc(100vh-80px)] bg-surface-0 bg-cyber-grid flex flex-col gap-6">
      <div className="border-b border-purple-800 pb-4">
        <Text variant="h2">PCA ANALYTICS</Text>
        <Text variant="mono">
          POINTS: {payload?.total_points || 0} | VARIANCE: {payload?.total_variance || 0}
        </Text>
      </div>

      {pcaHint && (
        <div className="bg-surface-1 border border-purple-800 p-4">
          <Text variant="mono" className="text-purple-300">
            {pcaHint}
          </Text>
          <Text variant="mono" className="text-purple-500">
            Tip: Enroll biometrics for at least 3 users or store 3+ session embeddings.
          </Text>
        </div>
      )}

      <div className="bg-surface-1 border border-purple-800 p-4">
        <Text variant="subtext" className="mb-2">2D PROJECTION (X/Y)</Text>
        <div className="w-full h-80 border border-purple-900 bg-surface-2">
          <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="none">
            {points.map((p, idx) => {
              const pos = mapPoint(p, 600, 300)
              const color = p.is_current_user ? '#00ff88' : (p.source === 'registered' ? '#bf00ff' : '#cc44ff')
              return (
                <circle key={idx} cx={pos.x} cy={pos.y} r="2" fill={color} />
              )
            })}
            {!points.length && (
              <text x="50%" y="50%" textAnchor="middle" fill="#7c3aed" fontSize="12">
                NO PCA POINTS AVAILABLE
              </text>
            )}
          </svg>
        </div>
      </div>

      <div className="bg-surface-1 border border-purple-800 p-4">
        <Text variant="subtext" className="mb-2">SESSION EMBEDDINGS</Text>
        <div className="flex flex-col gap-3">
          <textarea
            className="cyber-input h-28"
            placeholder="Paste 512D embedding as JSON array"
            value={embeddingInput}
            onChange={(e) => setEmbeddingInput(e.target.value)}
          />
          <input
            className="cyber-input"
            placeholder="session_id (optional)"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="cyber-btn"
              onClick={async () => {
                if (!embeddingInput.trim()) return
                try {
                  const parsed = JSON.parse(embeddingInput)
                  if (!Array.isArray(parsed) || parsed.length !== 512) {
                    setError('EMBEDDING MUST BE 512 FLOATS')
                    return
                  }
                  await storeSessionEmbedding(parsed, sessionId || null)
                  const history = await getSessionEmbeddingHistory(50)
                  setSessionHistory(history?.records || [])
                } catch {
                  setError('INVALID EMBEDDING JSON')
                }
              }}
            >
              STORE EMBEDDING
            </button>
            <button
              className="cyber-btn"
              onClick={async () => {
                await clearSessionEmbeddings()
                setSessionHistory([])
              }}
            >
              CLEAR SESSIONS
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-1 border border-purple-800 p-4">
        <Text variant="subtext" className="mb-2">POINT METADATA (FIRST 20)</Text>
        {points.length === 0 ? (
          <Text variant="mono" className="text-purple-600">NO POINTS AVAILABLE</Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-900/40 font-mono text-[10px] text-purple-300 tracking-wider uppercase border-b border-purple-700">
                  <th className="p-3">USER</th>
                  <th className="p-3">SOURCE</th>
                  <th className="p-3">X</th>
                  <th className="p-3">Y</th>
                  <th className="p-3">Z</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm text-purple-100">
                {points.slice(0, 20).map((p, idx) => (
                  <tr key={idx} className="border-b border-purple-900/40">
                    <td className="p-3">{p.user_id}</td>
                    <td className="p-3">{p.source}</td>
                    <td className="p-3">{p.x}</td>
                    <td className="p-3">{p.y}</td>
                    <td className="p-3">{p.z}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface-1 border border-purple-800 p-4">
        <Text variant="subtext" className="mb-2">SESSION HISTORY (LAST 50)</Text>
        {sessionHistory.length === 0 ? (
          <Text variant="mono" className="text-purple-600">NO SESSION DATA</Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-900/40 font-mono text-[10px] text-purple-300 tracking-wider uppercase border-b border-purple-700">
                  <th className="p-3">ID</th>
                  <th className="p-3">SESSION</th>
                  <th className="p-3">CAPTURED</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm text-purple-100">
                {sessionHistory.map((r) => (
                  <tr key={r.id} className="border-b border-purple-900/40">
                    <td className="p-3">{r.id}</td>
                    <td className="p-3">{r.session_id || 'N/A'}</td>
                    <td className="p-3">{formatTs(r.captured_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
