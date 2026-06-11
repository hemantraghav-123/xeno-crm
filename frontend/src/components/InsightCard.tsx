"use client";

import { Sparkles, AlertCircle, TrendingUp } from "lucide-react";

interface InsightCardProps {
  summary?: string;
  recommendation?: string;
  isFallback?: boolean;
}

export default function InsightCard({
  summary = "Open rate is strong. WhatsApp is performing well.",
  recommendation = "Consider increasing urgency in message CTA to improve click-through rates.",
  isFallback = false,
}: InsightCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/10 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
          <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          AI Recommendation
        </h2>
        {isFallback ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
            <AlertCircle className="h-3.5 w-3.5" />
            Standard Mode
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30">
            <TrendingUp className="h-3.5 w-3.5 animate-pulse" />
            Gemini Generated
          </span>
        )}
      </div>

      {/* Error Fallback Banner if Gemini fails */}
      {isFallback && (
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-lg text-xs text-amber-700 dark:text-amber-300">
          <strong>Notice:</strong> Unable to generate AI insights. Showing standard analytics.
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {summary && (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Campaign Summary</span>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
              {summary}
            </p>
          </div>
        )}

        {recommendation && (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actionable Suggestion</span>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold bg-white/60 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 p-3.5 rounded-lg shadow-inner">
              {recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
