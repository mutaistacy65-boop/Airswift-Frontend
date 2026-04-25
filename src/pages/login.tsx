"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { clearAuth } from "@/lib/auth";
import { validateEmailForAuth } from "@/utils/roleUtils";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import AuthService from "@/services/authService";
import { redirectAfterLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const emailValidation = validateEmailForAuth(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        return;
      }

      clearAuth();

      const result = await AuthService.login(email, password);

      // ⚠️ Check if account is not verified
      if ((result as any).code === 'ACCOUNT_NOT_VERIFIED') {
        setError((result as any).message || "Your account has not been verified yet. Check your email for the verification link.");
        
        // Optional: Offer to resend verification link
        setTimeout(() => {
          const resendOption = window.confirm(
            'Would you like us to resend the verification link to your email?'
          );
          if (resendOption) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }
        }, 2000);
        
        return;
      }

      if (result.success) {
        const normalizedUser = AuthService.normalizeUser(result.user);
        console.log('✅ Login successful, redirecting...', normalizedUser);

        await login({ token: result.token, user: normalizedUser });
        await new Promise((resolve) => setTimeout(resolve, 0));
        await redirectAfterLogin(normalizedUser, router);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error("❌ [Login] Error:", err);
      
      // Handle specific error codes from backend
      if (err.response?.data?.code === 'ACCOUNT_NOT_VERIFIED') {
        setError(err.response.data.message || "Your account has not been verified yet. Check your email for the verification link.");
        
        // Auto-offer to resend after a moment
        setTimeout(() => {
          const resendOption = window.confirm(
            'Would you like us to resend the verification link?'
          );
          if (resendOption) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }
        }, 2000);
      } else {
        setError(err.response?.data?.message || err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      // Clear any existing auth state first
      clearAuth();

      // Send Google credential to backend
      const res = await fetch("https://airswift-backend-fjt3.onrender.com/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!res.ok) {
        throw new Error("Google authentication failed");
      }

      const responseData = await res.json();

      // Normalize response structure
      const token = responseData.token || responseData.accessToken || responseData.data?.token || responseData.data?.accessToken;
      const user = responseData.user || responseData.data?.user || responseData;

      if (!token || !user) {
        throw new Error("Invalid response from Google authentication");
      }

      // Email validation for Google login
      const emailValidation = validateEmailForAuth(user?.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        return;
      }

      if (user?.role?.toLowerCase() === 'admin') {
        setError("Admin login not allowed with Google. Please use email/password.");
        return;
      }

      await login({ token, user });
      await redirectAfterLogin(user, router);

    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  useEffect(() => {
    if (user && router.pathname === '/login') {
      redirectAfterLogin(user, router);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Decorative animated blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-5000"></div>

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Main card with glass effect */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.svg"
              alt="TALEX Logo"
              className="h-16 w-auto drop-shadow-lg"
            />
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-base font-medium">
              Sign in to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="absolute right-4 top-3.5 text-gray-400">📧</span>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 pr-12 group-hover:border-gray-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2.5">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer font-medium">
                Keep me signed in
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2 text-lg">
                  <span className="inline-block animate-spin">⌛</span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-lg">
                  🔐 Sign In
                </span>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-3 text-gray-400 text-xs font-bold uppercase tracking-widest">OR</span>
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google Login */}
          <div className="w-full mb-8">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition">
                Create one free
              </Link>
            </p>
          </div>

        </div>

        {/* Footer Links */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline transition">
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline transition">
            Privacy Policy
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-5000 {
          animation-delay: 5s;
        }
      `}</style>
    </div>
  );
}
