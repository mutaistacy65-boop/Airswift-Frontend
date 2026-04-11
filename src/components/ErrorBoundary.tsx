import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches React component errors and displays them instead of crashing
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error('Error caught by boundary:', error)
    console.error('Error info:', errorInfo)

    // Store error state
    this.setState({
      error,
      errorInfo,
    })

    // Optional: Log to error tracking service here
    // Example: logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <div className="text-5xl">⚠️</div>
            </div>
            
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-700 mb-4">
              A client-side exception has occurred. Please try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 rounded p-4 mb-4">
                <p className="font-mono text-sm text-red-700 break-words">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-mono text-xs text-gray-600">
                      View Stack Trace
                    </summary>
                    <pre className="mt-2 font-mono text-xs text-gray-600 overflow-auto max-h-60">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                Go Home
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
              💡 <strong>Tip:</strong> Open the browser console (F12) to see detailed error information
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
