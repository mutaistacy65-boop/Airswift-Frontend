import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, Database, ShieldCheck } from 'lucide-react'

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="bg-primary/10 rounded-2xl p-8 border border-primary/20">
            <Lock className="mx-auto mb-4 text-primary" size={48} />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Your privacy and data security are our top priorities at Talex
            </p>
          </div>
        </motion.div>

        {/* Data Protection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-3">
              <ShieldCheck className="text-primary" size={28} />
              Data Protection Measures
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>All user data is encrypted using industry-standard protocols</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Personal information is stored securely and never shared</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Regular security audits ensure platform integrity</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Information Collection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-3">
              <Database className="text-secondary" size={28} />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                <p>Email address for account verification and communication.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                <p>Phone number for OTP verification only.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                <p>Usage analytics to improve platform performance.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Security Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-3">
              <Eye className="text-secondary" size={28} />
              Security Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <h3 className="font-semibold text-secondary mb-2">OTP Verification</h3>
                <p className="text-gray-600 text-sm">Secure one-time password authentication.</p>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <h3 className="font-semibold text-secondary mb-2">Session Management</h3>
                <p className="text-gray-600 text-sm">Automatic session timeout for security.</p>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <h3 className="font-semibold text-secondary mb-2">Data Encryption</h3>
                <p className="text-gray-600 text-sm">End-to-end encryption for all data.</p>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <h3 className="font-semibold text-secondary mb-2">Access Monitoring</h3>
                <p className="text-gray-600 text-sm">Continuous monitoring of account activity.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Usage Policies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-3">
              <Lock className="text-accent" size={28} />
              Usage Policies
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p>Data is used solely for platform functionality and security.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p>No data is sold or shared with third parties.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p>Users can request data deletion at any time.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p>Compliance with international data protection standards.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <ShieldCheck className="mx-auto mb-4 text-primary" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-primary">Our Commitment</h3>
            <p className="text-gray-700">
              Talex is committed to maintaining the highest standards of data privacy and security. Your trust is our foundation.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
