const EmotionVectorField = ({ dynamics }) => {

  if(!dynamics || dynamics.length === 0) return null

  const last = dynamics[dynamics.length-1]

  const dx = Math.cos(last.direction) * last.velocity
  const dy = Math.sin(last.direction) * last.velocity

  return (

  <div className="text-sm font-mono">

    <div>Velocity : {last.velocity.toFixed(3)}</div>
    <div>Direction : {last.direction.toFixed(2)} rad</div>
    <div>Vector : ({dx.toFixed(3)} , {dy.toFixed(3)})</div>

  </div>

  )
}

export default EmotionVectorField
