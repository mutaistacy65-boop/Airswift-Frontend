import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Receipt, ArrowRight, Home } from 'lucide-react'
import Button from '@/components/Button'
import { useAuth } from '@/context/AuthContext'

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [transactionId, setTransactionId] = useState('')
  const [amount, setAmount] = useState('')
  const [serviceType, setServiceType] = useState('')

  useEffect(() => {
    // Get payment details from URL params or localStorage
    const { transaction_id, amount: amt, service } = router.query
    if (transaction_id) setTransactionId(transaction_id as string)
    if (amt) setAmount(amt as string)
    if (service) setServiceType(service as string)

    // Fallback to localStorage if not in URL
    if (!transaction_id) {
      const stored = localStorage.getItem('payment_success')
      if (stored) {
        const data = JSON.parse(stored)
        setTransactionId(data.transactionId)
        setAmount(data.amount)
        setServiceType(data.serviceType)
        localStorage.removeItem('payment_success')
      }
    }
  }, [router.query])

  const handleDownloadReceipt = () => {
    // In a real app, this would generate/download a PDF receipt
    alert('Receipt download feature would be implemented here')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Success Card */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6"
          >
            <CheckCircle className="text-white" size={40} />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-slate-400 mb-8">
            Your payment has been processed successfully
          </p>

          {/* Receipt Info */}
          <div className="bg-white/5 rounded-xl p-6 mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-2">
                <Receipt size={16} />
                Transaction ID
              </span>
              <span className="font-mono text-sm">{transactionId || 'TXN-123456789'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Amount Paid</span>
              <span className="font-bold text-green-400">
                {serviceType === 'Interview Fee' ? 'USD' : 'KES'} {amount || (serviceType === 'Interview Fee' ? '3' : '30,000')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Service</span>
              <span className="capitalize">{serviceType || 'Visa Processing'}</span>
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
            <p className="text-blue-300 text-sm">
              {serviceType === 'Interview Fee' ? (
                <>
                  <strong>Interview scheduled!</strong><br />
                  Your AI voice interview has been scheduled. You will receive details via email and SMS.
                </>
              ) : (
                <>
                  <strong>Visa processing started!</strong><br />
                  You will receive updates via email and SMS. Processing typically takes 2-4 weeks.
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleDownloadReceipt}
              className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Receipt
            </Button>

            <Link href="/job-seeker/dashboard">
              <Button className="w-full bg-white/10 hover:bg-white/20 border border-indigo-400/50 flex items-center justify-center gap-2">
                <Home size={18} />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@talex.com" className="text-indigo-400 hover:text-indigo-300">
                support@talex.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentSuccessPage