import React from 'react'
import Link from 'next/link'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12 w-full">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Airswift</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Leading job portal in Canada connecting talented professionals with opportunities.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
              <li><Link href="/jobs">Browse Jobs</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/report" className="text-yellow-300 font-semibold">Report Issue</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
          <p>&copy; 2026 Airswift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer