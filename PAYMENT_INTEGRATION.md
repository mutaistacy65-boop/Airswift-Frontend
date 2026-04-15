# Payment Integration Guide

## Overview
This guide shows how to integrate M-Pesa payment validation into your application submission flow.

## 1. Admin Settings Configuration

M-Pesa credentials are configured in `/admin/settings`:
- **Consumer Key**: Safaricom API Consumer Key
- **Consumer Secret**: Safaricom API Consumer Secret
- **Shortcode**: M-Pesa Till Number (e.g., 123456)
- **Passkey**: OAuth2 Passkey for Safaricom API
- **Callback URL**: URL to receive payment status updates

## 2. Payment Handler Function

```javascript
// 📱 FRONTEND PAYMENT BUTTON
const handlePay = async () => {
  setPaymentProcessing(true);
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      "https://airswift-backend-fjt3.onrender.com/api/payments/pay",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: "+2547XXXXXXXX",
          amount: 100,
        }),
      }
    );

    const data = await res.json();
    alert("📱 Check your phone to complete payment");
  } catch (error) {
    console.error("Payment error:", error);
    alert("❌ Payment failed");
  } finally {
    setPaymentProcessing(false);
  }
};
```

## 3. Connect to Application Flow

### Before Application Submission:

```javascript
const [paymentSuccess, setPaymentSuccess] = useState(false);

const handleApplicationSubmit = async () => {
  // ✅ 8. CONNECT TO APPLICATION FLOW
  if (!paymentSuccess) {
    alert("Please complete payment first");
    return;
  }

  // Proceed with application submission
  await submitApplication();
};
```

### Complete Application Form Example:

```jsx
const [form, setForm] = useState({...});
const [paymentSuccess, setPaymentSuccess] = useState(false);

const handlePay = async () => {
  // Payment logic...
  setPaymentSuccess(true);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Check payment status
  if (!paymentSuccess) {
    alert("Please complete payment first");
    return;
  }

  // Submit application
  try {
    const res = await fetch(
      "https://airswift-backend-fjt3.onrender.com/api/applications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      }
    );

    alert("✅ Application submitted successfully");
  } catch (error) {
    alert("❌ Failed to submit application");
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}

    {!paymentSuccess ? (
      <button
        type="button"
        onClick={handlePay}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        💳 Pay to Apply (100 KES)
      </button>
    ) : (
      <p className="text-green-600 font-semibold">✅ Payment Complete</p>
    )}

    <button
      type="submit"
      disabled={!paymentSuccess}
      className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
    >
      Submit Application
    </button>
  </form>
);
```

## 4. Payment Flow Diagram

```
User fills form → Pay button appears
     ↓
User clicks Pay → M-Pesa prompt on phone
     ↓
User completes M-Pesa payment
     ↓
Backend validates payment
     ↓
paymentSuccess = true
     ↓
Submit button becomes enabled
     ↓
User submits application
     ↓
Application created in database
```

## 5. Backend Endpoints Required

- `POST /api/payments/pay` - Initiate M-Pesa payment
- `POST /api/payments/callback` - Receive M-Pesa status updates
- `GET /api/payments/:id` - Check payment status
- `PUT /api/settings` - Save M-Pesa configuration

## 6. Environment Variables

Backend should have:
```
MPESA_CONSUMER_KEY=xxxxx
MPESA_CONSUMER_SECRET=xxxxx
MPESA_SHORTCODE=xxxxx
MPESA_PASSKEY=xxxxx
MPESA_CALLBACK_URL=https://yourapp.com/api/payments/callback
```

## 7. Testing

### Test Mode
- Use test credentials from Safaricom
- Test with valid Kenyan phone numbers
- Verify callback URL is accessible

### Production
- Replace test credentials with live credentials
- Ensure HTTPS for callback URL
- Monitor payment logs in audit section
