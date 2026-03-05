import { useState, useRef, useEffect, useCallback } from 'react'
import { ShieldCheck, ShieldAlert, Camera, X, Scan } from 'lucide-react'
import { verifyBiometrics } from '../api/users'

const BiometricVerifyModal = ({ onVerified, onCancel }) => {
  const [phase,      setPhase]      = useState('PREVIEW')  // PREVIEW | VERIFYING | SUCCESS | FAILED
  const [similarity, setSimilarity] = useState(null)
  const [errorMsg,   setErrorMsg]   = useState(null)
  const [camReady,   setCamReady]   = useState(false)

  const videoRef  = useRef(null)
  const canvasRef = useRef(document.createElement('canvas'))
  const streamRef = useRef(null)

  // Open camera on mount
  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
    }).then((stream) => {
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.oncanplay = () => setCamReady(true)
      }
    }).catch(() => {
      if (!cancelled) setErrorMsg('CAMERA ACCESS DENIED.')
    })
    return () => {
      cancelled = true
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const captureAndVerify = async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return

    setPhase('VERIFYING')
    setErrorMsg(null)

    const canvas  = canvasRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setPhase('FAILED')
        setErrorMsg('FAILED TO CAPTURE FRAME.')
        return
      }

      const imageFile = new File([blob], 'verify_capture.jpg', { type: 'image/jpeg' })

      try {
        const result = await verifyBiometrics(imageFile)
        setSimilarity(result.similarity)

        if (result.is_match) {
          setPhase('SUCCESS')
          // Auto-proceed after 1.5s so user sees the green confirmation
          setTimeout(() => onVerified(), 1500)
        } else {
          setPhase('FAILED')
          setErrorMsg(`IDENTITY NOT CONFIRMED. SIMILARITY: ${(result.similarity * 100).toFixed(1)}%`)
        }
      } catch (err) {
        setPhase('FAILED')
        const detail = err.response?.data?.detail || 'VERIFICATION FAILED.'
        setErrorMsg(`ERROR: ${detail}`)
      }
    }, 'image/jpeg', 0.92)
  }

  const retry = () => {
    setPhase('PREVIEW')
    setErrorMsg(null)
    setSimilarity(null)
  }

  // Glow color based on phase
  const glowColor = {
    PREVIEW:    'rgba(170,0,255,0.4)',
    VERIFYING:  'rgba(170,0,255,0.6)',
    SUCCESS:    'rgba(0,255,136,0.8)',
    FAILED:     'rgba(255,0,80,0.8)',
  }[phase]

  const borderColor = {
    PREVIEW:    'rgba(170,0,255,0.35)',
    VERIFYING:  'rgba(170,0,255,0.6)',
    SUCCESS:    'rgba(0,255,136,0.5)',
    FAILED:     'rgba(255,0,80,0.5)',
  }[phase]

  return (
    // Backdrop
    <div style={{
      position:        'fixed',
      inset:           0,
      background:      'rgba(5,0,12,0.92)',
      backdropFilter:  'blur(6px)',
      zIndex:          1000,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '1rem',
    }}>
      {/* Modal container */}
      <div style={{
        width:        '100%',
        maxWidth:     480,
        background:   'rgba(10,0,20,0.97)',
        border:       `1px solid ${borderColor}`,
        boxShadow:    `0 0 40px ${glowColor}, 0 0 80px ${glowColor.replace('0.4', '0.15')}`,
        position:     'relative',
        transition:   'border-color 0.4s, box-shadow 0.4s',
        overflow:     'hidden',
      }}>

        {/* Top scanline decoration */}
        <div style={{
          position:   'absolute',
          top:        0, left: 0, right: 0,
          height:     2,
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
          transition: 'background 0.4s',
        }} />

        {/* Corner decorations */}
        {[
          { top: 0, left: 0,   borderTop: true,    borderLeft: true  },
          { top: 0, right: 0,  borderTop: true,    borderRight: true },
          { bottom: 0, left: 0,  borderBottom: true, borderLeft: true  },
          { bottom: 0, right: 0, borderBottom: true, borderRight: true },
        ].map((pos, i) => (
          <div key={i} style={{
            position:     'absolute',
            width: 16, height: 16,
            ...pos,
            borderTop:    pos.borderTop    ? `1px solid ${glowColor}` : 'none',
            borderLeft:   pos.borderLeft   ? `1px solid ${glowColor}` : 'none',
            borderBottom: pos.borderBottom ? `1px solid ${glowColor}` : 'none',
            borderRight:  pos.borderRight  ? `1px solid ${glowColor}` : 'none',
            transition:   'border-color 0.4s',
          }} />
        ))}

        <div style={{ padding: '1.5rem' }}>

          {/* Header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   '1.25rem',
          }}>
            <div style={{
              fontFamily:    'Orbitron, monospace',
              fontSize:      '0.7rem',
              fontWeight:    700,
              letterSpacing: '0.2em',
              color:         '#f0ccff',
              display:       'flex',
              alignItems:    'center',
              gap:           '0.5rem',
            }}>
              <Scan size={14} color="#bf00ff" />
              BIOMETRIC VERIFICATION
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                color:      'rgba(170,0,255,0.4)',
                padding:    '0.25rem',
                display:    'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Instruction text */}
          <p style={{
            fontFamily:    'Share Tech Mono, monospace',
            fontSize:      '0.62rem',
            letterSpacing: '0.08em',
            color:         'rgba(170,0,255,0.5)',
            marginBottom:  '1rem',
            lineHeight:    1.6,
          }}>
            IDENTITY CONFIRMATION REQUIRED TO SAVE PROFILE CHANGES.
            POSITION YOUR FACE WITHIN THE FRAME AND PRESS VERIFY.
          </p>

          {/* Webcam preview */}
          <div style={{
            position:   'relative',
            border:     `1px solid ${borderColor}`,
            overflow:   'hidden',
            background: '#050010',
            marginBottom: '1rem',
            transition: 'border-color 0.4s',
            aspectRatio: '4/3',
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width:   '100%',
                height:  '100%',
                display: 'block',
                objectFit: 'cover',
                filter:  phase === 'SUCCESS' ? 'brightness(1.1) saturate(1.2)' : 'none',
                transition: 'filter 0.4s',
              }}
            />

            {/* Scanline overlay */}
            <div style={{
              position:        'absolute',
              inset:           0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(170,0,255,0.025) 2px, rgba(170,0,255,0.025) 4px)',
              pointerEvents:   'none',
            }} />

            {/* Phase overlay */}
            {phase === 'VERIFYING' && (
              <div style={{
                position:       'absolute',
                inset:          0,
                background:     'rgba(45,0,87,0.5)',
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '0.75rem',
              }}>
                <div style={{
                  width:        40, height: 40,
                  border:       '2px solid rgba(170,0,255,0.3)',
                  borderTop:    '2px solid #bf00ff',
                  borderRadius: '50%',
                  animation:    'spin 0.8s linear infinite',
                }} />
                <span style={{
                  fontFamily:    'Share Tech Mono, monospace',
                  fontSize:      '0.62rem',
                  letterSpacing: '0.15em',
                  color:         '#cc44ff',
                }}>
                  ANALYZING...
                </span>
              </div>
            )}

            {phase === 'SUCCESS' && (
              <div style={{
                position:       'absolute',
                inset:          0,
                background:     'rgba(0,30,15,0.7)',
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '0.75rem',
              }}>
                <ShieldCheck size={48} color="#00ff88"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(0,255,136,0.8))' }} />
                <span style={{
                  fontFamily:    'Orbitron, monospace',
                  fontSize:      '0.7rem',
                  fontWeight:    700,
                  letterSpacing: '0.2em',
                  color:         '#00ff88',
                  textShadow:    '0 0 16px rgba(0,255,136,0.8)',
                }}>
                  IDENTITY CONFIRMED
                </span>
                {similarity !== null && (
                  <span style={{
                    fontFamily:    'Share Tech Mono, monospace',
                    fontSize:      '0.58rem',
                    color:         'rgba(0,255,136,0.6)',
                    letterSpacing: '0.1em',
                  }}>
                    SIMILARITY: {(similarity * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            )}

            {phase === 'FAILED' && (
              <div style={{
                position:       'absolute',
                inset:          0,
                background:     'rgba(30,0,10,0.7)',
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '0.75rem',
              }}>
                <ShieldAlert size={48} color="#ff4466"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(255,0,80,0.8))' }} />
                <span style={{
                  fontFamily:    'Orbitron, monospace',
                  fontSize:      '0.7rem',
                  fontWeight:    700,
                  letterSpacing: '0.15em',
                  color:         '#ff4466',
                  textShadow:    '0 0 16px rgba(255,0,80,0.8)',
                  textAlign:     'center',
                }}>
                  VERIFICATION FAILED
                </span>
              </div>
            )}

            {/* Targeting reticle - only in PREVIEW */}
            {phase === 'PREVIEW' && (
              <>
                {/* Center crosshair */}
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 120, height: 120,
                  border: '1px solid rgba(170,0,255,0.2)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80, height: 80,
                  border: '1px solid rgba(170,0,255,0.15)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }} />
              </>
            )}
          </div>

          {/* Error message */}
          {errorMsg && (
            <div style={{
              marginBottom:  '1rem',
              padding:       '0.5rem 0.75rem',
              background:    'rgba(255,0,80,0.06)',
              border:        '1px solid rgba(255,0,80,0.25)',
              fontFamily:    'Share Tech Mono, monospace',
              fontSize:      '0.6rem',
              letterSpacing: '0.08em',
              color:         '#ff4466',
              lineHeight:    1.5,
            }}>
              {errorMsg}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {(phase === 'PREVIEW' || phase === 'FAILED') && (
              <>
                <button
                  onClick={phase === 'FAILED' ? retry : captureAndVerify}
                  disabled={!camReady && phase === 'PREVIEW'}
                  style={{
                    flex:          1,
                    padding:       '0.75rem',
                    background:    'linear-gradient(135deg, rgba(102,0,179,0.7), rgba(170,0,255,0.7))',
                    border:        '1px solid rgba(170,0,255,0.6)',
                    color:         '#f0ccff',
                    fontFamily:    'Orbitron, monospace',
                    fontSize:      '0.6rem',
                    fontWeight:    700,
                    letterSpacing: '0.2em',
                    cursor:        'pointer',
                    display:       'flex',
                    alignItems:    'center',
                    justifyContent:'center',
                    gap:           '0.5rem',
                    transition:    'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(170,0,255,0.35)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <Camera size={13} />
                  {phase === 'FAILED' ? 'TRY AGAIN' : 'VERIFY IDENTITY'}
                </button>
                <button
                  onClick={onCancel}
                  style={{
                    padding:       '0.75rem 1rem',
                    background:    'transparent',
                    border:        '1px solid rgba(170,0,255,0.2)',
                    color:         'rgba(170,0,255,0.5)',
                    fontFamily:    'Orbitron, monospace',
                    fontSize:      '0.6rem',
                    fontWeight:    700,
                    letterSpacing: '0.15em',
                    cursor:        'pointer',
                  }}
                >
                  CANCEL
                </button>
              </>
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default BiometricVerifyModal
