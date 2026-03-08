import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts"

const EmotionPhaseSpace = ({ dynamics }) => {

  if(!dynamics || dynamics.length === 0) return null

  const trajectory = dynamics.map(p=>({
    valence:p.valence,
    arousal:p.arousal
  }))
  const denseTicks = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]

  return (

  <div className="h-96">

    <ResponsiveContainer>

      <ScatterChart>
        <CartesianGrid stroke="#4b1d6a" strokeOpacity={0.55} strokeDasharray="2 2" />

        <XAxis
          type="number"
          dataKey="valence"
          domain={[-1,1]}
          ticks={denseTicks}
          axisLine={{ stroke: "#2e0f47", strokeWidth: 2 }}
          tickLine={false}
          tick={{ fill: "#b88cff", fontSize: 10 }}
        />

        <YAxis
          type="number"
          dataKey="arousal"
          domain={[-1,1]}
          ticks={denseTicks}
          axisLine={{ stroke: "#2e0f47", strokeWidth: 2 }}
          tickLine={false}
          tick={{ fill: "#b88cff", fontSize: 10 }}
        />

        <ReferenceLine x={0} stroke="#2e0f47" strokeWidth={2} />
        <ReferenceLine y={0} stroke="#2e0f47" strokeWidth={2} />

        <Tooltip/>

        <Scatter
          data={trajectory}
          fill="#cc44ff"
          line
        />

      </ScatterChart>

    </ResponsiveContainer>

  </div>

  )
}

export default EmotionPhaseSpace
