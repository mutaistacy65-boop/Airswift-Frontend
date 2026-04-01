import React from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const loader = (
    <div className={`animate-spin ${sizeClasses[size]}`}>
      <div className="h-full w-full border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {loader}
      </div>
    )
  }

  return loader
}

export default Loader