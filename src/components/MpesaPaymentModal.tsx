import React, { useState } from 'react'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'

interface MpesaPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (phoneNumber: string) => Promise<void>
  amount: number
  description: string
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  description,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePhoneNumber = (phone: string): boolean => {
    // Accept formats: 0712345678, 254712345678, +254712345678, 712345678
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 9 || cleanPhone.length === 12
  }

  const handleSubmit = async () => {
    setError('')

    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Invalid phone number format. Use: 0712345678 or 254712345678')
      return
    }

    setLoading(true)
    try {
      await onConfirm(phoneNumber)
      setPhoneNumber('')
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="M-Pesa Payment"
      onClose={() => {
        setPhoneNumber('')
        setError('')
        onClose()
      }}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Amount:</strong> KES {amount.toLocaleString()}
          </p>
          <p className="text-sm text-blue-800 mt-1">
            <strong>Service:</strong> {description}
          </p>
        </div>

        <Input
          label="M-Pesa Phone Number"
          placeholder="0712345678 or 254712345678"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setError('')
          }}
          error={error}
          required
        />

        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
          <p className="font-semibold mb-2">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your M-Pesa registered phone number</li>
            <li>You will receive an STK prompt on your phone</li>
            <li>Enter your M-Pesa PIN to complete the transaction</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setPhoneNumber('')
              setError('')
              onClose()
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default MpesaPaymentModal
