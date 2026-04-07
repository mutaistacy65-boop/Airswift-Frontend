import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import OTPInput from "../components/OTPInput";
import axios from 'axios';

export default function VerifyOTP() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegistration, setIsRegistration] = useState(false);

  useEffect(() => {
    const { email: emailParam, type } = router.query;
    
    // Determine verification type: registration, verification, or general
    const verifyType = type || localStorage.getItem('verifyType');
    const isVerificationFlow = type === 'verification' || verifyType === 'verification';
    setIsRegistration(type === 'registration' || verifyType === 'registration');
    
    if (emailParam) {
      setEmail(emailParam);
      // Also store in localStorage for consistency
      localStorage.setItem('verifyEmail', emailParam);
      // Store verification type
      if (type) {
        localStorage.setItem('verifyType', type);
      }
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
      // Use verify-registration-otp for registration, verify-otp for general verification
      const endpoint = isRegistration ? '/api/auth/verify-registration-otp' : '/api/auth/verify-otp';
      
      const response = await axios.post(endpoint, {
        email,
        otp
      });

      alert("Verified successfully");
      
      // Clear verification type from localStorage
      localStorage.removeItem('verifyType');

      // 👉 Redirect based on verification type
      if (isRegistration) {
        // Registration complete, redirect to login
        router.push('/login');
      } else {
        // For verification flow, the user should be logged in now
        // The verify-otp API should return authentication tokens
        const { user, accessToken } = response.data;
        
        if (user && accessToken) {
          // Store authentication data
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('role', user.role);
          
          // Redirect based on role
          if (user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
          // Fallback to dashboard if no auth data
          router.push('/dashboard');
        }
      }

    } catch (err) {
      console.error('Verification error:', err);
      alert(err.response?.data?.message || "Invalid OTP");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setMessage("Resending OTP...");

    try {
      // Determine which endpoint to use based on verification type
      let endpoint;
      if (isRegistration) {
        endpoint = '/api/auth/send-registration-otp';
      } else {
        // For verification flow, use resend-verification
        endpoint = '/api/auth/resend-verification';
      }
      
      await axios.post(endpoint, { email });
      setMessage("📩 OTP resent successfully!");
    } catch (err) {
      setMessage("❌ Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      
      <div className="bg-white p-8 rounded-xl shadow-md w-[350px] text-center">
        
        <h2 className="text-2xl font-bold mb-2">
          {isRegistration ? 'Verify Your Account' : 'Verify Code'}
        </h2>
        <p className="text-gray-500 mb-6">
          {isRegistration 
            ? 'Enter the 6-digit OTP code sent to your email to complete registration'
            : 'Enter the 6-digit code sent to your email'
          }
        </p>

        <OTPInput length={6} onComplete={handleComplete} />

        <p className="text-sm text-gray-400 mt-6">
          Didn't receive code? <span className="text-blue-600 cursor-pointer" onClick={handleResend}>Resend OTP</span>
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