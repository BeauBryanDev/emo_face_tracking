const EmotionDrift = ({ dynamics }) => {
  if (!dynamics || dynamics.length === 0) return null

  const first = dynamics[0]
  const last = dynamics[dynamics.length - 1]

  const driftValence = last.valence - first.valence
  const driftArousal = last.arousal - first.arousal
  const driftMagnitude = Math.sqrt((driftValence * driftValence) + (driftArousal * driftArousal))

  return (
    <div className="flex flex-col items-center justify-center h-36">
      <div className="text-xs text-purple-400">EMOTIONAL DRIFT</div>
      <div className="text-3xl text-purple-300 font-bold">{driftMagnitude.toFixed(3)}</div>
    </div>
  )
}

export default EmotionDrift
