export function computeEmotionDynamics(points)
{
  if(!points || points.length < 2) return []

  const baseline = {
    valence: points.reduce((a,b)=>a+b.valence,0)/points.length,
    arousal: points.reduce((a,b)=>a+b.arousal,0)/points.length
  }

  const result = []

  for(let i=1;i<points.length;i++)
  {
    const p1 = points[i-1]
    const p2 = points[i]

    const dx = p2.valence - p1.valence
    const dy = p2.arousal - p1.arousal

    const velocity = Math.sqrt(dx*dx + dy*dy)

    const direction = Math.atan2(dy,dx)

    const drift = Math.sqrt(
      (p2.valence-baseline.valence)**2 +
      (p2.arousal-baseline.arousal)**2
    )

    result.push({
      ...p2,
      velocity,
      direction,
      drift
    })
  }

  return result
}
