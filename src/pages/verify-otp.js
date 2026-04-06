import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import OTPInput from "../components/OTPInput";
import axios from 'axios';

export default function VerifyOTP() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const { email: emailParam } = router.query;
    
    if (emailParam) {
      setEmail(emailParam);
      // Also store in localStorage for consistency
      localStorage.setItem('verifyEmail', emailParam);
    } else {
      const storedEmail = localStorage.getItem('verifyEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        // If no email in localStorage or query param, redirect to login
        router.push('/login');
      }
    }
  }, [router.query]);

  const handleComplete = async (otp) => {
    setLoading(true);
    setMessage("");

    try {
      await axios.post('/api/auth/verify-otp', {
        email,
        otp
      });

      alert("Verified successfully");

      // 👉 Redirect back to login
      router.push('/login');

    } catch (err) {
      alert("Invalid OTP");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setMessage("Resending OTP...");

    try {
      await axios.post('/api/auth/resend-otp', { email });
      setMessage("📩 OTP resent successfully!");
    } catch (err) {
      setMessage("❌ Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      
      <div className="bg-white p-8 rounded-xl shadow-md w-[350px] text-center">
        
        <h2 className="text-2xl font-bold mb-2">Verify Code</h2>
        <p className="text-gray-500 mb-6">
          Enter the 6-digit code sent to your email
        </p>

        <OTPInput length={6} onComplete={handleComplete} />

        <p className="text-sm text-gray-400 mt-6">
          Didn’t receive code? <span className="text-blue-600 cursor-pointer" onClick={handleResend}>Resend</span>
        </p>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">{message}</p>
        )}

        {loading && (
          <p className="text-center mt-2 text-sm text-blue-600">Verifying...</p>
        )}
      </div>
    </div>
  );
}