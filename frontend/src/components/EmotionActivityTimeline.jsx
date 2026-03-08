import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const EmotionActivityTimeline = ({ data }) => {

  const formatted = data.map((d,i)=>({
    index:i,
    emotion:d.dominant_emotion
  }))

  return (

    <div className="h-40">

      <ResponsiveContainer>

        <ScatterChart>

          <XAxis dataKey="index" />

          <YAxis dataKey="emotion" type="category" />

          <Tooltip />

          <Scatter
            data={formatted}
            fill="#cc44ff"
          />

        </ScatterChart>

      </ResponsiveContainer>

    </div>

  )
}

export default EmotionActivityTimeline
