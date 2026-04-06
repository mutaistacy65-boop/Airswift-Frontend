import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
}) => {
  return (
    <div className={`bg-surface rounded-xl shadow-sm border border-border p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
          {subtitle && <p className="text-text-secondary text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card