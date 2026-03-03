
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStreamUrl } from '../api/inference'

export const useFaceTracking = () => {
  const { token } = useAuth()

  const [results,     setResults]     = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error,       setError]       = useState(null)
  const [videoReady,  setVideoReady]  = useState(false)

  const videoRef      = useRef(null)
  const wsRef         = useRef(null)
  const canvasRef     = useRef(document.createElement('canvas'))
  const intervalRef   = useRef(null)
  // Guard against StrictMode double-mount creating two WebSocket connections
  const connectingRef = useRef(false)

  // ---------------------------------------------------------------------------
  // 1. CAMERA INITIALIZATION
  // ---------------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 15 } },
      })

      if (!videoRef.current) return

      videoRef.current.srcObject = stream

      // Mark video as ready only when it has real pixel dimensions
      videoRef.current.oncanplay = () => {
        setVideoReady(true)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('CAMERA ACCESS DENIED. CHECK BROWSER PERMISSIONS.')
    }
  }, [])

  // ---------------------------------------------------------------------------
  // 2. WEBSOCKET CONNECTION - StrictMode safe
  // In React dev StrictMode, effects run twice. The connectingRef prevents
  // the second mount from opening a second connection before the first closes.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!token) {
      setIsConnected(false)
      return
    }

    // If a connection attempt is already in progress skip this mount cycle
    if (connectingRef.current) return
    connectingRef.current = true

    const wsUrl = getStreamUrl(token)
    const ws    = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setResults(data)
      } catch {
        setError('INVALID STREAM PAYLOAD')
      }
    }

    ws.onclose = (event) => {
      setIsConnected(false)
      connectingRef.current = false
      if (event.code === 1008) {
        setError('AUTHENTICATION FAILED. TOKEN INVALID OR EXPIRED.')
      }
    }

    ws.onerror = () => {
      setError('WEBSOCKET CONNECTION ERROR. BACKEND UNREACHABLE.')
      connectingRef.current = false
    }

    return () => {
      connectingRef.current = false
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
  // 3. FRAME CAPTURE AND SEND
  // ---------------------------------------------------------------------------
  const sendFrame = useCallback(() => {
    const ws    = wsRef.current
    const video = videoRef.current

    if (!ws || ws.readyState !== WebSocket.OPEN) return
    if (!video || video.readyState < 2)          return
    if (video.videoWidth === 0 || video.videoHeight === 0) return

    const canvas  = canvasRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const base64Image = canvas.toDataURL('image/jpeg', 0.7)
    ws.send(JSON.stringify({ image: base64Image }))
  }, [])

  // ---------------------------------------------------------------------------
  // 4. INFERENCE LOOP - starts only when WS connected AND video ready
  // 100ms = 10 FPS, matches CPU inference speed with 4 ONNX models
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isConnected || !videoReady) return

    intervalRef.current = setInterval(sendFrame, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isConnected, videoReady, sendFrame])

  // ---------------------------------------------------------------------------
  // CLEANUP on unmount - stop camera tracks
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      const video = videoRef.current
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((t) => t.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    videoRef,
    results,
    isConnected,
    error,
    videoReady,
    startCamera,
  }
}
