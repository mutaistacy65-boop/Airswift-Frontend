import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Shield, Bug, MessageSquare, Zap, Lock } from 'lucide-react'

const Report: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <AlertTriangle className="mx-auto mb-4 text-red-400" size={48} />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Report Issues
            </h1>
            <p className="text-slate-300">
              Help us maintain a secure platform by reporting bugs, security concerns, or suspicious activity
            </p>
          </div>
        </motion.div>

        {/* Report Categories */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Security Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <Shield className="mb-4 text-red-400" size={32} />
            <h3 className="text-xl font-semibold mb-4 text-red-300">Security Concerns</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Suspicious login attempts</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Potential security vulnerabilities</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Unauthorized access attempts</p>
              </div>
            </div>
            <a
              href="mailto:security@airswift.com?subject=Security%20Concern%20Report"
              className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Report Security Issue
            </a>
          </motion.div>

          {/* Technical Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <Bug className="mb-4 text-yellow-400" size={32} />
            <h3 className="text-xl font-semibold mb-4 text-yellow-300">Technical Issues</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Login or authentication problems</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Application crashes or errors</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Performance issues</p>
              </div>
            </div>
            <a
              href="mailto:support@airswift.com?subject=Technical%20Issue%20Report"
              className="mt-6 inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Report Bug
            </a>
          </motion.div>
        </div>

        {/* Live Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
        >
          <MessageSquare className="mb-4 text-green-400" size={32} />
          <h3 className="text-xl font-semibold mb-4 text-green-300">Live Support</h3>
          <p className="text-slate-300 mb-6">
            For immediate assistance with critical issues, contact our live support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@airswift.com?subject=Urgent%20Support%20Request"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors text-center"
            >
              Email Support
            </a>
            <a
              href="tel:+1-800-AIRSWIFT"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-center"
            >
              Call Support
            </a>
          </div>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8"
        >
          <Zap className="mb-4 text-red-400" size={32} />
          <h3 className="text-xl font-semibold mb-4 text-red-300">Emergency Security Issues</h3>
          <p className="text-slate-300 mb-6">
            If you discover a critical security vulnerability or believe there's an active security breach,
            please contact our emergency response team immediately.
          </p>
          <div className="bg-red-800/30 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="text-red-400" size={20} />
              <span className="font-semibold text-red-300">Emergency Contact</span>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              For critical security issues only - available 24/7
            </p>
            <a
              href="mailto:emergency@airswift.com?subject=CRITICAL%20SECURITY%20EMERGENCY"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              emergency@airswift.com
            </a>
          </div>
        </motion.div>

        {/* Response Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-6">
            <Shield className="mx-auto mb-4 text-indigo-400" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-indigo-300">Our Response Commitment</h3>
            <p className="text-slate-300">
              All reports are treated with the highest priority. Security issues receive immediate attention,
              while technical reports are addressed within 24 hours. We appreciate your help in keeping AIRSWIFT secure.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Report
