"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { Users, ClipboardList, Send, BarChart2, Mail, MousePointer } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

interface DashboardStats {
  customers: number;
  orders: number;
  campaigns: number;
  messages: number;
  openRate: number;
  clickRate: number;
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    orders: 0,
    campaigns: 0,
    messages: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    async function fetchStats() {
      try {
        setLoading(true);
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [isAuthenticated, authLoading]);

  const cardsData = [
    {
      title: "Customers",
      value: stats.customers,
      description: "Total database size",
      icon: Users,
      iconColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
      href: "/customers",
    },
    {
      title: "Orders",
      value: stats.orders,
      description: "Successfully processed",
      icon: ClipboardList,
      iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
      href: "/customers",
    },
    {
      title: "Campaigns",
      value: stats.campaigns,
      description: "Targeted marketing flows",
      icon: Send,
      iconColor: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30",
      href: "/campaigns",
    },
    {
      title: "Messages Sent",
      value: stats.messages,
      description: "Dispatched communications",
      icon: Mail,
      iconColor: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30",
      href: "/analytics",
    },
    {
      title: "Average Open Rate",
      value: stats.messages > 0 ? `${stats.openRate.toFixed(1)}%` : "0%",
      description: "Average customer reads",
      icon: BarChart2,
      iconColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
      href: "/analytics",
    },
    {
      title: "Average Click Rate",
      value: stats.messages > 0 ? `${stats.clickRate.toFixed(1)}%` : "0%",
      description: "Average link interactions",
      icon: MousePointer,
      iconColor: "text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/30",
      href: "/analytics",
    },
  ];

  return (
    <ProtectedRoute>
      <main className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Xeno AI CRM Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Welcome back. Track customer growth, campaign metrics, and engagement insights.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3"></div>
                <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 mt-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardsData.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={index}
                  href={card.href}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold tracking-wide uppercase group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        {card.title}
                      </h2>
                      <p className="mt-2 text-3xl font-extrabold tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {card.value}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${card.iconColor} group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs text-zinc-400 font-medium group-hover:text-zinc-500 transition-colors">
                      {card.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
