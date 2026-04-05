import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Clock, MapPin, Globe, MessageCircle } from 'lucide-react'

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <MessageCircle className="mx-auto mb-4 text-primary" size={48} />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Contact AIRSWIFT
            </h1>
            <p className="text-gray-600">
              Get in touch with our global support team for assistance with your authentication needs
            </p>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Email Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
          >
            <Mail className="mx-auto mb-4 text-blue-400" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-primary">Email Support</h3>
            <p className="text-gray-700 mb-4">support@airswift.com</p>
            <div className="space-y-2">
              <a
                href="mailto:support@airswift.com"
                className="block bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Send Email
              </a>
            </div>
          </motion.div>

          {/* Phone Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
          >
            <Phone className="mx-auto mb-4 text-green-400" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-green-300">Phone Support</h3>
            <p className="text-gray-700 mb-4">+1-800-AIRSWIFT</p>
            <p className="text-gray-600 text-sm">Available 24/7 for urgent issues</p>
          </motion.div>

          {/* Global Reach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
          >
            <Globe className="mx-auto mb-4 text-purple-400" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-purple-300">Global Reach</h3>
            <p className="text-slate-300 mb-4">International support</p>
            <p className="text-slate-400 text-sm">Serving clients worldwide</p>
          </motion.div>
        </div>

        {/* Support Hours & Location */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Support Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <Clock className="mb-4 text-orange-400" size={32} />
            <h3 className="text-2xl font-semibold mb-4 text-orange-300">Support Hours</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="text-green-400">24/7 Available</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-yellow-400">9:00 AM - 6:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-yellow-400">12:00 PM - 8:00 PM EST</span>
              </div>
            </div>
          </motion.div>

          {/* Headquarters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <MapPin className="mb-4 text-red-400" size={32} />
            <h3 className="text-2xl font-semibold mb-4 text-red-300">Global Headquarters</h3>
            <div className="text-slate-300">
              <p className="mb-2">AIRSWIFT Technologies Inc.</p>
              <p>1500 King Street West</p>
              <p>Toronto, ON M5H 1A1</p>
              <p className="mt-2">Canada</p>
            </div>
          </motion.div>
        </div>

        {/* Support Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <h3 className="text-2xl font-semibold mb-6 text-indigo-300 text-center">How Can We Help?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-300 mb-2">Account Issues</h4>
              <p className="text-slate-400 text-sm">Login problems, password reset, account verification</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">Security Concerns</h4>
              <p className="text-slate-400 text-sm">Suspicious activity, security alerts, data protection</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">Technical Support</h4>
              <p className="text-slate-400 text-sm">Platform issues, feature requests, bug reports</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2">Billing & Payments</h4>
              <p className="text-slate-400 text-sm">Subscription issues, payment methods, refunds</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-orange-300 mb-2">Integration Help</h4>
              <p className="text-slate-400 text-sm">API integration, third-party connections</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-red-300 mb-2">Emergency Support</h4>
              <p className="text-slate-400 text-sm">Critical system issues, urgent security matters</p>
            </div>
          </div>
        </motion.div>

        {/* Response Time Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-6">
            <Clock className="mx-auto mb-4 text-indigo-400" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-indigo-300">Response Time Commitment</h3>
            <p className="text-slate-300">
              We respond to all inquiries within 2 hours during business hours and within 6 hours for after-hours support.
              Critical security issues receive immediate attention.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact
