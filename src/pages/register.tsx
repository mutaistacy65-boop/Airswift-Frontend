import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import API from "@/services/apiClient";
import { clearAuth } from '@/lib/auth';
import { validateGmailEmail, getGmailHint } from '@/utils/gmailValidation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'form' | 'success'>('form');
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Email validation - enforce Gmail only
    const emailValidation = validateGmailEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      setLoading(false);
      return;
    }

    try {
      clearAuth();

      // Send registration request
      const result = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user'
      });

      console.log("Registration response:", result.data);

      // Handle the response
      if (result.data.code === 'REGISTRATION_SUCCESS') {
        // New user created - show verification email screen
        setRegisteredEmail(formData.email);
        setRegistrationStatus('success');
        setFormData({ name: "", email: "", password: "" });
      } else if (result.data.code === 'VERIFICATION_EMAIL_RESENT') {
        // Unverified user tried to register again - show verification email screen
        setRegisteredEmail(formData.email);
        setRegistrationStatus('success');
        setFormData({ name: "", email: "", password: "" });
      } else {
        // Unexpected response
        setError(result.data.message || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Handle specific error codes
      if (err.response?.data?.code === 'USER_EXISTS') {
        setError("An account with this email already exists. Please log in.");
      } else if (err.response?.data?.code === 'RATE_LIMIT_EXCEEDED') {
        setError(err.response.data.message || "Too many registration attempts. Please try again later.");
      } else if (err.response?.data?.code === 'EMAIL_SEND_FAILED') {
        setError("Failed to send verification email. Please try again.");
      } else {
        setError(err.response?.data?.message || err?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Registration form view
  if (registrationStatus === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Airswift
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Join our platform to find opportunities
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="yourname@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                📧 {getGmailHint()}
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            {/* Terms Agreement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-600">
              <p className="margin-0">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {/* Security Note */}
          <div className="text-xs text-gray-500 text-center mt-4 pt-4 border-t border-gray-200">
            <p>
              🔒 Your password is securely encrypted. We never share your data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success screen - prompt to verify email
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {/* Success Icon */}
        <div style={{
          fontSize: "64px",
          marginBottom: "20px"
        }}>
          ✓
        </div>

        <h1 className="text-3xl font-bold text-green-700 mb-3">Check Your Email</h1>
        <p className="text-gray-600 mb-4">
          An activation link has been sent to your email address.
        </p>

        {/* Email Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="font-mono text-blue-900">{registeredEmail}</p>
        </div>

        <p className="text-gray-600 mb-3">
          The email may take a few minutes to arrive. Don't forget to check your spam folder.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Activation links expire after 24 hours. Make sure to use it promptly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Send Another Email
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Back to Login
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
          Having issues?{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

