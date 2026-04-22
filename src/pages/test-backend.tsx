import React, { useState } from 'react'
import { testBackendConnection } from '@/utils/testBackend'
import Button from '@/components/Button'

const BackendTestPage: React.FC = () => {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setError(null)
    setResult(null)

    try {
      const testResult = await testBackendConnection()
      setResult(testResult)
      if (!testResult.success) {
        setError(testResult.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Backend Connection Test</h1>

        <div className="bg-white/10 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">API Configuration</h2>
            <div className="bg-slate-900 rounded p-4 font-mono text-sm">
              <p>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL}</p>
            </div>
          </div>

          <Button
            onClick={handleTest}
            disabled={testing}
            className={`py-3 px-6 rounded-lg font-semibold transition ${
              testing
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {testing ? 'Testing...' : 'Test Backend Connection'}
          </Button>
        </div>

        {result && (
          <div
            className={`rounded-2xl p-8 border ${
              result.success
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-red-900/20 border-red-500/30'
            }`}
          >
            <h3 className={`text-xl font-semibold mb-4 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? '✅ Test Successful' : '❌ Test Failed'}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-slate-300 mb-2">Status:</p>
                <p className="font-mono bg-slate-950 rounded p-3 text-sm">
                  {result.message}
                </p>
              </div>

              <div>
                <p className="text-slate-300 mb-2">Backend URL:</p>
                <p className="font-mono bg-slate-950 rounded p-3 text-sm break-all">
                  {result.backendUrl}
                </p>
              </div>

              {result.fetchData && (
                <div>
                  <p className="text-slate-300 mb-2">Backend Response:</p>
                  <pre className="font-mono bg-slate-950 rounded p-3 text-sm overflow-auto max-h-60">
                    {JSON.stringify(result.fetchData, null, 2)}
                  </pre>
                </div>
              )}

              {result.error && (
                <div>
                  <p className="text-slate-300 mb-2">Error:</p>
                  <p className="font-mono bg-slate-950 rounded p-3 text-sm text-red-300">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-red-400">❌ Error</h3>
            <p className="font-mono bg-slate-950 rounded p-3 text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="mt-8 bg-slate-900 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">📝 Instructions</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>✅ Verify .env.local has NEXT_PUBLIC_API_URL set correctly</li>
            <li>✅ Make sure your backend is running at the configured API URL</li>
            <li>✅ Click "Test Backend Connection" to verify the frontend-backend link</li>
            <li>✅ If test passes, your API is properly configured</li>
            <li>❌ If test fails, check backend URL and ensure backend is running</li>
          </ul>
        </div>

        <div className="mt-6 text-slate-500 text-xs">
          <p>You can also use this in your browser console:</p>
          <p className="font-mono bg-slate-900 rounded p-2 mt-2">
            import {'{testBackendConnection}'} from '@/utils/testBackend' {'&'} testBackendConnection()
          </p>
        </div>
      </div>
    </div>
  )
}

export default BackendTestPage
