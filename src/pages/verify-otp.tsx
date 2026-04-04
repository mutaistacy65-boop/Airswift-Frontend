import React, { useState } from "react";
import { useRouter } from "next/router";
import { verifyOTP, registerUser } from "@/api/auth";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingEmail = localStorage.getItem('pendingEmail')
      if (pendingEmail) setEmail(pendingEmail)
    }
  }, [])

  const verify = async () => {
    if (!email || !otp) {
      alert("Email and OTP are required");
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      localStorage.removeItem("pendingEmail");

      alert("Email verified successfully! You can now login.");
      router.push("/login");
    } catch (err: any) {
      alert(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) {
      alert("Email is required to resend OTP");
      return;
    }

    try {
      // Get stored registration data
      const name = localStorage.getItem("pendingName") || "";
      const password = localStorage.getItem("pendingPassword") || "";

      if (!name || !password) {
        alert("Registration data not found. Please register again.");
        router.push("/register");
        return;
      }

      await registerUser({ name, email, password });
      alert("OTP resent to your email");
    } catch (err: any) {
      alert(err?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="p-6 shadow-lg rounded-xl w-96 bg-white">
        <h2 className="text-xl font-bold mb-4">Verify OTP</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full mb-3 p-2 border rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          onClick={verify}
          className="bg-green-600 text-white w-full py-2 rounded mb-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          onClick={resend}
          className="bg-gray-500 text-white w-full py-2 rounded"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}
