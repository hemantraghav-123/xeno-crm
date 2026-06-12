"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Premium loading state matching the dashboard aesthetics
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
          <Sparkles className="h-5 w-5 absolute text-indigo-500 animate-pulse" />
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium animate-pulse">
          Verifying session details...
        </p>
      </div>
    );
  }

  // If not authenticated, render nothing while redirect is executed
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
