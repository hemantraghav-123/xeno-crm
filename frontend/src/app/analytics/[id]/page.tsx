"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import FunnelChart from "@/components/FunnelChart";
import InsightCard from "@/components/InsightCard";
import { ArrowLeft, Send, CheckCircle, MailOpen, MousePointerClick, RefreshCw, AlertTriangle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AnalyticsResponse {
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  kpis: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
  insight: {
    summary: string;
    recommendation: string;
    isFallback?: boolean;
  };
}

interface CampaignInfo {
  id: string;
  name: string;
  channel: string;
  createdAt: string;
}

export default function CampaignAnalyticsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const campaignId = params.id;

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Fetch both campaign info (from campaigns list) and analytics
      const [analyticsRes, campaignsRes] = await Promise.all([
        api.get(`/analytics/${campaignId}`),
        api.get("/campaigns")
      ]);

      setData(analyticsRes.data);
      
      // Find current campaign from history to display its basic details
      const currentCampaign = campaignsRes.data.find(
        (c: CampaignInfo) => c.id === campaignId
      );
      if (currentCampaign) {
        setCampaign(currentCampaign);
      }
    } catch (err: any) {
      console.error("Failed to fetch campaign analytics:", err);
      setError(err?.response?.data?.error || "Failed to load campaign analytics report.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Loading skeletons
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-6xl mx-auto p-6 space-y-10">
        {/* Back Link Skeleton */}
        <div className="w-28 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>

        {/* Header Skeleton */}
        <div className="space-y-3 animate-pulse">
          <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
              </div>
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
            </div>
          ))}
        </div>

        {/* Chart & Insights Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 animate-pulse"></div>
          <div className="h-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 animate-pulse"></div>
        </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state layout
  if (error || !data) {
    return (
      <ProtectedRoute>
        <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm space-y-6 text-center">
        <div className="inline-flex p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Analytics Unavailable</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {error || "We encountered an issue fetching reports for this campaign."}
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/analytics"
            className="flex items-center gap-2 text-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <button
            onClick={() => fetchCampaignDetails(true)}
            className="flex items-center gap-2 text-sm bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-4 py-2 rounded-lg font-medium transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { analytics, kpis, insight } = data;

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Back to Analytics Link */}
      <Link
        href="/analytics"
        className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Analytics
      </Link>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-2.5 py-1 rounded">
            Campaign Report
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2.5 mb-1.5">
            {campaign?.name || "Campaign Details"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Sent via <span className="font-semibold text-zinc-700 dark:text-zinc-300">{campaign?.channel || "N/A"}</span>
            {campaign?.createdAt && ` on ${new Date(campaign.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}`}
          </p>
        </div>
        <button
          onClick={() => fetchCampaignDetails(false)}
          className="flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3.5 py-2 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivery Rate Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Delivery Rate</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight">
              {kpis.deliveryRate.toFixed(1)}%
            </span>
            <p className="text-xs text-zinc-400 mt-1.5">
              {analytics.delivered} of {analytics.sent} delivered
            </p>
          </div>
        </div>

        {/* Open Rate Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Open Rate</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <MailOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight">
              {kpis.openRate.toFixed(1)}%
            </span>
            <p className="text-xs text-zinc-400 mt-1.5">
              {analytics.opened} of {analytics.delivered} opened
            </p>
          </div>
        </div>

        {/* Click Rate Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Click Rate</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight">
              {kpis.clickRate.toFixed(1)}%
            </span>
            <p className="text-xs text-zinc-400 mt-1.5">
              {analytics.clicked} of {analytics.opened} clicked
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FunnelChart
            sent={analytics.sent}
            delivered={analytics.delivered}
            opened={analytics.opened}
            clicked={analytics.clicked}
          />
        </div>
        <div>
          <InsightCard
            summary={insight?.summary}
            recommendation={insight?.recommendation}
            isFallback={insight?.isFallback}
          />
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
