import EntropyTrendChart from "./EntropyTrendChart"
import ModelUncertaintyMeter from "./ModelUncertaintyMeter"
import EmotionVolatility from "./EmotionVolatility"
import PredictionStability from "./PredictionStability"
import EmotionActivityTimeline from "./EmotionActivityTimeline"
import ExpressionSignalsHUD from "./ExpressionSignalsHUD"
import EmotionRadar from "./EmotionRadar"


const EmotionIntelligencePanel = ({ timeline }) => {

  if(!timeline || timeline.length === 0)
    return null

  return (

  <div className="grid grid-cols-2 gap-4">

    <div className="bg-purple-950 border border-purple-800 p-3">
      <EntropyTrendChart data={timeline}/>
    </div>

    <div className="bg-purple-950 border border-purple-800 p-3">
      <EmotionActivityTimeline data={timeline}/>
    </div>

    <div className="bg-purple-950 border border-purple-800 p-3">
      <ModelUncertaintyMeter data={timeline}/>
    </div>

    <div className="bg-purple-950 border border-purple-800 p-3">
      <EmotionVolatility data={timeline}/>
    </div>

    <div className="bg-purple-950 border border-purple-800 p-3 col-span-2">
      <PredictionStability data={timeline}/>
    </div>

    <div style={{
      display:"grid",
      gridTemplateColumns:"1fr 1fr",
      gap:"16px"
    }}>

      <EmotionRadar data={timeline} />

      <ExpressionSignalsHUD data={timeline} />
    </div>


  </div>

  )
}

export default EmotionIntelligencePanel
