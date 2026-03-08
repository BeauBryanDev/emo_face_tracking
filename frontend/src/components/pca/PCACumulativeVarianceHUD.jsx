import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function PCACumulativeVarianceHUD({ data }) {

  if (!data?.cumulative_variance) return null

  const chartData = data.cumulative_variance.map((v,i)=>({

    component:`PC${i+1}`,
    variance: (v * 100)  // convert to percentage & round

  }))

  return (

    <div style={{
      border:"1px solid #9333ea",
      padding:"10px",
      background:"#050510"
    }}>

      <h4 style={{
        color:"#c084fc",
        marginBottom:"6px"
      }}>
        PCA Variance Curve
      </h4>

      <ResponsiveContainer width="100%" height={180}>

        <LineChart data={chartData}>

          <XAxis
            dataKey="component"
            stroke="#c084fc"
          />

          <YAxis
            stroke="#c084fc"
            domain={[0,100]}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="variance"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ r:3 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  )
}
