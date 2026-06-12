"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User, Mail, Calendar, Trash2, ShieldAlert, X, Sparkles } from "lucide-react";
import { api } from "@/services/api";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Joined";

  const handleDeleteAccount = async () => {
    if (emailConfirmation !== user?.email) return;

    try {
      setIsDeleting(true);
      setError(null);
      await api.delete("/auth/delete-account");
      // Clear session & redirect
      logout();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

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

        {/* Danger Zone */}
        <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-rose-800 dark:text-rose-400">Danger Zone</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Once you delete your account, there is no going back. All of your user details, campaign access, and settings will be permanently erased.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setError(null);
                setEmailConfirmation("");
                setIsDeleteModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-rose-655 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/10 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => {
                if (!isDeleting) setIsDeleteModalOpen(false);
              }}
            />

            {/* Modal Dialog */}
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl mx-4 z-10 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-2 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 rounded-xl">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Delete Account?</h4>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">
                  This action is <span className="font-bold text-zinc-800 dark:text-zinc-200">permanent</span> and cannot be undone. To proceed, please confirm by typing your email address <span className="font-mono text-xs select-all bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200">{user?.email}</span> below.
                </p>

                <div>
                  <input
                    type="text"
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isDeleting}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-zinc-800 dark:text-zinc-50"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium border border-rose-100 dark:border-rose-950/40">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || emailConfirmation !== user?.email}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-rose-600/15 cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Confirm Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
