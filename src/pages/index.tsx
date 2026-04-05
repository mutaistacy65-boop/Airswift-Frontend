import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, CheckCircle2, Globe2, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import Button from '@/components/Button'

const destinations = [
  {
    name: 'Canada',
    image: 'https://images.unsplash.com/photo-1526481280696-3bfa7568a1f2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'UK',
    image: 'https://images.unsplash.com/photo-1544117516-56f6af77d6fc?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Australia',
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'UAE',
    image: 'https://images.unsplash.com/photo-1526481280696-3bfa7568a1f2?auto=format&fit=crop&w=800&q=80',
  },
]

const cards = [
  {
    title: 'Explore Jobs Abroad',
    description: 'Find verified job opportunities in Canada tailored to your skills.',
    icon: Globe2,
  },
  {
    title: 'Visa & Relocation Support',
    description: 'Complete guidance through visa applications and relocation planning.',
    icon: ShieldCheck,
  },
  {
    title: 'Guided Career Advice',
    description: 'Resume support, interview prep, and employer matching every step of the way.',
    icon: Briefcase,
  },
]

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">T</div>
              <div>
                <p className="text-lg font-bold">Talex</p>
                <p className="text-sm text-slate-500">Connecting African talent with Canadian employers</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link href="#home" className="hover:text-emerald-600">Home</Link>
              <Link href="#about" className="hover:text-emerald-600">About Us</Link>
              <Link href="#employers" className="hover:text-emerald-600">Employers</Link>
              <Link href="#success" className="hover:text-emerald-600">Success Stories</Link>
              <Link href="#contact" className="hover:text-emerald-600">Contact Us</Link>
            </nav>
            <Link href="/register">
              <Button size="md" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main id="home" className="pb-24">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.25),_transparent_30%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                  <Sparkles className="h-4 w-4" /> Trusted partner for your international job search
                </div>
                <div className="max-w-xl space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                    Your Global Career Starts Here
                  </h1>
                  <p className="text-lg leading-8 text-slate-200">
                    Connecting Africa’s top talent with Canada’s best employers, backed by expert visa and relocation support for every step of your journey.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/jobs" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 w-full sm:w-auto">
                    Explore Jobs Abroad <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {cards.map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.title} className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 mb-4">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                        <p className="text-sm text-slate-200">{card.description}</p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-950/70"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-950/90" />
                <Image
                  src="https://images.unsplash.com/photo-1541364983171-a8ba01d5d81d?auto=format&fit=crop&w=1200&q=80"
                  alt="Professionals in Canada working together"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="rounded-[2rem] bg-white/95 p-6 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold">Explore Jobs Abroad</p>
                        <p className="mt-2 text-sm">Find verified jobs with visa sponsorship from top employers.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold">Visa & Relocation Support</p>
                        <p className="mt-2 text-sm">Assistance throughout visa processing and arrival planning.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="about" className="relative py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold">Why Choose Talex?</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Trusted partner in your international job search.</h2>
                <p className="max-w-xl text-lg leading-8 text-slate-600">
                  Talex supports African job seekers with verified Canadian placements, visa sponsorship guidance, and relocation advice tailored for every stage of your journey.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    'Expert consultants with global hiring experience.',
                    'End-to-end support from job search to relocation.',
                    'Verified employers and trusted job matches.',
                    'Clear visa guidance and application support.',
                  ].map((item) => (
                    <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <div className="flex items-center gap-3 text-emerald-500 mb-3">
                        <CheckCircle2 className="h-5 w-5" />
                        <p className="font-semibold text-slate-900">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1520975913131-6d03dd2aedf7?auto=format&fit=crop&w=1200&q=80"
                  alt="Professional relocation and career support"
                  width={1200}
                  height={900}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="success" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold">Popular Job Destinations</p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Where can Talex take your career?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-slate-600">Explore top international destinations with verified employers, visa sponsorship, and relocation support.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-4">
              {destinations.map((destination) => (
                <motion.div
                  key={destination.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="rounded-[2rem] overflow-hidden shadow-lg border border-slate-200 bg-white"
                >
                  <div className="relative h-56">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-emerald-600">Popular Destination</p>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">{destination.name}</h3>
                    <p className="mt-3 text-sm text-slate-600">Find visa-sponsored roles and relocation support for professionals moving abroad.</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="relative py-20 bg-slate-950 text-white">
          <Image
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
            alt="Canadian landscape background"
            fill
            className="absolute inset-0 object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-sm">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-300 font-semibold">Ready to take your career global?</p>
                  <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight">Find your dream job abroad with Talex today.</h2>
                  <p className="mt-4 max-w-xl text-slate-200 leading-7">
                    Get matched with top employers, receive complete visa support, and begin your international relocation with confidence.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                  <Link href="/register">
                    <Button size="lg" className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 w-full sm:w-auto">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
