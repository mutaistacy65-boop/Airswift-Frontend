import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Zap, Smartphone, Lock, Users, Globe } from 'lucide-react'

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            About Talex
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Talex is a modern career marketplace built to connect talent with verified employers and meaningful opportunities.
          </p>
        </motion.div>

        {/* What is TALEX */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-3xl font-bold mb-6 text-primary">What is Talex?</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Talex is a modern career platform that connects job seekers with top employers through secure, fast, and intelligent matching.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Shield className="text-green-400" size={24} />
                <span>Secure user authentication systems</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="text-blue-400" size={24} />
                <span>Admin and user dashboards</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="text-yellow-400" size={24} />
                <span>Scalable backend architecture</span>
              </div>
              <div className="flex items-center space-x-3">
                <Smartphone className="text-purple-400" size={24} />
                <span>Seamless mobile and web integration</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Security-Focused System */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
              <Lock className="text-red-400" size={32} />
              Security-Focused System
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Talex is built with security as a priority, implementing industry-standard practices to protect your personal data and account information.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-primary mb-2">JWT Authentication</h3>
                <p className="text-gray-600">Secure token-based authentication for all sessions</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-300 mb-2">Session Security</h3>
                <p className="text-slate-400">Protected session handling with automatic expiration</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-300 mb-2">API Protection</h3>
                <p className="text-slate-400">All routes protected with proper authentication checks</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-300 mb-2">Role-Based Access</h3>
                <p className="text-slate-400">Granular permissions for Admin and User roles</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Platform Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-3xl font-bold mb-6 text-primary flex items-center gap-3">
              <Globe className="text-primary" size={32} />
              Platform Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Secure Auth</h3>
                <p className="text-gray-600">Enterprise-grade security for all users.</p>
              </div>
              <div className="text-center">
                <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap size={32} className="text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Fast & Scalable</h3>
                <p className="text-gray-600">Built for performance and growth.</p>
              </div>
              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} className="text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Cross-Platform</h3>
                <p className="text-gray-600">Seamless web and mobile experience.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link href="/register" className="inline-flex bg-primary hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
            Get Started with Talex
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default About
