"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Send, CheckCircle, MailOpen, MousePointerClick, RefreshCw, BarChart2, ArrowRight } from "lucide-react";

interface AnalyticsData {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

interface Campaign {
  id: string;
  name: string;
  channel: string;
  message: string;
  status: "PENDING" | "SENT";
  createdAt: string;
  sent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsData>({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchAnalytics();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (!pollingActive) return;

    const interval = setInterval(() => {
      fetchAnalytics(false); // fetch silently without loading indicator
      fetchCampaigns(false); // fetch silently
    }, 5000);

    return () => clearInterval(interval);
  }, [pollingActive]);

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get("/dashboard/analytics");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchCampaigns = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingCampaigns(true);
      const response = await api.get("/campaigns");
      setCampaigns(response.data);
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    } finally {
      if (showLoading) setLoadingCampaigns(false);
    }
  };

  const chartData = [
    { name: "Sent", value: stats.sent, color: "#6366f1" },
    { name: "Delivered", value: stats.delivered, color: "#10b981" },
    { name: "Opened", value: stats.opened, color: "#f59e0b" },
    { name: "Clicked", value: stats.clicked, color: "#ec4899" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Campaign Analytics</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Real-time delivery funnel tracking and customer engagement statistics.
          </p>
        </div>
        <button
          onClick={() => {
            fetchAnalytics(true);
            fetchCampaigns(true);
          }}
          className="flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3.5 py-2 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading || loadingCampaigns ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sent Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-500">Sent Messages</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight">{stats.sent}</span>
            <p className="text-xs text-zinc-400 mt-1">Total messages sent</p>
          </div>
        </div>

        {/* Delivered Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-500">Delivered</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight">{stats.delivered}</span>
            <p className="text-xs text-zinc-400 mt-1">
              {stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : 0}% delivery rate
            </p>
          </div>
        </div>

        {/* Opened Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-500">Opened</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <MailOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight">{stats.opened}</span>
            <p className="text-xs text-zinc-400 mt-1">
              {stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : 0}% open rate
            </p>
          </div>
        </div>

        {/* Clicked Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-500">Clicked</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight">{stats.clicked}</span>
            <p className="text-xs text-zinc-400 mt-1">
              {stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : 0}% click-through rate
            </p>
          </div>
        </div>
      </div>

      {/* Chart & Live Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Funnel Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Campaign Funnel</h2>
          <div className="h-80 w-full flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={55}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-500">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Live Refresh Info */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live Sync Active
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Customer interactions (delivering, opening, and clicking campaign messages) are simulated asynchronously by the channel callback service.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This page automatically polls and refreshes metrics every 5 seconds to provide visual feedback as customer callbacks land.
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Auto-refresh (5s)</span>
            <button
              onClick={() => setPollingActive(!pollingActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                pollingActive
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400"
                  : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700"
              }`}
            >
              {pollingActive ? "Enabled" : "Paused"}
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Comparison Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-indigo-500" />
          Campaign Comparison
        </h2>

        {loadingCampaigns && campaigns.length === 0 ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800/40 rounded-lg"></div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 border border-dashed rounded-lg">
            No campaigns found to compare. Create and send a campaign first!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase text-xs">
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Sent</th>
                  <th className="py-3 px-4">Open Rate</th>
                  <th className="py-3 px-4">Click Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      <Link href={`/analytics/${campaign.id}`} className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {campaign.channel}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {campaign.sent}
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {campaign.sent > 0 ? `${campaign.openRate.toFixed(1)}%` : "0%"}
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {campaign.sent > 0 ? `${campaign.clickRate.toFixed(1)}%` : "0%"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/analytics/${campaign.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                      >
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
