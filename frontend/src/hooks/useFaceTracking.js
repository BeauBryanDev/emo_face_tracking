
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStreamUrl } from '../api/inference'

export const useFaceTracking = () => {
  const { token } = useAuth()

  const [results,     setResults]     = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error,       setError]       = useState(null)
  const [videoReady,  setVideoReady]  = useState(false)
  const [fps,         setFps]         = useState(0)

  const videoRef        = useRef(null)
  const wsRef           = useRef(null)
  const canvasRef       = useRef(document.createElement('canvas'))
  const connectingRef   = useRef(false)
  // Request-response control: true = waiting for backend response, false = ready to send
  const waitingRef      = useRef(false)
  // RAF handle for the inference loop
  const rafRef          = useRef(null)
  // FPS counter
  const fpsCounterRef   = useRef({ frames: 0, lastTime: performance.now() })

  // ---------------------------------------------------------------------------
  // 1. CAMERA
  // ---------------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 15 } },
      })
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      videoRef.current.oncanplay = () => setVideoReady(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError('CAMERA ACCESS DENIED. CHECK BROWSER PERMISSIONS.')
    }
  }, [])

  // ---------------------------------------------------------------------------
  // 2. WEBSOCKET - StrictMode safe
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!token) { setIsConnected(false); return }
    if (connectingRef.current) return
    connectingRef.current = true

    const ws = new WebSocket(getStreamUrl(token))
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
      waitingRef.current = false
    }

    ws.onmessage = (event) => {
      // Mark as ready to send next frame BEFORE updating state
      waitingRef.current = false
      try {
        const data = JSON.parse(event.data)
        setResults(data)

        // FPS counter
        const counter = fpsCounterRef.current
        counter.frames++
        const now = performance.now()
        if (now - counter.lastTime >= 1000) {
          setFps(counter.frames)
          counter.frames  = 0
          counter.lastTime = now
        }
      } catch {
        setError('INVALID STREAM PAYLOAD')
      }
    }

    ws.onclose = (event) => {
      setIsConnected(false)
      connectingRef.current = false
      waitingRef.current    = false
      if (event.code === 1008) {
        setError('AUTHENTICATION FAILED. TOKEN INVALID OR EXPIRED.')
      }
    }

    ws.onerror = () => {
      setError('WEBSOCKET CONNECTION ERROR. BACKEND UNREACHABLE.')
      connectingRef.current = false
      waitingRef.current    = false
    }

    return () => {
      connectingRef.current = false
      waitingRef.current    = false
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close()
      }
      if (wsRef.current === ws) wsRef.current = null
    }
  }, [token])

  // ---------------------------------------------------------------------------
  // 3. FRAME CAPTURE
  // Returns false if frame could not be captured or sent.
  // ---------------------------------------------------------------------------
  const sendFrame = useCallback(() => {
    const ws    = wsRef.current
    const video = videoRef.current

    if (!ws || ws.readyState !== WebSocket.OPEN) return
    if (!video || video.readyState < 2)           return
    if (video.videoWidth === 0 || video.videoHeight === 0) return
    if (waitingRef.current) return   // still waiting for previous response

    const canvas  = canvasRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Mark as waiting BEFORE sending to avoid race condition
    waitingRef.current = true
    ws.send(JSON.stringify({
      image: canvas.toDataURL('image/jpeg', 0.7),
    }))
  }, [])

  // ---------------------------------------------------------------------------
  // 4. INFERENCE LOOP using requestAnimationFrame
  // RAF throttled to max 15 FPS. Actual throughput is determined by the
  // backend response time (request-response pattern).
  // Using RAF instead of setInterval avoids running when tab is hidden,
  // which was a secondary cause of CPU spikes.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isConnected || !videoReady) return

    let lastFrameTime = 0
    const FRAME_INTERVAL = 1000 / 15   // max 15 FPS

    const loop = (timestamp) => {
      if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
        sendFrame()
        lastFrameTime = timestamp
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isConnected, videoReady, sendFrame])

  // ---------------------------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      const video = videoRef.current
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((t) => t.stop())
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return {
    videoRef,
    results,
    isConnected,
    error,
    videoReady,
    fps,
    startCamera,
  }
}



