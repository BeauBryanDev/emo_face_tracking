const ModelUncertaintyMeter = ({ data }) => {

  const avgConfidence =
    data.reduce((a,b)=>a+b.confidence,0) / data.length

  const uncertainty = 1 - avgConfidence

  const percent = (uncertainty * 100).toFixed(1)

  return (

    <div className="flex flex-col items-center justify-center h-32">

      <div className="text-xs text-purple-400">
        MODEL UNCERTAINTY
      </div>

      <div className="text-3xl font-bold text-neon-purple">
        {percent}%
      </div>

    </div>

  )
}

export default ModelUncertaintyMeter
