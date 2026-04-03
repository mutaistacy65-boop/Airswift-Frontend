import React from 'react'
import { motion } from 'framer-motion'
import { FileText, AlertTriangle, Shield, CheckCircle } from 'lucide-react'

const TermsAndConditions: React.FC = () => {
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
            <FileText className="mx-auto mb-4 text-indigo-400" size={48} />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Terms & Agreement
            </h1>
            <p className="text-slate-300">
              By using AIRSWIFT, you agree to the following terms and conditions
            </p>
          </div>
        </motion.div>

        {/* Usage Rules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
              <CheckCircle className="text-green-400" size={28} />
              Usage Rules
            </h2>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>You must use the platform responsibly and legally</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Unauthorized access or hacking attempts are strictly prohibited</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Users must provide accurate registration information</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Security Restrictions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
              <Shield className="text-red-400" size={28} />
              Security Restrictions
            </h2>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Sharing login credentials is not allowed</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Any suspicious activity may result in account suspension</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>System misuse is monitored and logged</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Acceptable Use Policy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
              <AlertTriangle className="text-yellow-400" size={28} />
              Acceptable Use Policy
            </h2>
            <p className="text-slate-300 mb-6">
              AIRSWIFT must not be used for any of the following prohibited activities:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-red-300 mb-2">Illegal Activities</h3>
                <p className="text-slate-400 text-sm">Any unlawful or prohibited activities</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-red-300 mb-2">Spamming</h3>
                <p className="text-slate-400 text-sm">Automated abuse or spam activities</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-red-300 mb-2">Reverse Engineering</h3>
                <p className="text-slate-400 text-sm">System exploitation or unauthorized access</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-red-300 mb-2">System Abuse</h3>
                <p className="text-slate-400 text-sm">Any form of platform misuse</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Agreement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-6">
            <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-indigo-300">Agreement</h3>
            <p className="text-slate-300">
              By using AIRSWIFT, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TermsAndConditions
