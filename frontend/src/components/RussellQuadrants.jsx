const RussellQuadrants = ({ data }) => {
/*
Q1 = Positive / High Arousal
Q2 = Negative / High Arousal
Q3 = Negative / Low Arousal
Q4 = Positive / Low Arousal
*/
  let q1=0,q2=0,q3=0,q4=0

  data.forEach(p=>{

    if(p.valence>=0 && p.arousal>=0) q1++

    else if(p.valence<0 && p.arousal>=0) q2++

    else if(p.valence<0 && p.arousal<0) q3++
    
    else q4++

  })

  const total = data.length

  const pct = v => ((v/total)*100).toFixed(1)

  return (

  <div className="text-sm font-mono space-y-1">

    <div>Positive / High Energy : {pct(q1)}%</div>
    <div>Negative / High Energy : {pct(q2)}%</div>
    <div>Negative / Low Energy  : {pct(q3)}%</div>
    <div>Positive / Low Energy  : {pct(q4)}%</div>

  </div>

  )
}

export default RussellQuadrants
