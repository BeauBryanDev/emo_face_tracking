import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function PCACumulativeVariance({ data }) {

  if (!data?.cumulative_variance) return null

  const chartData = data.cumulative_variance.map((v,i)=>({
    component:`PC${i+1}`,
    cumulative:v
  }))

  return (

    <ResponsiveContainer width="100%" height={240}>

      <LineChart data={chartData}>

        <XAxis dataKey="component"/>
        <YAxis/>

        <Tooltip/>

        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#c084fc"
        />

      </LineChart>

    </ResponsiveContainer>

  )
}
