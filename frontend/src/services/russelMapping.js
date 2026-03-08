export const RUSSELL_WEIGHTS = {
  Happiness: [0.8, 0.6],
  Surprise: [0.3, 0.8],
  Contempt: [-0.5, 0.2],
  Neutral: [0.0, 0.0],
  Disgust: [-0.7, 0.2],
  Fear: [-0.6, 0.7],
  Anger: [-0.7, 0.8],
  Sadness: [-0.8, -0.6]
}

export function calculateRussellCoordinates(probabilities)
{
  const emotions = Object.keys(RUSSELL_WEIGHTS)

  let x = 0
  let y = 0

  emotions.forEach((emotion,i)=>{
    const [valence,arousal] = RUSSELL_WEIGHTS[emotion]

    x += probabilities[i] * valence
    y += probabilities[i] * arousal
  })

  return {
    valence: Number(x.toFixed(4)),
    arousal: Number(y.toFixed(4))
  }
}
