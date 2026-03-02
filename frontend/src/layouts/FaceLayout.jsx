import React from 'react'
import { Outlet } from 'react-router-dom'

const FaceLayout = () => {
  return (
    <div className="min-h-screen bg-surface-0">
      <Outlet />
    </div>
  )
}

export default FaceLayout
