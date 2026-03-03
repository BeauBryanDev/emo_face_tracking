import React, { useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// Componente de Tooltip personalizado estilo terminal Cyberpunk
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-purple-950/90 border border-neon-purple p-2 shadow-neon-sm font-mono text-xs">
        <p className="text-purple-200 uppercase tracking-wider border-b border-purple-800 pb-1 mb-1">
          {payload[0].payload.subject}
        </p>
        <p className="text-neon-purple font-bold">
          CONFIDENCE: {(payload[0].value * 100).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const EmotionRadar = ({ emotionScores }) => {
  // Memoizamos la transformación de datos para evitar re-renderizados costosos
  // Convertimos el diccionario { "Happiness": 0.9, ... } a un array compatible con Recharts
  const data = useMemo(() => {
    if (!emotionScores || Object.keys(emotionScores).length === 0) {
      // Estado de espera (radar vacío) si no hay datos del WebSocket
      return [
        { subject: 'ANG', A: 0, fullMark: 1 }, { subject: 'CON', A: 0, fullMark: 1 },
        { subject: 'DIS', A: 0, fullMark: 1 }, { subject: 'FEA', A: 0, fullMark: 1 },
        { subject: 'HAP', A: 0, fullMark: 1 }, { subject: 'NEU', A: 0, fullMark: 1 },
        { subject: 'SAD', A: 0, fullMark: 1 }, { subject: 'SUR', A: 0, fullMark: 1 },
      ];
    }

    // Acrónimos tácticos para mantener el diseño del radar limpio y militar
    const labels = {
      "Anger": "ANG", "Contempt": "CON", "Disgust": "DIS", "Fear": "FEA",
      "Happiness": "HAP", "Neutral": "NEU", "Sadness": "SAD", "Surprise": "SUR"
    };

    return Object.keys(emotionScores).map(key => ({
      subject: labels[key] || key.substring(0, 3).toUpperCase(),
      A: emotionScores[key], // La probabilidad real de 0.0 a 1.0
      fullMark: 1,
    }));
  }, [emotionScores]);

  return (
    <div className="w-full h-full min-h-[250px] relative flex flex-col items-center justify-center bg-surface-1 border border-purple-800 shadow-[inset_0_0_30px_rgba(74,0,128,0.3)]">
      
      {/* Etiqueta superior del módulo */}
      <div className="absolute top-2 left-3 text-purple-400 font-mono text-[10px] tracking-widest z-10">
        SYS.RADAR.MULTIVARIATE
      </div>

      <ResponsiveContainer width="100%" aspect={1.4}>  {/* before height was 100% */}
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          
          {/* Definición del gradiente SVG para el brillo tridimensional */}
          <defs>
            <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#bf00ff" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#4a0080" stopOpacity={0.2} />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* La telaraña polar (grilla del radar) */}
          <PolarGrid stroke="#4a0080" strokeDasharray="3 3" />
          
          {/* Ejes radiales (Texto) */}
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#aa00ff', fontSize: 10, fontFamily: 'Share Tech Mono', fontWeight: 'bold' }} 
          />
          
          {/* Eje de magnitud (invisible, solo para forzar la escala de 0 a 1) */}
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#aa00ff', strokeWidth: 1 }} />
          
          {/* El polígono de datos */}
          <Radar
            name="Emotions"
            dataKey="A"
            stroke="#bf00ff"
            strokeWidth={2}
            fill="url(#neonGlow)"
            fillOpacity={1}
            filter="url(#glow)" /* Aplica el filtro de neón al polígono */
            isAnimationActive={true}
            animationDuration={300} /* Animación rápida para sentir el Real-Time */
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionRadar;
