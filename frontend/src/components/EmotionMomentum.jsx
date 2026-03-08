const EmotionMomentum = ({ dynamics }) => {

  if(!dynamics || dynamics.length === 0) return null

  const avgVelocity =
    dynamics.reduce((a,b)=>a+b.velocity,0)/dynamics.length

  return (

  <div className="flex flex-col items-center justify-center h-36">

    <div className="text-xs text-purple-400">
      EMOTIONAL MOMENTUM
    </div>

    <div className="text-3xl text-purple-300 font-bold">
      {avgVelocity.toFixed(3)}
    </div>

  </div>

  )
}

export default EmotionMomentum
