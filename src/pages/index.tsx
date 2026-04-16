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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-teal to-secondary text-white py-24 lg:py-32">
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
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-sm font-semibold">Instant access to vetted roles</span>
                </div>

                <div>
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    Where Talent Meets Opportunity
                  </h1>
                  <p className="text-xl text-white/85 max-w-2xl">
                    Discover verified job listings, connect with hiring teams, and grow your career with Talex.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto text-white">
                      Register <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/15">
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
                <div className="rounded-[2.5rem] bg-white/10 p-8 border border-white/10 shadow-2xl backdrop-blur-lg">
                  <div className="rounded-[2rem] bg-slate-950/90 p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Featured role</p>
                        <h2 className="text-2xl font-semibold text-white mt-2">Senior Product Manager</h2>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-200">
                        Hired
                      </span>
                    </div>
                    <div className="space-y-4 text-slate-300">
                      <div>
                        <p className="text-sm text-slate-400">Location</p>
                        <p className="text-lg font-medium">Remote · Global</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Compensation</p>
                        <p className="text-lg font-medium">$120k - $150k</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-[2rem] bg-white/10 p-6 border border-white/10">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">Trusted by top talent</p>
                    <p className="text-white/80 leading-relaxed">
                      Talex empowers professionals with smart recommendations, secure applications, and direct access to employers.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Talex?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We make hiring simple, secure, and built around the talent you want.
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
                    className={`rounded-3xl p-8 ${feature.color} border border-gray-200`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to launch your next career move?
            </h2>
            <p className="text-xl text-white/80">
              Join thousands of professionals who trust Talex to connect them with top employers and high-growth opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg" className="text-gray-900">
                  Register Now
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
