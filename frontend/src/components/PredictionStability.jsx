const PredictionStability = ({ data }) => {

  const confidences = data.map(d=>d.confidence)

  const mean =
    confidences.reduce((a,b)=>a+b,0)/confidences.length

  const variance =
    confidences.reduce((a,b)=>a+(b-mean)**2,0)/confidences.length

  const stability = (1-variance)*100

  return (

    <div className="flex flex-col items-center justify-center h-32">

      <div className="text-xs text-purple-400">
        PREDICTION STABILITY
      </div>

      <div className="text-3xl text-neon-purple font-bold">
        {stability.toFixed(1)}%
      </div>

    </div>

  )
}

export default PredictionStability
