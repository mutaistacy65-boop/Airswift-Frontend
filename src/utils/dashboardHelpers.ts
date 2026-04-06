type JobItem = {
  _id: string
  title: string
  location: string
  status?: string
  applicants?: number
}

type ApplicationItem = {
  _id?: string
  createdAt?: string
  status?: string
  fullName?: string
  jobTitle?: string
  aiScore?: number
}

type TrendData = {
  name: string
  applications: number
}

type LocationData = {
  name: string
  jobs: number
}

type DashboardSummary = {
  totalApplications: number
  totalJobs: number
  totalInterviews: number
  totalHired: number
  averageScore: number
  conversionRate: number
  avgTimeToHire: number
  monthlyRevenue: number
  summary: {
    applications: number
    jobs: number
    interviews: number
    hired: number
  }
}

type AlertItem = {
  id: string
  type: 'warning' | 'success' | 'info' | 'error'
  message: string
  timestamp: string
}

export const buildApplicationTrendData = (applications: ApplicationItem[]) => {
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - idx))
    return { date, name: date.toLocaleDateString('en-US', { weekday: 'short' }), applications: 0 }
  })

  const counts = days.reduce<Record<string, number>>((acc, day) => {
    acc[day.name] = 0
    return acc
  }, {})

  const startDate = new Date(days[0].date)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  applications.forEach((app) => {
    if (!app.createdAt) return
    const created = new Date(app.createdAt)
    if (created < startDate || created > endDate) return
    const label = created.toLocaleDateString('en-US', { weekday: 'short' })
    if (label in counts) {
      counts[label] += 1
    }
  })

  return days.map((day) => ({ name: day.name, applications: counts[day.name] ?? 0 }))
}

export const buildConversionData = (applications: ApplicationItem[]) => {
  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Hired']
  const counts = stages.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {} as Record<string, number>)

  applications.forEach(app => {
    const status = app.status
    if (status === 'Submitted' || status === 'pending') counts['Applied']++
    else if (status === 'Under Review' || status === 'reviewed') counts['Under Review']++
    else if (status === 'Shortlisted' || status === 'shortlisted') counts['Shortlisted']++
    else if (status?.includes('interview')) counts['Interview']++
    else if (status === 'Hired' || status === 'accepted' || status === 'visa_ready') counts['Hired']++
  })

  return stages.map(stage => ({ name: stage, value: counts[stage] }))
}

export const generateAlerts = (stats: DashboardSummary, applications: ApplicationItem[]) => {
  const newAlerts: AlertItem[] = []

  if (stats.totalApplications > 50) {
    newAlerts.push({
      id: '1',
      type: 'info',
      message: 'High application volume this week!',
      timestamp: new Date().toISOString(),
    })
  }

  const pendingReviews = applications.filter(app => app.status === 'pending' || app.status === 'Submitted').length
  if (pendingReviews > 10) {
    newAlerts.push({
      id: '2',
      type: 'warning',
      message: `${pendingReviews} applications pending review`,
      timestamp: new Date().toISOString(),
    })
  }

  if (stats.conversionRate < 5) {
    newAlerts.push({
      id: '3',
      type: 'error',
      message: 'Low conversion rate detected',
      timestamp: new Date().toISOString(),
    })
  }

  return newAlerts
}

export const buildJobLocationData = (jobs: JobItem[]): LocationData[] => {
  const locationMap: { [key: string]: number } = {}

  jobs.forEach((job) => {
    const location = job.location || 'Unknown'
    locationMap[location] = (locationMap[location] || 0) + 1
  })

  return Object.keys(locationMap).map((key) => ({
    name: key,
    jobs: locationMap[key],
  }))
}
