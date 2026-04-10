import { useState } from 'react'
import { api } from '@/utils/api'

export default function PaymentForm() {
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      const res = await api.post('/payments/mpesa/initiate', {
        phone,
        amount,
      })

      alert(res.data.message)
    } catch (err) {
      console.error(err)
      alert('Payment failed')
    }

    setLoading(false)
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">Make Payment</h2>

      <input
        placeholder="Phone Number"
        className="border p-2 w-full"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        className="border p-2 w-full"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <button
        onClick={handlePayment}
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  )
}