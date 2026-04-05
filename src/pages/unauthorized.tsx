import Link from 'next/link'
import Button from '@/components/Button'
import { AlertCircle, Home } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-xl text-gray-600 mb-6">
            You don't have permission to access this resource
          </p>
          <p className="text-gray-500 mb-8">
            This page is restricted to administrators only. If you believe this is an error, please contact support.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full">
              Sign in with Different Account
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Need help? <a href="mailto:support@talex.com" className="font-medium text-primary hover:text-secondary">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  )
}
