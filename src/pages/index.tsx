import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Users, Zap, Shield, Award } from 'lucide-react'
import Button from '@/components/Button'

const features = [
  {
    title: 'Smart Job Matching',
    description: 'AI-powered matching to find roles perfect for your skills.',
    icon: Zap,
    color: 'bg-green-50',
    iconColor: 'text-primary',
  },
  {
    title: 'Secure & Verified',
    description: 'All employers verified and secured for your peace of mind.',
    icon: Shield,
    color: 'bg-blue-50',
    iconColor: 'text-secondary',
  },
  {
    title: 'Expert Support',
    description: 'Dedicated career advisors guide you every step of the way.',
    icon: Briefcase,
    color: 'bg-orange-50',
    iconColor: 'text-accent',
  },
]

const stats = [
  { number: '5K+', label: 'Active Opportunities' },
  { number: '10K+', label: 'Successful Hires' },
  { number: '95%', label: 'Success Rate' },
]

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-teal to-primary text-white py-20 lg:py-32">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-sm font-semibold">Now Hiring: Thousands of opportunities</span>
                </div>

                <div>
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    Your Next Career Opportunity Awaits
                  </h1>
                  <p className="text-xl text-white/90">
                    Connect with top employers, get matched with perfect roles, and advance your career with AIRSWIFT.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/register">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto text-white">
                      Find Your Job <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                      Browse Opportunities
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl font-bold">{stat.number}</div>
                      <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="badge badge-success">Application Approved</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Senior Product Manager</h3>
                      <p className="text-white/80 text-sm mb-4">Remote • Competitive Salary</p>
                      <Button variant="primary" size="sm" className="w-full text-white">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose AIRSWIFT?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We make hiring simple and hiring talent rewarding.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`rounded-2xl p-8 ${feature.color} border border-gray-200`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Take Your Career to the Next Level?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of professionals who have found their dream jobs through AIRSWIFT.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="secondary" size="lg" className="text-gray-900">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-white border-white">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
