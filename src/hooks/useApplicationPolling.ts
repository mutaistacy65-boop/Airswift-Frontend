import { useEffect, useRef } from 'react'

/**
 * Hook to periodically refetch applications
 * Useful as a fallback when socket.io isn't available
 */
export const useApplicationPolling = (
  callback: () => Promise<void>,
  interval: number = 5000,
  enabled: boolean = true
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    callback()

    // Set up polling
    intervalRef.current = setInterval(async () => {
      try {
        await callback()
      } catch (error) {
        console.error('Error polling applications:', error)
      }
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [callback, interval, enabled])
}

export default useApplicationPolling
