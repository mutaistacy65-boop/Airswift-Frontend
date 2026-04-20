"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { loginUser } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { clearAuth } from "@/utils/authHelpers";
import { getPostLoginPath, validateEmailForAuth } from "@/utils/roleUtils";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import AuthService from "@/services/authService";
import { redirectAfterLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshUser, user } = useAuth();

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
      // Email validation and role assignment logic
      const emailValidation = validateEmailForAuth(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        return;
      }

      clearAuth();

      const result = await AuthService.login(email, password);

      if (result.success) {
        // ✅ This handles the redirect automatically
        redirectAfterLogin(result.user, router);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
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

      AuthService.storeToken(token, user);
      redirectAfterLogin(user, router);

    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        {/* 🔥 LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.svg"
            alt="TALEX Logo"
            className="h-16 w-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          Sign In
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Access your account to continue
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password with toggle 👁️ */}
          <div className="relative">
            <label className="text-sm font-medium">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* 🔥 Google Login */}
        <div className="w-full">
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

        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Create one
          </a>
        </p>

      </div>
    </div>
  );
}
