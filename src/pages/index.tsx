import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Globe, Briefcase, TrendingUp, Users, ArrowRight, MapPin, Check, Plane } from 'lucide-react'
import Button from '@/components/Button'

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  const features = [
    { icon: Globe, title: 'International Opportunities', description: 'Access premium Canadian job market from Kenya' },
    { icon: Briefcase, title: 'Quality Job Listings', description: 'Verified employers & positions across Canada' },
    { icon: TrendingUp, title: 'Career Growth', description: 'Build your career with global opportunities' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 md:p-6">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <Plane className="text-indigo-400" size={28} />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AIRSWIFT</span>
          </motion.h1>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login">
              <Button className="text-sm md:text-base bg-white/10 hover:bg-white/20 border border-indigo-400/30">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                Get Started <ArrowRight size={16} className="hidden sm:inline" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <MapPin className="text-green-400" size={16} />
              <span className="text-sm text-green-300">Kenya to Canada Job Opportunities</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Work in Canada
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Opportunities 🇨🇦
              </span>
            </h2>
            <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 md:mb-12">
              Connect with top Canadian employers from Kenya. Access verified job listings, streamlined application process, and career growth opportunities across multiple industries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/register">
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-base py-3 px-8 flex items-center justify-center gap-2">
                  Apply Now <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-indigo-400/50 text-base py-3 px-8">
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-12 md:py-20"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-12 text-center">Success Stories</h3>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Software Engineer',
                  company: 'TechCorp Canada',
                  testimonial: 'Airswift made my dream of working in Canada a reality. The process was smooth and the support was exceptional.',
                  avatar: 'SJ'
                },
                {
                  name: 'Michael Chen',
                  role: 'Project Manager',
                  company: 'BuildMasters Inc',
                  testimonial: 'From Kenya to Canada - thanks to Airswift\'s platform, I found my perfect job in construction management.',
                  avatar: 'MC'
                },
                {
                  name: 'Grace Oduya',
                  role: 'Registered Nurse',
                  company: 'HealthCare Plus',
                  testimonial: 'The visa process guidance and job matching was outstanding. Highly recommend to anyone seeking Canadian opportunities.',
                  avatar: 'GO'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 italic">"{testimonial.testimonial}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-8 md:p-12 my-16"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">Why Choose Our Job Portal?</h3>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4">
                <Check className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold mb-1">Verified Canadian Employers</h4>
                  <p className="text-slate-300">All companies vetted for legitimacy and credibility</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Check className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold mb-1">Easy Application Process</h4>
                  <p className="text-slate-300">Quick and simple job applications from Kenya</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Check className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold mb-1">Career Support</h4>
                  <p className="text-slate-300">Resume tips and interview preparation resources</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Check className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold mb-1">Visa Sponsorship Info</h4>
                  <p className="text-slate-300">Clear work visa & sponsorship requirements listed</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-12 md:py-16"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Start Your Canadian Career Today</h3>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Join thousands of Kenyan professionals who have successfully landed Canadian jobs through our platform.
            </p>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-base py-3 px-12 flex items-center gap-2 mx-auto">
                Browse Jobs <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/20 bg-slate-950/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Plane size={20} className="text-indigo-400" />
                AIRSWIFT
              </h4>
              <p className="text-slate-400 text-sm">Connecting Kenyan talent with Canadian opportunities.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><Link href="/about" className="hover:text-indigo-400 transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition">Contact</Link></li>
                <li><Link href="/report" className="hover:text-indigo-400 transition">Report Issue</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><Link href="/terms" className="hover:text-indigo-400 transition">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-400 transition">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><a href="mailto:support@airswift.com" className="hover:text-indigo-400 transition">Email</a></li>
                <li><a href="tel:+1-800-AIRSWIFT" className="hover:text-indigo-400 transition">Phone</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-indigo-500/20 pt-6 text-center text-slate-400 text-sm">
            <p>&copy; 2026 AIRSWIFT. All rights reserved. | Kenya to Canada Job Opportunities</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
