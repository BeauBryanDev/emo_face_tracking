import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const EntropyTrendChart = ({ data }) => {

  const formatted = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    entropy: d.entropy
  }))

  return (

    <div className="h-40 w-full">

      <ResponsiveContainer>

        <LineChart data={formatted}>

          <XAxis
            dataKey="time"
            stroke="#a855f7"
            tick={{fontSize:10}}
          />

          <YAxis stroke="#a855f7" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="entropy"
            stroke="#cc44ff"
            strokeWidth={2}
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  )
}

export default EntropyTrendChart
