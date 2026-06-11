import DashboardCard from "@/components/DashboardCard";
import axios from "axios";
import { Users, ClipboardList, Send, BarChart2, Mail, MousePointer } from "lucide-react";

// Force Next.js to fetch fresh stats on every request instead of caching the page
export const dynamic = "force-dynamic";

interface DashboardStats {
  customers: number;
  orders: number;
  campaigns: number;
  messages: number;
  openRate: number;
  clickRate: number;
}

async function getStats(): Promise<DashboardStats> {
  try {
    const response = await axios.get("http://localhost:5000/api/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      customers: 0,
      orders: 0,
      campaigns: 0,
      messages: 0,
      openRate: 0,
      clickRate: 0,
    };
  }
}

export default async function Home() {
  const stats = await getStats();

  const cardsData = [
    {
      title: "Customers",
      value: stats.customers,
      description: "Total database size",
      icon: Users,
      iconColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      title: "Orders",
      value: stats.orders,
      description: "Successfully processed",
      icon: ClipboardList,
      iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Campaigns",
      value: stats.campaigns,
      description: "Targeted marketing flows",
      icon: Send,
      iconColor: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30",
    },
    {
      title: "Messages Sent",
      value: stats.messages,
      description: "Dispatched communications",
      icon: Mail,
      iconColor: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30",
    },
    {
      title: "Average Open Rate",
      value: stats.messages > 0 ? `${stats.openRate.toFixed(1)}%` : "0%",
      description: "Average customer reads",
      icon: BarChart2,
      iconColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
    },
    {
      title: "Average Click Rate",
      value: stats.messages > 0 ? `${stats.clickRate.toFixed(1)}%` : "0%",
      description: "Average link interactions",
      icon: MousePointer,
      iconColor: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30",
    },
  ];

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Xeno AI CRM Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Welcome back. Track customer growth, campaign metrics, and engagement insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardsData.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold tracking-wide uppercase">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-400 font-medium">
                  {card.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
