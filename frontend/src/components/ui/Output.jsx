import React from 'react'

const Output = ({ label, value }) => {
  return (
    <div className="data-readout">
      <div className="font-mono text-[10px] text-purple-500">{label}</div>
      <div className="font-mono text-sm text-purple-200">{value}</div>
    </div>
  )
}

export default Output
