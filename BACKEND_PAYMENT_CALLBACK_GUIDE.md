# M-Pesa Payment Callback Integration Guide

## Backend Implementation for Payment Receipt Email

This guide explains how to integrate the payment receipt email into your M-Pesa callback handler.

### Overview

When a user completes an M-Pesa payment:
1. M-Pesa sends a callback to your server
2. Your server validates and saves the payment
3. **NEW**: Your server sends a receipt email to the user

---

## Step 1: Add Email Template to Backend

### Create/Update `utils/emailTemplates.js` in your backend:

```javascript
exports.paymentReceiptTemplate = ({ name, amount, receipt }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #27ae60; margin: 0;">✅ Payment Successful</h2>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hello <b>${name}</b>,
      </p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Your payment has been received successfully. Thank you for your transaction!
      </p>

      <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
        <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
        <p style="margin: 10px 0;">
          <strong>Amount Paid:</strong> <span style="color: #27ae60; font-size: 18px;">KES ${amount}</span>
        </p>
        <p style="margin: 10px 0;">
          <strong>M-Pesa Receipt:</strong> <span style="font-family: monospace; background: white; padding: 5px 10px; border-radius: 4px;">${receipt}</span>
        </p>
        <p style="margin: 10px 0; color: #666; font-size: 14px;">
          <strong>Transaction Date:</strong> ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        A copy of your receipt has been saved to your account. You can download it anytime from your dashboard.
      </p>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #2e7d32; font-size: 16px;">
          ✨ Your application is one step closer to success! Check your email for next steps.
        </p>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
        Thank you for using <b>Talex</b> 🚀
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

      <p style="font-size: 12px; color: #999; text-align: center;">
        Need help? Contact us at support@talex.com
      </p>
    </div>
  `;
};
```

---

## Step 2: Update Payment Model

Add email tracking fields to your `Payment` model:

```javascript
const paymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  phone: String,
  status: { 
    type: String, 
    enum: ["pending", "success", "failed"],
    default: "pending"
  },
  mpesaReceipt: String,
  
  // ✅ NEW FIELDS
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  emailError: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);
```

---

## Step 3: Update M-Pesa Callback Handler

Modify your callback route to send email:

```javascript
// routes/payments.js or controllers/paymentController.js

const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const User = require("../models/User");
const sendEmail = require("../services/emailService");
const { paymentReceiptTemplate } = require("../utils/emailTemplates");

// M-Pesa Callback Handler
router.post("/callback", async (req, res) => {
  try {
    const body = req.body;
    const resultCode = body.Body.stkCallback.ResultCode;
    const resultDesc = body.Body.stkCallback.ResultDesc;

    // ✅ ADD THIS - HANDLE SUCCESS BLOCK
    if (resultCode === 0) {
      const data = body.Body.stkCallback;
      const metadata = data.CallbackMetadata.Item;

      // Extract M-Pesa receipt number
      const receiptItem = metadata.find(i => i.Name === "MpesaReceiptNumber");
      const receipt = receiptItem?.Value;

      // Extract transaction amount
      const amountItem = metadata.find(i => i.Name === "Amount");
      const amount = amountItem?.Value;

      // Extract phone number
      const phoneItem = metadata.find(i => i.Name === "PhoneNumber");
      const phone = phoneItem?.Value;

      // Find and update payment
      let payment = await Payment.findOne({ phone, amount });
      
      if (!payment) {
        // Create new payment record if not found
        payment = await Payment.create({
          phone,
          amount,
          status: "success",
          mpesaReceipt: receipt,
        });
      } else {
        // Update existing payment
        payment.status = "success";
        payment.mpesaReceipt = receipt;
      }

      // 🎯 SEND EMAIL HERE
      try {
        // ✅ FETCH USER
        const user = await User.findById(payment.user);

        if (user && user.email) {
          // ✅ SEND EMAIL
          await sendEmail(
            user.email,
            "Payment Receipt - Talex",
            paymentReceiptTemplate({
              name: user.name,
              amount: payment.amount,
              receipt,
            })
          );

          // ✅ MARK EMAIL AS SENT
          payment.emailSent = true;
          payment.emailSentAt = new Date();
        }
      } catch (emailError) {
        console.error("❌ Failed to send email:", emailError);
        payment.emailError = emailError.message;
        // Don't fail the payment if email fails
      }

      // Save payment
      await payment.save();

      console.log("✅ Payment processed and email sent");
      return res.json({ success: true, message: "Payment received" });
    }

    // Handle failure case
    console.log("❌ Payment failed:", resultDesc);
    
    // Find and update payment as failed
    const payment = await Payment.findOne({ 
      status: "pending",
      $expr: { $gte: [{ $subtract: [new Date(), "$createdAt"] }, 5 * 60 * 1000] }
    });

    if (payment) {
      payment.status = "failed";
      await payment.save();
    }

    return res.json({ success: false, message: resultDesc });

  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## Step 4: Verify Email Service

Make sure your email service is configured:

```javascript
// services/emailService.js

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Using Brevo (Sendinblue)
    const SibApiV3Sdk = require("sib-api-v3-sdk");
    
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    await emailApi.sendTransacEmail({
      sender: { email: "no-reply@talex.com", name: "Talex Jobs" },
      to: [{ email: to }],
      subject,
      htmlContent,
    });

    console.log("✅ Email sent to", to);
    return true;
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
};

module.exports = sendEmail;
```

---

## Step 5: Environment Variables

Ensure these are set in your backend `.env`:

```env
# Email Service
BREVO_API_KEY=your_brevo_api_key

# M-Pesa
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=123456
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/callback
```

---

## Step 6: Testing Checklist

- [ ] M-Pesa payment completes successfully
- [ ] Payment record is created/updated in database
- [ ] M-Pesa receipt number is captured
- [ ] Email is sent to user
- [ ] Email contains correct payment details
- [ ] `emailSent` flag is set to `true`
- [ ] Dashboard shows payment history
- [ ] User receives email within 5 seconds of payment

---

## Troubleshooting

### Email Not Sent

**Check:**
1. BREVO_API_KEY is set correctly
2. User email address is valid
3. Check console logs for email errors
4. Verify `payment.emailSent` flag in database

**Debug:**
```javascript
// Add logging to email function
console.log("Sending email to:", to);
console.log("Subject:", subject);
console.log("Template data:", { name, amount, receipt });
```

### Payment Not Found

**Issue:** Callback processed but payment record not found

**Solution:**
1. Ensure payment is created before callback
2. Or automatically create payment in callback handler
3. Match by phone + amount + timestamp

### Callback Not Received

**Check:**
1. Callback URL is publicly accessible
2. URL is configured in M-Pesa dashboard
3. Your firewall allows POST requests
4. No authentication blocking the callback

---

## Frontend User Flow

After payment is complete, the user sees:

1. **Payment Alert**: "✅ Payment successful! Receipt sent to your email."
2. **Email Received**: User receives professional receipt email with:
   - Amount paid
   - M-Pesa receipt number
   - Transaction date
   - Next steps message

---

## Summary

By implementing this system:
- ✅ Users get instant email confirmation
- ✅ Professional receipt template
- ✅ Payment tracking in dashboard
- ✅ Email status in database
- ✅ Better user experience
- ✅ Audit trail for payments
