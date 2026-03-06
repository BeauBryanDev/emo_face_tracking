import React, { useEffect, useState } from 'react'
import { getPcaVisualization, getSessionEmbeddingHistory, storeSessionEmbedding, clearSessionEmbeddings } from '../api/analytics'
import Text from '../components/ui/Text'
import PcaScatterPlot from '../components/PcaScatterPlot'
import SessionEmbeddingManager from '../components/SessionEmbeddingManager'

const Analytics = () => {
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pcaHint, setPcaHint] = useState(null)
  const [sessionHistory, setSessionHistory] = useState([])

  const fetchData = async () => {
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
        setError('CRITICAL: FAILED_TO_SYNC_LATENT_SPACE')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStoreEmbedding = async (embedding, sessionId) => {
    try {
      await storeSessionEmbedding(embedding, sessionId)
      const history = await getSessionEmbeddingHistory(50)
      setSessionHistory(history?.records || [])
      // Refresh PCA if success
      const updatedPca = await getPcaVisualization()
      setPayload(updatedPca)
    } catch (e) {
      alert('STORAGE_PROTOCOL_FAILED: CHECK_CONSOLE_LOGS')
    }
  }

  const handleClearSessions = async () => {
    if (!window.confirm('PURGE_ALL_VECTORS: ARE_YOU_SURE?')) return
    try {
      await clearSessionEmbeddings()
      setSessionHistory([])
      setPayload(prev => ({ ...prev, points: [] }))
    } catch (e) {
      alert('CLEAR_OPERATIONS_ABORTED: SYSTEM_LOCK_ENGAGED')
    }
  }

  if (loading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center bg-surface-0">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-neon-purple border-t-transparent rounded-full animate-spin shadow-neon-sm" />
          <Text variant="mono" className="animate-pulse text-purple-400 tracking-[0.3em]">
            SYNCHRONIZING_LATENT_SPACE...
          </Text>
        </div>
      </div>
    )
  }

  if (error && !pcaHint) {
    return (
      <div className="p-6 h-screen flex items-center justify-center bg-surface-0">
        <div className="bg-purple-900/20 border border-red-500/50 p-8 flex flex-col items-center gap-4">
          <div className="text-red-500 text-4xl">⚠</div>
          <Text variant="mono" className="text-red-500 font-bold">{error}</Text>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500 text-red-500 font-mono text-xs hover:bg-red-500 hover:text-white transition-all shadow-neon-sm"
          >
            RETRY_SYNC_SEQUENCE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 min-h-[calc(100vh-80px)] bg-surface-0 bg-cyber-grid flex flex-col gap-6 relative overflow-hidden">

      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent animate-scan-fast pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[150px] pointer-events-none" />

      {/* DASHBOARD TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-purple-800/40 pb-6 gap-4 relative">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-neon-purple shadow-neon-sm" />
            <Text variant="h2" className="tracking-tighter text-3xl uppercase font-black">LATENT_SPACE_VISUALIZER</Text>
          </div>
          <Text variant="mono" className="text-purple-500 text-[10px] tracking-[0.2em] ml-4 font-bold">
            PCA_ENGINE: ARCFACE_512D_REDUCTION // VARIANCE: {(payload?.total_variance || 0).toFixed(4)}
          </Text>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-purple-500 uppercase tracking-widest">Global Nodes</span>
            <span className="text-2xl font-display text-neon-purple glow-sm">{payload?.total_points || 0}</span>
          </div>
          <div className="h-10 w-[1px] bg-purple-800/50" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-purple-500 uppercase tracking-widest">Sync Priority</span>
            <span className="text-2xl font-display text-neon-purple glow-sm">STABLE</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

        {/* LEFT PANEL: SCATTERPLOT VISUALIZATION (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-surface-1/40 border border-purple-800/40 p-1 relative flex-1 min-h-[500px]">
            {/* MODULE FRAME */}
            <div className="absolute -top-[1px] -right-[1px] w-8 h-8 border-t border-r border-neon-purple z-10" />
            <div className="absolute bottom-4 right-4 z-20">
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#00ff88]" />
                  <span className="text-[8px] text-purple-400 font-mono">SELF</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#bf00ff]" />
                  <span className="text-[8px] text-purple-400 font-mono">ENROLLED</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#cc44ff]" />
                  <span className="text-[8px] text-purple-400 font-mono">SESSION</span>
                </div>
              </div>
            </div>

            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Text variant="subtext" className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">01 // TOPOLOGICAL_EMBEDDING_MAP</Text>
                <div className="flex gap-1">
                  <div className="w-8 h-[2px] bg-neon-purple/20" />
                  <div className="w-1 h-[2px] bg-neon-purple" />
                </div>
              </div>

              {pcaHint ? (
                <div className="flex-1 flex items-center justify-center border border-purple-900 bg-purple-950/20 m-4 shadow-inner">
                  <div className="max-w-md p-8 bg-surface-2 border border-purple-800 text-center flex flex-col gap-4 relative">
                    <div className="absolute inset-0 border border-neon-purple/20 animate-pulse pointer-events-none" />
                    <div className="text-neon-purple font-mono text-sm leading-relaxed tracking-tight group">
                      {pcaHint}
                    </div>
                    <div className="h-[1px] bg-purple-800/50 w-full" />
                    <Text variant="mono" className="text-purple-500 text-[10px] uppercase">
                      Protocol: Enroll 3+ biometric profiles or store session vectors to generate map.
                    </Text>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <PcaScatterPlot points={payload?.points || []} />
                </div>
              )}
            </div>
          </div>

          {/* TELEMETRY READOUT (BOTTOM STRIP) */}
          <div className="bg-surface-1/40 border border-purple-800/40 p-3 flex justify-between items-center overflow-hidden">
            <div className="flex gap-6 overflow-hidden">
              <div className="flex flex-col min-w-[120px]">
                <span className="text-[7px] text-purple-600 font-mono uppercase">DATA_SOURCE</span>
                <span className="text-[10px] text-purple-200 font-mono font-black">NEURALCORE_PRIMARY</span>
              </div>
              <div className="flex flex-col min-w-[120px]">
                <span className="text-[7px] text-purple-600 font-mono uppercase">LATENCY_SYNC</span>
                <span className="text-[10px] text-purple-200 font-mono font-black">2.4ms_ENCRYPTED</span>
              </div>
              <div className="flex flex-col min-w-[120px]">
                <span className="text-[7px] text-purple-600 font-mono uppercase">PCA_ALGO</span>
                <span className="text-[10px] text-purple-200 font-mono font-black">RECURSIVE_SVD</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-purple shadow-neon-sm animate-pulse" />
              <span className="text-[8px] font-mono text-neon-purple font-black tracking-widest">LIVE_STREAM_ACTIVE</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SESSION MANAGEMENT (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-1/40 border border-purple-800/40 p-1 relative flex-1 flex flex-col">
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-neon-purple z-10" />
            <div className="p-4 flex-1 flex flex-col">
              <SessionEmbeddingManager
                history={sessionHistory}
                onStore={handleStoreEmbedding}
                onClear={handleClearSessions}
                error={error}
              />
            </div>
          </div>
        </div>

      </div>

      {/* SYSTEM STATUS FOOTER */}
      <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-purple-600 tracking-[0.3em] border-t border-purple-800/20 pt-4 uppercase">
        <div className="flex gap-8">
          <span>COORDS: [34.0522, -118.2437]</span>
          <span>IDENT_PROTO: ARC_V2</span>
          <span>BUFFER: CACHE_SECURE</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="animate-pulse">S Y S T E M _ O N L I N E</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 bg-neon-purple ${i % 2 === 0 ? 'opacity-20' : 'opacity-100'}`} />)}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Analytics
