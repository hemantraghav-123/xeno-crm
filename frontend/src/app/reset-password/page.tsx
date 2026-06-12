"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { Sparkles, Lock, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset token is missing. Please request a new link.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", { token, password });
      setSuccess(response.data.message || "Password reset successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl relative overflow-hidden space-y-6">
      
      {/* Glow decoration */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Branding header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl mb-2">
          <Sparkles className="h-6 w-6 text-indigo-500 dark:text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Reset Password</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Enter your new password below
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-800 dark:text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success ? (
        <div className="space-y-4 text-center">
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs text-left">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium">{success}</span>
          </div>

          <Link
            href="/login"
            className="w-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
          >
            Go to Sign In
          </Link>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all text-zinc-900 dark:text-zinc-50"
              />
              <Lock className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {!success && (
        <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-zinc-500 text-xs font-medium">Loading form...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
