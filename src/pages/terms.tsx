import React from 'react'
import MainLayout from '@/layouts/MainLayout'

const TermsAndConditions: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-6 rounded-lg text-center">
          <h1 className="text-5xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Please read these terms carefully before using our services
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
              Welcome to Airswift ("we," "us," or "our"). These Terms and Conditions ("Terms") govern your use of our website, mobile application, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Airswift is a job portal connecting talented professionals with employers across Canada. Our platform facilitates job searching, application submission, and career development services.
            </p>
          </section>

          {/* User Accounts */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">2. User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-800">2.1 Account Registration</h3>
            <p className="text-gray-700 leading-relaxed">
              To access certain features of our Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">2.2 Account Security</h3>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">2.3 Account Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          {/* Services */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">3. Services</h2>
            <h3 className="text-xl font-semibold text-gray-800">3.1 Job Portal Services</h3>
            <p className="text-gray-700 leading-relaxed">
              Airswift provides a platform for job seekers to search and apply for jobs, and for employers to post job opportunities and review applications. We do not guarantee job placement or employment outcomes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">3.2 Premium Services</h3>
            <p className="text-gray-700 leading-relaxed">
              Certain features may require payment of fees. These include but are not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Enhanced profile visibility</li>
              <li>Priority application processing</li>
              <li>Advanced search filters</li>
              <li>Career counseling services</li>
              <li>Resume review and optimization</li>
            </ul>
          </section>

          {/* Fees and Payment - NON-REFUNDABLE */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">4. Fees and Payment</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ IMPORTANT: NON-REFUNDABLE FEES</h3>
              <p className="text-red-700 font-medium">
                All fees paid for our services are NON-REFUNDABLE under any circumstances. This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                <li>Premium subscription fees</li>
                <li>Service upgrade fees</li>
                <li>One-time service fees</li>
                <li>Any other charges incurred through our platform</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800">4.1 Payment Terms</h3>
            <p className="text-gray-700 leading-relaxed">
              All fees are payable in advance and are due at the time of purchase. We accept major credit cards, debit cards, and other payment methods as indicated on our platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4.2 Billing and Renewals</h3>
            <p className="text-gray-700 leading-relaxed">
              For subscription services, billing will occur on a recurring basis (monthly, annually, etc.) as selected by you. You authorize us to charge your payment method for all fees incurred.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4.3 Price Changes</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to change our fees at any time. Any fee changes will be communicated to you in advance, and you will have the option to cancel your subscription if you do not agree to the new fees.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4.4 Late Payments</h3>
            <p className="text-gray-700 leading-relaxed">
              If payment is not received by the due date, we may suspend or terminate your access to premium services without notice.
            </p>
          </section>

          {/* Refund Policy */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">5. Refund Policy</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-800 mb-3">NO REFUNDS POLICY</h3>
              <p className="text-red-700 leading-relaxed mb-3">
                <strong>All payments made to Airswift are final and non-refundable.</strong> We do not offer refunds, credits, or exchanges for any fees paid, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-2 mb-4">
                <li>Subscription fees (monthly, annual, or any other duration)</li>
                <li>One-time service fees</li>
                <li>Premium feature access fees</li>
                <li>Any other charges incurred through our platform</li>
              </ul>
              <p className="text-red-700 leading-relaxed">
                This policy applies regardless of whether you use the service, cancel your account, or for any other reason. By making a payment, you acknowledge and agree that you are purchasing digital services that are immediately accessible and consumable.
              </p>
            </div>
          </section>

          {/* User Conduct */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">6. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Post or transmit any content that is harmful, offensive, or inappropriate</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service for any commercial purpose without our written consent</li>
              <li>Submit false or misleading information</li>
            </ul>
          </section>

          {/* Content and Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">7. Content and Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-gray-800">7.1 User Content</h3>
            <p className="text-gray-700 leading-relaxed">
              You retain ownership of content you submit to our Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with our Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">7.2 Our Content</h3>
            <p className="text-gray-700 leading-relaxed">
              All content on our Service, including but not limited to text, graphics, logos, and software, is owned by us or our licensors and is protected by copyright and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">7.3 Prohibited Content</h3>
            <p className="text-gray-700 leading-relaxed">
              You may not post content that infringes on the intellectual property rights of others or that contains viruses, malware, or other harmful code.
            </p>
          </section>

          {/* Privacy */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">8. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our Service, you agree to our collection and use of information as described in our Privacy Policy.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">9. Disclaimers</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or secure. We disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We do not guarantee job placement or employment outcomes. The Service is a platform for connecting job seekers with employers, but we are not responsible for the actions of employers or the success of job applications.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">10. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claim arising out of or relating to these Terms or our Service shall not exceed the amount paid by you for our services in the 12 months preceding the claim.
            </p>
          </section>

          {/* Indemnification */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">11. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold us harmless from any claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to your use of our Service, your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">12. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and access to our Service immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your right to use our Service will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">13. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Ontario, Canada, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of Ontario, Canada.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">14. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on our website and updating the "Last Updated" date. Your continued use of our Service after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@airswift.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +1-800-AIRSWIFT</p>
              <p className="text-gray-700"><strong>Address:</strong> 1500 King Street West, Toronto, ON M5H 1A1, Canada</p>
            </div>
          </section>

          {/* Agreement */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">16. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms constitute the entire agreement between you and us regarding our Service and supersede all prior agreements and understandings, whether written or oral.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export default TermsAndConditions
