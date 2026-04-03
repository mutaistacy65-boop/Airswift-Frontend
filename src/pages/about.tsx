import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Zap, Smartphone, Lock, Users, Globe } from 'lucide-react'

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            About AIRSWIFT
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Modern, secure digital platform for fast, scalable, and reliable authentication and user management systems
          </p>
        </motion.div>

        {/* What is AIRSWIFT */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400">What is AIRSWIFT?</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              AIRSWIFT is a modern, secure digital platform designed to provide fast, scalable, and reliable authentication and user management systems for web and mobile applications.
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
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              AIRSWIFT is built with security as a priority, implementing industry-standard practices to protect your data and ensure safe authentication.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-300 mb-2">JWT Authentication</h3>
                <p className="text-slate-400">Secure token-based authentication for all sessions</p>
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
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
              <Globe className="text-green-400" size={32} />
              Platform Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-white" />
                </div>
                <h3 className="font-semibold mb-2">Secure Auth</h3>
                <p className="text-slate-400">Enterprise-grade security for all users</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap size={32} className="text-white" />
                </div>
                <h3 className="font-semibold mb-2">Fast & Scalable</h3>
                <p className="text-slate-400">Built for performance and growth</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} className="text-white" />
                </div>
                <h3 className="font-semibold mb-2">Cross-Platform</h3>
                <p className="text-slate-400">Seamless web and mobile experience</p>
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
          <Link href="/register">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
              Get Started with AIRSWIFT
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default About
