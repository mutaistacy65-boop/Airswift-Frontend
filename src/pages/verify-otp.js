import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import OTPInput from "../components/OTPInput";
import { verifyOTP } from '../api/auth'

export default function VerifyOTP() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem('verifyEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email in localStorage, redirect to login
      router.push('/login');
    }
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    console.log("OTP:", otp);

    try {
      const data = await verifyOTP(email, otp)

      setMessage("✅ OTP Verified Successfully!");

      // Clear stored email after successful verification
      localStorage.removeItem('verifyEmail');

      // After OTP verification, redirect back to login page for user to login again
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error) {
      setMessage(error?.message || 'Invalid OTP')
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setMessage("Resending OTP...");

    try {
      const res = await fetch(
        "https://airswift-backend-fjt3.onrender.com/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("📩 OTP resent successfully!");
      } else {
        setMessage(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      setMessage("❌ Error resending OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          Verify Your Email
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleVerify}>
          <OTPInput onChange={setOtp} />

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResend}
          className="w-full mt-3 text-blue-500 hover:underline text-sm"
        >
          Resend Code
        </button>

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