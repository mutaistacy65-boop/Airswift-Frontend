import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { verifyOTP, registerUser } from "@/api/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingEmail = localStorage.getItem('pendingEmail')
      if (pendingEmail) setEmail(pendingEmail)
    }
  }, [])

  const verify = async () => {
    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingName");
      localStorage.removeItem("pendingPassword");

      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) {
      setError("Email is required to resend OTP");
      return;
    }

    setResending(true);
    setResendMessage("");
    setError("");

    try {
      // Get stored registration data
      const name = localStorage.getItem("pendingName") || "";
      const password = localStorage.getItem("pendingPassword") || "";

      if (!name || !password) {
        setError("Registration data not found. Please register again.");
        router.push("/register");
        return;
      }

      await registerUser({ name, email, password });
      setResendMessage("✅ OTP resent to your email!");
      setTimeout(() => setResendMessage(""), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-accent p-12 flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8">
            <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-lg opacity-90 mb-8">
            We've sent a verification code to your email address. Enter it below to complete registration.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Quick Verification
            </div>
          </div>
        </div>
      </div>

      {/* Right side - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Talex</h1>
            <p className="text-gray-600 mt-2">Verify Your Email</p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
            <p className="text-gray-600">We've sent a code to your email</p>
          </div>

          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="bg-gray-50"
            />

            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter the 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.toUpperCase())}
              maxLength={6}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {resendMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">{resendMessage}</p>
              </div>
            )}

            <Button
              onClick={verify}
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full text-white"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              onClick={resend}
              disabled={resending}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {resending ? "Resending..." : "Resend Code"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Didn't receive the code? Check your spam folder or{' '}
              <button 
                onClick={resend}
                className="font-medium text-primary hover:text-secondary transition-colors"
              >
                try again
              </button>
            </p>
          </div>

          <div className="text-center border-t pt-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-secondary transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
