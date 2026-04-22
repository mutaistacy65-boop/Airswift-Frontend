import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useSocket } from '@/hooks/useSocket'
import { useNotification } from '@/context/NotificationContext'

interface LiveLocation {
  id: string
  name: string
  email?: string
  lat: number
  lng: number
  status: 'online' | 'offline'
  activity?: string
  lastSeen: string
}

interface AdminRealtimeMapProps {
  maxMarkers?: number
}

const DEFAULT_CENTER: [number, number] = [1.3521, 103.8198]

function getMarkerColor(status: 'online' | 'offline') {
  return status === 'online' ? '#16A34A' : '#6B7280'
}

const AdminRealtimeMap: React.FC<AdminRealtimeMapProps> = ({ maxMarkers = 30 }) => {
  const { subscribe } = useSocket()
  const { addNotification } = useNotification()
  const [locations, setLocations] = useState<LiveLocation[]>([])
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [alerts, setAlerts] = useState<string[]>([])

  const normalizeId = (payload: any) => {
    return (
      payload.userId ||
      payload.id ||
      payload.user?._id ||
      payload.user?.id ||
      payload.email ||
      payload.name ||
      `user-${Date.now()}`
    )
  }

  const updateLocation = useCallback((payload: any) => {
    const id = normalizeId(payload)
    const lat = payload.lat ?? payload.latitude
    const lng = payload.lng ?? payload.longitude

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return
    }

    const name = payload.user?.name || payload.name || payload.email || 'Unknown User'
    const email = payload.user?.email || payload.email
    const status = payload.status === 'offline' ? 'offline' : 'online'
    const activity = payload.activity || undefined
    const now = payload.timestamp || new Date().toISOString()

    setLocations((prev) => {
      const existing = prev.find((item) => item.id === id)
      const updated: LiveLocation = {
        id,
        name,
        email,
        lat,
        lng,
        status,
        activity,
        lastSeen: now,
      }

      if (existing) {
        return [updated, ...prev.filter((item) => item.id !== id)]
      }

      return [updated, ...prev].slice(0, maxMarkers)
    })
  }, [maxMarkers])

  const updateStatus = useCallback((payload: any, status: 'online' | 'offline') => {
    const id = normalizeId(payload)
    const now = payload.timestamp || new Date().toISOString()

    setLocations((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status, lastSeen: now, activity: payload.activity ?? item.activity }
          : item
      )
    )
  }, [])

  const updateActivity = useCallback((payload: any) => {
    const id = normalizeId(payload)
    const now = payload.timestamp || new Date().toISOString()

    setLocations((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, activity: payload.activity || item.activity || 'Active', lastSeen: now }
          : item
      )
    )
  }, [])

  const handleAdminAlert = useCallback((payload: any) => {
    const message = payload?.message || 'Admin alert received.'
    addNotification(message, 'error')
    setAlerts((prev) => [message, ...prev].slice(0, 5))
  }, [addNotification])

  useEffect(() => {
    const unsubConnect = subscribe('connect', () => setSocketStatus('connected'))
    const unsubDisconnect = subscribe('disconnect', () => setSocketStatus('disconnected'))
    const unsubLocation = subscribe('user:location', updateLocation)
    const unsubOnline = subscribe('user:online', (data) => updateStatus(data, 'online'))
    const unsubOffline = subscribe('user:offline', (data) => updateStatus(data, 'offline'))
    const unsubActivity = subscribe('user:activity', updateActivity)
    const unsubAlert = subscribe('admin:alert', handleAdminAlert)

    return () => {
      unsubConnect()
      unsubDisconnect()
      unsubLocation()
      unsubOnline()
      unsubOffline()
      unsubActivity()
      unsubAlert()
    }
  }, [subscribe, updateLocation, updateStatus, updateActivity, handleAdminAlert])

  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => {
      if (a.status === b.status) {
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
      }
      return a.status === 'online' ? -1 : 1
    }),
    [locations]
  )

  const mapCenter = useMemo(() => {
    if (sortedLocations.length === 0) {
      return DEFAULT_CENTER
    }
    return [sortedLocations[0].lat, sortedLocations[0].lng] as [number, number]
  }, [sortedLocations])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Live User Location Feed</h4>
          <p className="text-sm text-gray-500">Receives socket updates and plots users on a live map.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1">Socket: {socketStatus}</span>
          <span className="rounded-full bg-green-50 text-green-700 px-3 py-1">Users tracked: {sortedLocations.length}</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200 h-[360px]">
        <MapContainer center={mapCenter} zoom={2} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {sortedLocations.map((location) => (
            <CircleMarker
              key={location.id}
              center={[location.lat, location.lng]}
              pathOptions={{ color: getMarkerColor(location.status), fillColor: getMarkerColor(location.status), fillOpacity: 0.75 }}
              radius={8}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{location.name}</p>
                  {location.email && <p>{location.email}</p>}
                  <p>Status: <span className="font-medium">{location.status}</span></p>
                  <p>Last seen: {new Date(location.lastSeen).toLocaleString()}</p>
                  {location.activity && <p>Activity: {location.activity}</p>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h5 className="font-semibold text-gray-900 mb-3">Recent Active Users</h5>
          {sortedLocations.length === 0 ? (
            <p className="text-gray-500">Waiting for location events...</p>
          ) : (
            <div className="space-y-3">
              {sortedLocations.slice(0, 4).map((location) => (
                <div key={location.id} className="rounded-xl border border-gray-100 p-3 bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{location.name}</p>
                      <p className="text-xs text-gray-500">{location.email || 'No email available'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${location.status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {location.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Last seen: {new Date(location.lastSeen).toLocaleString()}</p>
                  {location.activity && <p className="text-xs text-gray-600">Activity: {location.activity}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h5 className="font-semibold text-gray-900 mb-3">Admin Alerts</h5>
          {alerts.length === 0 ? (
            <p className="text-gray-500">No admin alerts received yet.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((message, index) => (
                <div key={`${message}-${index}`} className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-100">
                  {message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminRealtimeMap
