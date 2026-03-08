const EmotionTurbulence = ({ data }) => {

  if(!data || data.length === 0) return null

  const meanV =
    data.reduce((a,b)=>a+b.valence,0)/data.length

  const meanA =
    data.reduce((a,b)=>a+b.arousal,0)/data.length

  const variance =
    data.reduce((sum,p)=>{

      const dv = p.valence-meanV
      const da = p.arousal-meanA

      return sum + (dv*dv + da*da)

    },0) / data.length

  return (

  <div className="flex flex-col items-center justify-center h-36">

    <div className="text-xs text-purple-400">
      EMOTIONAL TURBULENCE
    </div>

    <div className="text-3xl text-purple-300 font-bold">
      {variance.toFixed(3)}
    </div>

  </div>

  )
}

export default EmotionTurbulence
