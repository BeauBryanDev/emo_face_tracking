import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

const RussellCircumplexChart = ({ data }) => {
//Main Graph for Russell Circumplex Model of Affect
  const denseTicks = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]
  return (

  <div className="h-80 w-full">

    <ResponsiveContainer>

      <ScatterChart>

        <CartesianGrid stroke="#4b1d6a" strokeOpacity={0.55} strokeDasharray="2 2" />

        <XAxis
          type="number"
          dataKey="valence"
          domain={[-1,1]}
          ticks={denseTicks}
          name="Valence"
          axisLine={{ stroke: "#2e0f47", strokeWidth: 2 }}
          tickLine={false}
          tick={{ fill: "#b88cff", fontSize: 10 }}
        />

        <YAxis
          type="number"
          dataKey="arousal"
          domain={[-1,1]}
          ticks={denseTicks}
          name="Arousal"
          axisLine={{ stroke: "#2e0f47", strokeWidth: 2 }}
          tickLine={false}
          tick={{ fill: "#b88cff", fontSize: 10 }}
        />

        <ReferenceLine x={0} stroke="#2e0f47" strokeWidth={2} />
        <ReferenceLine y={0} stroke="#2e0f47" strokeWidth={2} />

        <Tooltip/>

        <Scatter
          data={data}
          fill="#cc44ff"
          line
        />

      </ScatterChart>

    </ResponsiveContainer>

  </div>
  )
}

export default RussellCircumplexChart
