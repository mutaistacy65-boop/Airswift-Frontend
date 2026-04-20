import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import AuthService from '@/services/authService';
import { clearAuth, saveAuthState } from '@/utils/authHelpers';
import { validateEmailForAuth } from '@/utils/roleUtils';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (formData: any) => {
    try {
      clearAuth();

      // Use AuthService which handles response normalization
      const result = await AuthService.register(
        formData.name,
        formData.email,
        formData.password
      );

      // Extract normalized token and user
      const token = result.token || result.accessToken || result.data?.token || result.data?.accessToken;
      const user = result.user || result.data?.user || result;

      if (token && user) {
        saveAuthState(token, user);
        router.push(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.response?.data?.message || err?.message || "Registration failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Email validation
    const emailValidation = validateEmailForAuth(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      setLoading(false);
      return;
    }

    try {
      await register(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
