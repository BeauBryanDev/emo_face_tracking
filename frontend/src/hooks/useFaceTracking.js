import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStreamUrl } from '../api/inference'
import { INFERENCE_FRAME } from '../config/inference'


export const useFaceTracking = () => {
  const { token } = useAuth()

  const [results, setResults] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [videoReady, setVideoReady] = useState(false)

  const videoRef = useRef(null)
  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(document.createElement('canvas'))
  const waitingRef = useRef(false)
  const mountedRef = useRef(true)
  const latestResultRef = useRef(null)
  const hasPendingResultRef = useRef(false)


  const safeSet = useCallback((setter, value) => {
    if (!mountedRef.current) return
    setter(value)
  }, [])

  const stopCamera = useCallback(() => {
    const video = videoRef.current
    if (video) {
      video.oncanplay = null
      video.onloadedmetadata = null
      video.onplaying = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (video && video.srcObject) {
      video.srcObject = null
    }
    safeSet(setVideoReady, false)
  }, [safeSet])

  const startCamera = useCallback(async () => {
    try {
      safeSet(setError, null)
      safeSet(setVideoReady, false)
      waitingRef.current = false

      // Always reset previous stream before requesting a new one.
      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 10, max: 10 } },
      })

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      const video = videoRef.current
      if (!video) return

      const markReady = () => safeSet(setVideoReady, true)
      video.onloadedmetadata = markReady
      video.oncanplay = markReady
      video.onplaying = markReady
      video.srcObject = stream
      await video.play().catch(() => {
        // Browser autoplay constraints can reject this promise; video may still play.
      })
      if (video.readyState >= 2) {
        safeSet(setVideoReady, true)
      }
    } catch (err) {
      console.error('Camera error:', err)
      safeSet(setError, 'CAMERA ACCESS DENIED. CHECK BROWSER PERMISSIONS.')
    }
  }, [safeSet, stopCamera])

  useEffect(() => {

    mountedRef.current = true

    return () => {

      mountedRef.current = false
      stopCamera()

      const ws = wsRef.current

      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        
        ws.close()
      }
      wsRef.current = null
    }
  }, [stopCamera])

  // WebSocket connection lifecycle.
  useEffect(() => {
    if (!token) {
      safeSet(setIsConnected, false)
      return
    }

    const ws = new WebSocket(getStreamUrl(token))
    wsRef.current = ws
    let cancelled = false

    ws.onopen = () => {
      if (cancelled) return
      safeSet(setIsConnected, true)
      safeSet(setError, null)
    }

    ws.onmessage = (event) => {
      if (cancelled) return
      waitingRef.current = false
      try {
        latestResultRef.current = JSON.parse(event.data)
        hasPendingResultRef.current = true
      } catch {
        safeSet(setError, 'INVALID STREAM PAYLOAD')
      }
    }

    ws.onclose = (event) => {
      if (cancelled) return
      safeSet(setIsConnected, false)
      waitingRef.current = false
      if (event.code === 1008) {
        safeSet(setError, 'AUTHENTICATION FAILED. TOKEN INVALID OR EXPIRED.')
      }
    }

    ws.onerror = () => {
      if (cancelled) return
      safeSet(setError, 'WEBSOCKET CONNECTION ERROR. BACKEND UNREACHABLE.')
    }

    return () => {
      cancelled = true
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    }
  }, [token, safeSet])

  // Throttle UI commits to reduce full component tree re-renders.
  useEffect(() => {
    const UI_COMMIT_MS = 150
    const uiTimer = setInterval(() => {
      if (!hasPendingResultRef.current) return
      hasPendingResultRef.current = false
      safeSet(setResults, latestResultRef.current)
    }, UI_COMMIT_MS)

    return () => clearInterval(uiTimer)
  }, [safeSet])

  // Frame capture loop.
  useEffect(() => {
    if (!isConnected || !videoReady) return

    const intervalMs = INFERENCE_FRAME.intervalMs
    let encoding = false
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const interval = setInterval(() => {
      if (waitingRef.current || encoding) return

      const ws = wsRef.current
      const video = videoRef.current

      if (
        ws &&
        ws.readyState === WebSocket.OPEN &&
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        const TARGET_WIDTH = INFERENCE_FRAME.width
        const TARGET_HEIGHT = INFERENCE_FRAME.height


        canvas.width = TARGET_WIDTH
        canvas.height = TARGET_HEIGHT

        ctx.drawImage(video, 0, 0, TARGET_WIDTH, TARGET_HEIGHT)

        encoding = true

        canvas.toBlob((blob) => {

          encoding = false

          if (!blob) return

          if (ws.readyState !== WebSocket.OPEN) return

          waitingRef.current = true

          ws.send(blob)

        }, 'image/jpeg', INFERENCE_FRAME.jpegQuality)

      }

    }, intervalMs)

    return () => {
      clearInterval(interval)
      waitingRef.current = false
      encoding = false
    }

  }, [isConnected, videoReady])

  return {
    videoRef,
    results,
    isConnected,
    error,
    videoReady,
    startCamera,
    stopCamera,
  }
}
