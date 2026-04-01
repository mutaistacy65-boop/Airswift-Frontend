import React from 'react'
import Link from 'next/link'
import MainLayout from '@/layouts/MainLayout'

const Home: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-6 rounded-lg">
          <h1 className="text-5xl font-bold mb-4">Find Your Dream Job in Canada</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Discover thousands of job opportunities from top companies across Canada. Start your journey today!
          </p>
          <div className="flex gap-4">
            <Link
              href="/jobs"
              className="bg-white text-primary px-8 py-3 rounded font-semibold hover:bg-opacity-90"
            >
              Browse Jobs
            </Link>
            <Link
              href="/register"
              className="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-white hover:text-primary"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Targeted Search</h3>
            <p className="text-gray-600">
              Find jobs matching your skills and preferences with our advanced filtering system.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Fast Application</h3>
            <p className="text-gray-600">
              Apply to multiple jobs quickly with our streamlined application process.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">Career Growth</h3>
            <p className="text-gray-600">
              Access opportunities that will help you advance your career in Canada.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-100 py-16 px-6 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Canadian Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who found their dream jobs through Airswift.
          </p>
          <Link
            href="/register"
            className="bg-primary text-white px-8 py-3 rounded font-semibold hover:bg-opacity-90"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}

export default Home