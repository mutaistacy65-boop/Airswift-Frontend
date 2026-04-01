import React from 'react'
import MainLayout from '@/layouts/MainLayout'
import Link from 'next/link'

const About: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-6 rounded-lg text-center">
          <h1 className="text-5xl font-bold mb-4">About Airswift</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Connecting talented professionals with their dream jobs across Canada
          </p>
        </div>

        {/* Mission Section */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              At Airswift, we believe that finding the right job should be seamless, transparent, and empowering. Our mission is to revolutionize the job discovery experience by connecting exceptional talent with innovative companies across Canada.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We are committed to breaking down barriers in the job market, providing equal opportunities for professionals at all career levels, and fostering meaningful connections between employers and job seekers.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Our Vision</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 text-lg leading-relaxed">
              To become Canada's most trusted and innovative job portal, recognized for exceptional user experience, comprehensive job listings, and successful career placements. We envision a future where every professional can easily discover opportunities that align with their aspirations and skills.
            </p>
          </div>
        </section>

        {/* Why Choose Airswift */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Why Choose Airswift?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                <span className="text-3xl mr-3">🇨🇦</span> Canada-Focused
              </h3>
              <p className="text-gray-600">
                We specialize exclusively in Canadian job opportunities, from coast to coast. Our deep understanding of the Canadian job market ensures quality listings and relevant matches.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                <span className="text-3xl mr-3">⚡</span> Fast & Efficient
              </h3>
              <p className="text-gray-600">
                Our streamlined application process reduces friction between job seekers and employers. Apply to positions in seconds, not hours.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                <span className="text-3xl mr-3">🎯</span> Smart Matching
              </h3>
              <p className="text-gray-600">
                Our intelligent matching algorithm helps connect you with roles that truly align with your skills, experience, and career goals.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                <span className="text-3xl mr-3">🔒</span> Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data security and privacy are our top priorities. We employ industry-leading encryption and never share your information without consent.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                <span className="text-3xl mr-3">👥</span> Diverse Opportunities
              </h3>
              <p className="text-gray-600">
                From entry-level positions to executive roles, across every industry. Whether you're exploring a new career path or advancing further, Airswift has opportunities for everyone.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
                <span className="text-3xl mr-3">📱</span> Always Connected
              </h3>
              <p className="text-gray-600">
                Access job opportunities anytime, anywhere. Our mobile-optimized platform keeps you connected to your dream job, whether at home or on the go.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Our Key Features</h2>
          <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
            <div className="border-b pb-6 last:border-b-0">
              <h4 className="text-xl font-bold text-primary mb-3">Advanced Search & Filtering</h4>
              <p className="text-gray-600">
                Find the perfect job with our powerful search tools. Filter by location, job type, salary range, industry, and more to narrow down your ideal opportunities.
              </p>
            </div>
            <div className="border-b pb-6 last:border-b-0">
              <h4 className="text-xl font-bold text-primary mb-3">One-Click Applications</h4>
              <p className="text-gray-600">
                Save time and effort with our streamlined application process. Pre-fill your information and apply to multiple positions with just a few clicks.
              </p>
            </div>
            <div className="border-b pb-6 last:border-b-0">
              <h4 className="text-xl font-bold text-primary mb-3">Job Alerts & Notifications</h4>
              <p className="text-gray-600">
                Never miss an opportunity. Set up customized job alerts and receive notifications when positions matching your criteria are posted.
              </p>
            </div>
            <div className="border-b pb-6 last:border-b-0">
              <h4 className="text-xl font-bold text-primary mb-3">Interview Scheduling</h4>
              <p className="text-gray-600">
                Coordinate interviews seamlessly with employers through our integrated scheduling system. No more back-and-forth emails!
              </p>
            </div>
            <div className="border-b pb-6 last:border-b-0">
              <h4 className="text-xl font-bold text-primary mb-3">Professional Profile</h4>
              <p className="text-gray-600">
                Build a comprehensive professional profile showcasing your skills, experience, and achievements. Let employers discover you.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-primary mb-3">Career Insights</h4>
              <p className="text-gray-600">
                Access valuable resources, industry trends, and career advice to help you make informed decisions about your professional journey.
              </p>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Success Stories</h2>
          <p className="text-gray-700 text-lg">
            Thousands of professionals have found their dream jobs through Airswift. Here are some highlights:
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h4 className="text-2xl font-bold text-primary mb-2">5,000+</h4>
              <p className="text-gray-700 font-semibold">Active Job Listings</p>
              <p className="text-gray-600 text-sm mt-2">Positions across all industries in Canada</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h4 className="text-2xl font-bold text-green-600 mb-2">10,000+</h4>
              <p className="text-gray-700 font-semibold">Happy Job Seekers</p>
              <p className="text-gray-600 text-sm mt-2">Successfully placed in their dream roles</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h4 className="text-2xl font-bold text-purple-600 mb-2">95%</h4>
              <p className="text-gray-700 font-semibold">User Satisfaction Rate</p>
              <p className="text-gray-600 text-sm mt-2">Highly satisfied with our platform</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16 px-6 rounded-lg text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Begin Your Journey?</h2>
          <p className="text-xl max-w-2xl mx-auto">
            Join thousands of professionals who have found success with Airswift. Your dream job in Canada is just a few clicks away.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-primary px-8 py-3 rounded font-semibold hover:bg-opacity-90 transition"
          >
            Create Your Account Today
          </Link>
        </section>

        {/* Contact Section */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Get in Touch</h2>
          <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
            <p className="text-gray-700 text-lg">
              Have questions about Airswift? We'd love to hear from you! Contact our support team:
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-primary mb-2">📧 Email</h4>
                <p className="text-gray-600 mb-4">support@airswift.com</p>
                <div className="flex gap-3">
                  <a
                    href="mailto:support@airswift.com"
                    className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition"
                  >
                    Send Email
                  </a>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=support@airswift.com&su=Support%20Inquiry%20from%20Airswift`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
                  >
                    📧 Gmail
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-primary mb-2">📞 Phone</h4>
                <p className="text-gray-600">+1-800-AIRSWIFT</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default About
