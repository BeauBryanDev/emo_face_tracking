const EmotionIntensityMeter = ({ valence, arousal }) => {
/*Calculates the emotional intensity based on valence and arousal using the formula: 
intensity = sqrt(valence^2 + arousal^2)
*/
  const intensity = Math.sqrt(valence*valence + arousal*arousal)

  return (

  <div className="flex flex-col items-center justify-center h-40">

    <div className="text-xs text-purple-400">
      EMOTIONAL INTENSITY
    </div>

    <div className="text-3xl text-neon-purple font-bold">
      {intensity.toFixed(2)}
    </div>

  </div>
  )
}

export default EmotionIntensityMeter
