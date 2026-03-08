import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const EmotionalTrajectory = ({ data }) => {

  return (

  <div className="h-60">

    <ResponsiveContainer>

      <LineChart data={data}>

        <XAxis dataKey="time"/>

        <YAxis domain={[-1,1]}/>

        <Tooltip/>

        <Line
          dataKey="valence"
          stroke="#00ffaa"
          dot={false}
        />

        <Line
          dataKey="arousal"
          stroke="#ff44ff"
          dot={false}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>
  )
}

export default EmotionalTrajectory
