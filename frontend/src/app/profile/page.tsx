"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User, Mail, Calendar, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Joined";

  return (
    <ProtectedRoute>
      <main className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Manage your account settings, profile information, and preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Decorative Top Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative flex items-end px-8 pb-4">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/10">
              <Sparkles className="h-3.5 w-3.5" />
              Pro Account
            </div>
          </div>

          <div className="px-8 pb-8 pt-16 relative">
            {/* Avatar positioning */}
            <div className="absolute -top-14 left-8">
              <div className="h-24 w-24 rounded-2xl bg-white dark:bg-zinc-900 border-4 border-zinc-50 dark:border-zinc-950 shadow-md flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                {user?.name ? user.name.substring(0, 2) : <User className="h-12 w-12" />}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{user?.name || "Anonymous User"}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Xeno AI CRM Member</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-800 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Email Address
                    </span>
                    <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-800 transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Joined Since
                    </span>
                    <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                      {joinDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
