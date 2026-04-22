import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-surface p-5 rounded-xl shadow-sm border border-border flex justify-between items-center ${className}`}>
      <div>
        <p className="text-text-secondary text-sm mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-text-primary">{value}</h2>
        {trend && (
          <p className={`text-sm mt-1 ${trend.isPositive ? 'text-accent' : 'text-danger'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last month
          </p>
        )}
      </div>
      {icon && (
        <div className="text-primary text-2xl">
          {icon}
        </div>
      )}
    </div>
  )
}

export default MetricCard