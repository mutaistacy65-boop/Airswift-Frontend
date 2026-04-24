import React from 'react'
import Link from 'next/link'

interface SummaryCard {
  title: string
  value: number
  icon: string
  color: string
  link?: string
  description?: string
}

interface DashboardSummaryProps {
  cards: SummaryCard[]
  loading?: boolean
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ cards, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => {
        const CardContent = (
          <div className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition duration-200 border-l-4 ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                {card.description && (
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                )}
              </div>
              <div className="text-4xl opacity-20">{card.icon}</div>
            </div>
          </div>
        )

        if (card.link) {
          return (
            <Link key={index} href={card.link}>
              {CardContent}
            </Link>
          )
        }

        return <div key={index}>{CardContent}</div>
      })}
    </div>
  )
}

export default DashboardSummary
