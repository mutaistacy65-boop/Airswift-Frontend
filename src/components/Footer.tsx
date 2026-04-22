import React from 'react'
import Link from 'next/link'
import { Plane, Mail, Phone, MapPin, Share2, Send, Globe } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 border-t border-gray-200 text-white mt-16 md:mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                <Plane className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TALEX
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Enterprise-grade authentication platform with modern UX and military-grade security.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-primary">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition">
                  About TALEX
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-primary transition">
                  Report Security Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-primary">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/terms" className="hover:text-primary transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4 text-primary">Support</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2 hover:text-primary transition">
                <Mail size={16} />
                <a href="mailto:support@talex.com">support@talex.com</a>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition">
                <Phone size={16} />
                <a href="tel:+1-800-TALEX">+1-800-TALEX</a>
              </li>
              <li className="flex items-start gap-2 hover:text-primary transition">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>Toronto, Canada</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; 2026 TALEX. All rights reserved. | Secure Authentication Platform
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition p-2 rounded-lg hover:bg-white/5">
                <Share2 size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition p-2 rounded-lg hover:bg-white/5">
                <Send size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition p-2 rounded-lg hover:bg-white/5">
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