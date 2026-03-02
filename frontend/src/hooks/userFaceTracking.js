import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStreamUrl } from '../api/inference';

export const useFaceTracking = () => {
  const { token } = useAuth();
  const [results, setResults] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas')); // Canvas oculto para procesar frames

  // 1. Inicializar Cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 15 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Cannot access camera.");
      console.error(err);
    }
  };

  // 2. Conexión WebSocket
  useEffect(() => {
    if (!token) return;

    // URL del backend (ajusta según tu .env)
    const wsUrl = getStreamUrl(token);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => setIsConnected(true);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults(data);
    };
    wsRef.current.onclose = () => setIsConnected(false);
    wsRef.current.onerror = () => setError("Error in WebSocket connection.");

    return () => wsRef.current?.close();
  }, [token]);

  // 3. Captura y Envío de Frames (Loop de Inferencia)
  const sendFrame = useCallback(() => {
    if (!isConnected || !videoRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a Base64 (JPEG para menor ancho de banda)
    const base64Image = canvas.toDataURL('image/jpeg', 0.7);
    
    wsRef.current.send(JSON.stringify({ image: base64Image }));
  }, [isConnected]);

  // Loop de ejecución (15 FPS aprox)
  useEffect(() => {
    const interval = setInterval(sendFrame, 100); // 100ms = 10 FPS (ideal para no saturar el CPU)
    return () => clearInterval(interval);
  }, [sendFrame]);

  return {
    videoRef,
    results,
    isConnected,
    error,
    startCamera
  };
};
