import React from "react"

export default function ExpressionSignalsHUD({ data }) {

  if (!data) return null

  const smile = data.smile_score ?? 0
  const talk = data.talk_score ?? 0
  const happy = data.happy_score ?? 0

  const barStyle = value => ({
    height: "8px",
    width: `${Math.min(value * 100, 100)}%`,
    background: "linear-gradient(90deg,#8a2be2,#00ffff)",
    borderRadius: "4px",
    boxShadow: "0 0 8px #8a2be2"
  })

  const container = {
    background: "rgba(10,10,20,0.7)",
    border: "1px solid #8a2be2",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 0 20px rgba(138,43,226,0.4)"
  }

  const label = {
    fontSize: "12px",
    color: "#aaa",
    marginBottom: "4px"
  }

  const value = {
    fontSize: "16px",
    color: "#00ffff",
    marginBottom: "6px"
  }

  return (
    <div style={container}>

      <div style={label}>Duchenne Smile Signal</div>
      <div style={value}>{smile.toFixed(2)}</div>
      <div style={barStyle(smile)} />

      <div style={{height:"12px"}}/>

      <div style={label}>Talking Activity</div>
      <div style={value}>{talk.toFixed(2)}</div>
      <div style={barStyle(talk)} />

      <div style={{height:"12px"}}/>

      <div style={label}>Happiness Composite</div>
      <div style={value}>{happy.toFixed(2)}</div>
      <div style={barStyle(happy)} />

    </div>
  )
}
