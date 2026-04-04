import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Globe, Briefcase, TrendingUp, Users, ArrowRight, MapPin, Check, Plane, Award, Shield, Zap, BarChart3, FileCheck, Handshake } from 'lucide-react'
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
    { 
      icon: Globe, 
      title: 'International Opportunities', 
      description: 'Access premium Canadian job market and establish your career in one of the world\'s most desirable destinations for skilled professionals.'
    },
    { 
      icon: Briefcase, 
      title: 'Quality Job Listings', 
      description: 'Verified positions from top-tier employers across Canada in healthcare, technology, construction, and many other sectors.'
    },
    { 
      icon: TrendingUp, 
      title: 'Career Growth', 
      description: 'Build a sustainable career with competitive salaries, benefits, and professional development opportunities.'
    },
    { 
      icon: Shield, 
      title: 'Trusted & Secure', 
      description: 'All employers are thoroughly vetted and verified to ensure legitimate job opportunities for our users.'
    },
    { 
      icon: FileCheck, 
      title: 'Visa Support', 
      description: 'Clear visa sponsorship information and guidance throughout the application and immigration process.'
    },
    { 
      icon: Award, 
      title: 'Expert Support', 
      description: 'Access career coaching resources, interview preparation, and application templates to maximize your success.'
    }
  ]

  const stats = [
    { number: '5,000+', label: 'Active Job Seekers', icon: Users },
    { number: '500+', label: 'Verified Employers', icon: Briefcase },
    { number: '2,000+', label: 'Job Opportunities', icon: TrendingUp },
    { number: '1,200+', label: 'Successful Placements', icon: Handshake }
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
            className="rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="relative bg-slate-900/30">
              <Image
                src="https://images.unsplash.com/photo-1558041217-92d29f0ffacd?auto=format&fit=crop&w=1800&q=80"
                alt="Professional networking and career advancement opportunities in Canada"
                width={1800}
                height={600}
                className="w-full h-64 sm:h-80 md:h-96 object-cover opacity-70"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-indigo-950/40 to-transparent" />
              <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6 md:p-10">
                <div className="flex flex-col justify-center text-left text-white">
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-emerald-300 mb-2">Global Talent Meets Opportunity</p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                    Your Gateway to<br />Premium Canadian<br />Career Opportunities
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-xl mb-8">
                    Discover thousands of verified job opportunities with Canada's top employers. Get personalized career guidance, visa sponsorship support, and interview preparation from industry experts. Build your professional future with confidence.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/register">
                      <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base py-3 px-8 flex items-center justify-center gap-2">
                        Get Started <ArrowRight size={18} />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-sm sm:text-base py-3 px-8">
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1542089363-66e92efb12b7?auto=format&fit=crop&w=1200&q=80"
                    alt="Modern Canadian workplace environment with professional collaboration"
                    width={1200}
                    height={800}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Platform Statistics Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-16 md:py-24 border-y border-indigo-500/20"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-12 text-center">By The Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-white/10 transition-all"
                  >
                    <Icon className="w-8 h-8 mx-auto text-indigo-400 mb-3" />
                    <h4 className="text-2xl md:text-3xl font-bold text-indigo-300">{stat.number}</h4>
                    <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-16 md:py-24"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">Why Choose Airswift?</h3>
            <p className="text-center text-slate-300 mb-12 max-w-2xl mx-auto">We provide everything you need to successfully transition your career from Kenya to Canada with confidence and support</p>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-8 hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
                  >
                    <Icon className="w-12 h-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="text-lg font-bold mb-3">{feature.title}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-16 md:py-24 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl px-8 md:px-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">Success Stories From Our Community</h3>
            <p className="text-center text-slate-300 mb-12 max-w-2xl mx-auto">Hear from real professionals who've successfully launched their Canadian careers through Airswift</p>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Senior Software Engineer',
                  company: 'TechCorp Canada',
                  location: 'Toronto, Ontario',
                  salary: '$95,000+',
                  testimonial: 'Airswift made my dream of working in Canada a reality. The process was smooth, transparent, and the visa guidance was invaluable.',
                  avatar: 'SJ',
                  timeline: '6 months to placement'
                },
                {
                  name: 'Michael Chen',
                  role: 'Construction Project Manager',
                  company: 'BuildMasters Inc',
                  location: 'Calgary, Alberta',
                  salary: '$85,000+',
                  testimonial: 'From Kenya to Canada - thanks to Airswift\'s platform and support team, I found my perfect role in construction management.',
                  avatar: 'MC',
                  timeline: '4 months to placement'
                },
                {
                  name: 'Grace Oduya',
                  role: 'Registered Nurse (RN)',
                  company: 'HealthCare Plus Hospital',
                  location: 'Vancouver, BC',
                  salary: '$70,000+',
                  testimonial: 'The visa sponsorship clarity and job matching was outstanding. The entire team was responsive and supportive throughout.',
                  avatar: 'GO',
                  timeline: '5 months to placement'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-white/10 transition-all flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="mb-4 pb-4 border-b border-indigo-500/20">
                    <p className="text-xs text-indigo-300 font-semibold">{testimonial.company}</p>
                    <div className="flex gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1"><MapPin size={14} />{testimonial.location}</span>
                      <span className="text-green-400">{testimonial.salary} CAD</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm italic mb-4 flex-grow">"{testimonial.testimonial}"</p>
                  <p className="text-xs text-slate-500 bg-white/5 rounded px-3 py-1 w-fit">⏱️ {testimonial.timeline}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Us - Expanded Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-16 md:py-24"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">Our Commitment to Your Success</h3>
            <p className="text-center text-slate-300 mb-12 max-w-2xl mx-auto">What sets Airswift apart in connecting Kenyan talent with Canadian employers</p>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <Check className="text-green-400 flex-shrink-0 w-6 h-6" />
                <div>
                  <h4 className="font-bold mb-2">Verified Canadian Employers</h4>
                  <p className="text-slate-300 text-sm">All companies are thoroughly vetted for legitimacy, financial stability, and employer credibility. We protect our community from fraudulent opportunities.</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex gap-4"
              >
                <Check className="text-green-400 flex-shrink-0 w-6 h-6" />
                <div>
                  <h4 className="font-bold mb-2">Streamlined Application Process</h4>
                  <p className="text-slate-300 text-sm">Quick and intuitive job applications designed for job seekers in Kenya. Apply from anywhere, showcase your qualifications effectively.</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex gap-4"
              >
                <Check className="text-green-400 flex-shrink-0 w-6 h-6" />
                <div>
                  <h4 className="font-bold mb-2">Professional Career Support</h4>
                  <p className="text-slate-300 text-sm">Access resume optimization tips, interview preparation guides, and professional development resources to maximize your chances.</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex gap-4"
              >
                <Check className="text-green-400 flex-shrink-0 w-6 h-6" />
                <div>
                  <h4 className="font-bold mb-2">Transparent Visa Information</h4>
                  <p className="text-slate-300 text-sm">Clear work visa requirements and sponsorship details for each position. Know exactly what to expect before applying.</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
                <Check className="text-green-400 flex-shrink-0 w-6 h-6" />
                <div>
                  <h4 className="font-bold mb-2">Diverse Job Categories</h4>
                  <p className="text-slate-300 text-sm">Opportunities across healthcare, technology, construction, hospitality, and many other sectors with competitive salaries.</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex gap-4"
              >
                <Check className="text-green-400 flex-shrink-0 w-6 h-6" />
                <div>
                  <h4 className="font-bold mb-2">24/7 Community Support</h4>
                  <p className="text-slate-300 text-sm">Access to our support team, community resources, and experienced professionals ready to help you succeed.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Process Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-16 md:py-24 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl px-8 md:px-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-12 text-center">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6 md:gap-4">
              {[
                { step: 1, title: 'Create Profile', description: 'Sign up and build your professional profile with credentials and experience' },
                { step: 2, title: 'Browse Jobs', description: 'Explore verified Canadian job opportunities that match your skills' },
                { step: 3, title: 'Apply & Interview', description: 'Submit applications and participate in interviews with employers' },
                { step: 4, title: 'Get Hired', description: 'Receive job offer and begin your Canadian career journey' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                      {item.step}
                    </div>
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-slate-300 text-sm">{item.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-indigo-600 to-transparent -z-10"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16 md:py-24"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Career?</h3>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto text-lg">
              Join thousands of successful Kenyan professionals who have found their dream jobs in Canada. Your next opportunity is just a few clicks away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-base py-3 px-12 flex items-center justify-center gap-2 w-full sm:w-auto">
                  Start Your Journey <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button className="bg-white/10 hover:bg-white/20 border border-white/30 text-base py-3 px-12 w-full sm:w-auto">
                  Browse Open Positions
                </Button>
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-6">Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Log in here</Link></p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/20 bg-slate-950/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Plane size={20} className="text-indigo-400" />
                AIRSWIFT
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">Connecting Kenyan talent with premium Canadian job opportunities. Your bridge to international career success.</p>
              <div className="mt-4 flex gap-3">
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition text-sm">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition text-sm">LinkedIn</a>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition text-sm">Facebook</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><Link href="/jobs" className="hover:text-indigo-400 transition">Browse Jobs</Link></li>
                <li><Link href="/about" className="hover:text-indigo-400 transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition">Contact Us</Link></li>
                <li><Link href="/report" className="hover:text-indigo-400 transition">Report Issue</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Career Tips</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Visa Guide</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><Link href="/terms" className="hover:text-indigo-400 transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-400 transition">Privacy Policy</Link></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Cookies Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><a href="mailto:support@airswift.com" className="hover:text-indigo-400 transition">Email Support</a></li>
                <li><a href="tel:+254712345678" className="hover:text-indigo-400 transition">+254 712 345 678</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-indigo-500/20 pt-8">
            <div className="grid md:grid-cols-2 gap-4 text-center md:text-left">
              <p className="text-slate-400 text-sm">&copy; 2026 AIRSWIFT. All rights reserved. | Connecting Kenya to Canadian Opportunities</p>
              <p className="text-slate-500 text-xs">Made with <span className="text-red-500">❤</span> to help Kenyans achieve their dreams in Canada</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
