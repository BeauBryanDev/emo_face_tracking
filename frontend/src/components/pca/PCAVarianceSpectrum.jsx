import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function PCAVarianceSpectrum({ data }) {

  if (!data?.explained_variance) return null

  const chartData = data.explained_variance.map((v,i)=>({
    pc:`PC${i+1}`,
    variance:v
  }))

  return (

    <ResponsiveContainer width="100%" height={240}>

      <BarChart data={chartData}>

        <XAxis dataKey="pc" stroke="#c084fc"/>

        <YAxis stroke="#c084fc"/>

        <Tooltip/>

        <Bar
          dataKey="variance"
          fill="#9333ea"
        />

      </BarChart>

    </ResponsiveContainer>

  )
}

