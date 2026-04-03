import React from 'react'
import Link from 'next/link'
import { Plane, Mail, Phone, MapPin, Share2, Send, Globe } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-indigo-500/20 text-white mt-16 md:mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Plane className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AIRSWIFT
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Enterprise-grade authentication platform with modern UX and military-grade security.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-indigo-300">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition">
                  About AIRSWIFT
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-indigo-400 transition">
                  Report Security Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-indigo-300">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4 text-indigo-300">Support</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2 hover:text-indigo-400 transition">
                <Mail size={16} />
                <a href="mailto:support@airswift.com">support@airswift.com</a>
              </li>
              <li className="flex items-center gap-2 hover:text-indigo-400 transition">
                <Phone size={16} />
                <a href="tel:+1-800-AIRSWIFT">+1-800-AIRSWIFT</a>
              </li>
              <li className="flex items-start gap-2 hover:text-indigo-400 transition">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>Toronto, Canada</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-indigo-500/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; 2026 AIRSWIFT. All rights reserved. | Secure Authentication Platform
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition p-2 rounded-lg hover:bg-white/5">
                <Share2 size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition p-2 rounded-lg hover:bg-white/5">
                <Send size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition p-2 rounded-lg hover:bg-white/5">
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer