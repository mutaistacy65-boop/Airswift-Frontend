import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/hooks/useSocket'

interface LocationData {
  lat: number
  lng: number
  accuracy?: number
  timestamp: string
}

const UserLocationEmitter: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const { emit, isConnected } = useSocket()
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastLocationRef = useRef<LocationData | null>(null)
  const lastActivityRef = useRef<string>('')

  // Get current location
  const getLocation = useCallback((): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported')
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          }
          resolve(location)
        },
        (error) => {
          console.warn('Geolocation error:', error.message)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      )
    })
  }, [])

  // Emit user online status
  const emitOnline = useCallback(async () => {
    if (!user || !isConnected) return

    const location = await getLocation()
    const payload = {
      userId: user.id || user._id,
      user: {
        name: user.name,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
      ...(location && { lat: location.lat, lng: location.lng }),
    }

    emit('user:online', payload)
    console.log('Emitted user:online', payload)
  }, [user, isConnected, emit, getLocation])

  // Emit location update
  const emitLocation = useCallback(async () => {
    if (!user || !isConnected) return

    const location = await getLocation()
    if (!location) return

    // Only emit if location changed significantly (more than 100m)
    if (lastLocationRef.current) {
      const distance = getDistance(
        lastLocationRef.current.lat,
        lastLocationRef.current.lng,
        location.lat,
        location.lng
      )
      if (distance < 100) return // Don't emit if moved less than 100m
    }

    lastLocationRef.current = location

    const payload = {
      userId: user.id || user._id,
      user: {
        name: user.name,
        email: user.email,
      },
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
    }

    emit('user:location', payload)
    console.log('Emitted user:location', payload)
  }, [user, isConnected, emit, getLocation])

  // Emit activity update
  const emitActivity = useCallback((activity: string) => {
    if (!user || !isConnected || lastActivityRef.current === activity) return

    lastActivityRef.current = activity

    const payload = {
      userId: user.id || user._id,
      user: {
        name: user.name,
        email: user.email,
      },
      activity,
      timestamp: new Date().toISOString(),
    }

    emit('user:activity', payload)
    console.log('Emitted user:activity', payload)

    // Reset activity after 30 seconds
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current)
    }
    activityTimeoutRef.current = setTimeout(() => {
      lastActivityRef.current = ''
    }, 30000)
  }, [user, isConnected, emit])

  // Emit offline status
  const emitOffline = useCallback(() => {
    if (!user || !isConnected) return

    const payload = {
      userId: user.id || user._id,
      user: {
        name: user.name,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    }

    emit('user:offline', payload)
    console.log('Emitted user:offline', payload)
  }, [user, isConnected, emit])

  // Track user activity
  const trackActivity = useCallback(() => {
    let activityType = 'browsing'

    // Detect activity based on current page/interaction
    const currentPath = window.location.pathname
    if (currentPath.includes('/apply')) {
      activityType = 'applying for job'
    } else if (currentPath.includes('/jobs')) {
      activityType = 'browsing jobs'
    } else if (currentPath.includes('/profile')) {
      activityType = 'updating profile'
    } else if (currentPath.includes('/applications')) {
      activityType = 'checking applications'
    } else if (currentPath.includes('/messages')) {
      activityType = 'reading messages'
    }

    emitActivity(activityType)
  }, [emitActivity])

  // Calculate distance between two points (in meters)
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Setup location tracking and activity monitoring
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clear intervals and emit offline if user logs out
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
        locationIntervalRef.current = null
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
        activityTimeoutRef.current = null
      }
      emitOffline()
      return
    }

    // User is authenticated, start tracking
    emitOnline()

    // Track location every 5 minutes
    locationIntervalRef.current = setInterval(emitLocation, 5 * 60 * 1000)

    // Initial location emit
    emitLocation()

    // Track activity on page load and interactions
    trackActivity()

    // Listen for user interactions
    const handleActivity = () => trackActivity()
    const events = ['click', 'scroll', 'keydown', 'mousemove']

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Track page changes
    const handleRouteChange = () => {
      setTimeout(trackActivity, 100) // Small delay to let page load
    }

    window.addEventListener('popstate', handleRouteChange)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      window.removeEventListener('popstate', handleRouteChange)

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [isAuthenticated, user, emitOnline, emitOffline, emitLocation, trackActivity])

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        emitActivity('tab inactive')
      } else {
        emitActivity('tab active')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [emitActivity])

  // Handle beforeunload (user closing tab/browser)
  useEffect(() => {
    const handleBeforeUnload = () => {
      emitOffline()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [emitOffline])

  // Component doesn't render anything
  return null
}

export default UserLocationEmitter