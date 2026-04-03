import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useNotification } from "@/context/NotificationContext";

const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();
  const router = useRouter();
  const { email } = router.query;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      addNotification("OTP is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      router.push("/");
      addNotification("OTP verified! Please login.", "success");
    } catch (error: any) {
      addNotification(error.message || "OTP verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#4f46e5,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              AIRSWIFT
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Secure Access Portal
            </p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-slate-300 text-sm">
              Enter the OTP sent to your email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-center text-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2"
              loading={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to AIRSWIFT Terms & Privacy Policy
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPPage;