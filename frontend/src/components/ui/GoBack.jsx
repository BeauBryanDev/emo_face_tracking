import React from 'react'
import { useNavigate } from 'react-router-dom'

const GoBack = ({ label = 'GO BACK' }) => {
  const navigate = useNavigate()
  return (
    <button className="cyber-btn" onClick={() => navigate(-1)}>
      {label}
    </button>
  )
}

export default GoBack
