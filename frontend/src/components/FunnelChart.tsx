"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FunnelChartProps {
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
}

export default function FunnelChart({
  sent = 1000,
  delivered = 900,
  opened = 650,
  clicked = 200,
}: FunnelChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = [
    { name: "Sent", value: sent, color: "#6366f1" },       // Indigo
    { name: "Delivered", value: delivered, color: "#10b981" }, // Emerald
    { name: "Opened", value: opened, color: "#f59e0b" },     // Amber
    { name: "Clicked", value: clicked, color: "#ec4899" },    // Pink
  ];

  if (!isMounted) {
    return (
      <div className="h-80 w-full flex items-center justify-center text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-150 dark:border-zinc-800 animate-pulse">
        Loading chart...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Campaign Funnel</h2>
      <div className="h-80 w-full">
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
      </div>
    </div>
  );
}
