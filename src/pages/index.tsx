import React from 'react'
import Link from 'next/link'
import MainLayout from '@/layouts/MainLayout'

const Home: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="bg-cover bg-center relative rounded-3xl overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, rgba(220, 38, 38, 0.85), rgba(239, 68, 68, 0.8)), url("https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1500&q=80")' }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="relative z-10 py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-12 lg:px-16 text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-5 leading-tight">Find Your Dream Job in Canada</h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto">
              Discover thousands of job opportunities from top companies across Canada. Start your journey today!
            </p>
            <Link href="/jobs" className="inline-block bg-white text-red-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition">
              Explore Jobs
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <div className="text-2xl sm:text-3xl mb-4">🎯</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Targeted Search</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Find jobs matching your skills and preferences with our advanced filtering system.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <div className="text-2xl sm:text-3xl mb-4">🚀</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Fast Application</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Apply to multiple jobs quickly with our streamlined application process.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <div className="text-2xl sm:text-3xl mb-4">📈</div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Career Growth</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Access opportunities that will help you advance your career in Canada.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-100 py-12 sm:py-16 px-4 sm:px-6 md:px-8 rounded-lg text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Start Your Canadian Journey?</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
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