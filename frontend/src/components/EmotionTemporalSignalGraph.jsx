import React, { useState, useEffect, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"


// Affective Computing + Behavioral Signal Processing
export default function EmotionTemporalSignalGraph({ data }) {

  const [history, setHistory] = useState([])

  useEffect(() => {

    if (!data || data.happy_score === undefined) return

    setHistory(prev => {

      const next = [
        ...prev,
        {
          time: Date.now(),
          happy: data.happy_score
        }
      ]

      if (next.length > 60) next.shift()

      return next
    })

  }, [data])


  const stability = useMemo(() => {

    if (history.length < 5) return 0

    const values = history.map(d => d.happy)

    const mean =
      values.reduce((a,b)=>a+b,0) / values.length

    const variance =
      values.reduce((sum,v)=> sum + Math.pow(v-mean,2),0) / values.length

    const std = Math.sqrt(variance)

    const stabilityScore = Math.max(0, 1 - std)

    return stabilityScore

  }, [history])


  const container = {
    background: "rgba(10,10,25,0.8)",
    border: "1px solid #8a2be2",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 0 20px rgba(138,43,226,0.35)"
  }

  const title = {
    color: "#00ffff",
    fontSize: "14px",
    marginBottom: "4px",
    fontFamily: "monospace"
  }

  const stabilityStyle = {
    color: "#8affff",
    fontSize: "12px",
    marginBottom: "10px",
    fontFamily: "monospace"
  }

// TODO : add stability indicator and graph smoothing
// happy_smoothed = α * current + (1-α) * prev



  return (
    <div style={container}>

      <div style={title}>
        Happy Score Temporal Signal
      </div>

      <div style={stabilityStyle}>
        Happiness Stability Index: {stability.toFixed(2)}
      </div>

      <ResponsiveContainer width="100%" height={200}>

        <LineChart data={history}>

          <CartesianGrid stroke="rgba(255,255,255,0.05)" />

          <XAxis
            dataKey="time"
            tick={false}
          />

          <YAxis
            domain={[0,1]}
            tick={{fill:"#aaa", fontSize:10}}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="happy"
            stroke="#00ffff"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  )
}
