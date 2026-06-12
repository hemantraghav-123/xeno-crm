"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSigningIn(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl relative overflow-hidden space-y-6">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl mb-2">
            <Sparkles className="h-6 w-6 text-indigo-500 dark:text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Welcome back</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Sign in to access your CRM and Campaign insights
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-800 dark:text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition-all text-zinc-900 dark:text-zinc-50"
              />
              <Mail className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Password</label>
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

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={signingIn}
            className="w-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md"
          >
            {signingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}

