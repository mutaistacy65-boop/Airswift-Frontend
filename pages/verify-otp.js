import { useState } from "react";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://airswift-backend-fjt3.onrender.com/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Verification failed");

      setMessage(data.message || "OTP verified successfully.");
      setEmail("");
      setOtp("");
    } catch (err) {
      setError(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center gap-6 p-12 bg-gradient-to-br from-sky-700 via-cyan-600 to-emerald-500 text-white">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm font-semibold opacity-90">
              Airswift Secure Access
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Verify your email to finish signing up.
            </h1>
          </div>

          <p className="text-slate-100/90 text-base leading-7">
            Enter the one-time password sent to your inbox. This helps us protect your account and keep your profile secure.
          </p>

          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md border border-white/10">
            <h2 className="text-lg font-semibold">Need help?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200/90">
              If you didn&apos;t receive the code, check your spam folder or request a new one from the form.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm text-sky-600 font-semibold uppercase tracking-[0.25em]">
                Verify OTP
              </p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                Enter your verification code
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                We sent a 6-digit code to your email address. Use it below to complete verification.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleVerify}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Verification code</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <p>
                Can&apos;t find the code? Please wait a moment, then request a new OTP from the email you used to sign up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
