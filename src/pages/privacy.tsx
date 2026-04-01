import React from 'react'
import MainLayout from '@/layouts/MainLayout'

const PrivacyPolicy: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-6 rounded-lg text-center">
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl max-w-2xl mx-auto">
            How we collect, use, and protect your personal information
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Last Updated */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Last Updated:</strong> April 1, 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Airswift ("we," "us," or "our"), we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800">2.1 Personal Information</h3>
            <p className="text-gray-700 leading-relaxed">
              We may collect personal information that you provide directly to us, such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Name, email address, phone number</li>
              <li>Professional information (resume, work experience, education)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely by third-party providers)</li>
              <li>Communications you send to us</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800">2.2 Usage Information</h3>
            <p className="text-gray-700 leading-relaxed">
              We automatically collect certain information about your use of our Service:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>IP address and location information</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent on our Service</li>
              <li>Referral sources</li>
              <li>Search queries and job preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800">2.3 Cookies and Tracking Technologies</h3>
            <p className="text-gray-700 leading-relaxed">
              We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Providing and maintaining our Service</li>
              <li>Processing job applications and connecting you with employers</li>
              <li>Creating and managing your account</li>
              <li>Communicating with you about our services</li>
              <li>Personalizing your experience and providing relevant job recommendations</li>
              <li>Analyzing usage patterns to improve our Service</li>
              <li>Ensuring security and preventing fraud</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4.1 With Employers</h3>
            <p className="text-gray-700 leading-relaxed">
              When you apply for jobs through our platform, we share your application materials (resume, cover letter, etc.) with the relevant employers. We only share information necessary for the job application process.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4.2 Service Providers</h3>
            <p className="text-gray-700 leading-relaxed">
              We may share information with trusted third-party service providers who assist us in operating our Service, such as payment processors, email service providers, and analytics companies. These providers are contractually obligated to protect your information.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4.3 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law, court order, or government request, or if we believe such disclosure is necessary to protect our rights, safety, or the rights and safety of others.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4.4 Business Transfers</h3>
            <p className="text-gray-700 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity. We will notify you before your information is transferred and becomes subject to a different privacy policy.
            </p>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication procedures</li>
              <li>Secure data centers and infrastructure</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Specific retention periods vary depending on the type of information and the purpose for which it was collected.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may request deletion of your account and personal information at any time. However, some information may be retained for legal compliance or legitimate business purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal limitations)</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications or certain data processing</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">9. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">10. Third-Party Links and Services</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties. We encourage you to review the privacy policies of any third-party services you use.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We may also send you an email notification.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of our Service after any changes constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@airswift.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +1-800-AIRSWIFT</p>
              <p className="text-gray-700"><strong>Address:</strong> 1500 King Street West, Toronto, ON M5H 1A1, Canada</p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              For privacy-related concerns, you may also contact our Data Protection Officer at dpo@airswift.com.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export default PrivacyPolicy
