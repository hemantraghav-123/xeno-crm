"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Send, LayoutDashboard, Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Segments", href: "/segments", icon: Users },
    { name: "Campaigns", href: "/campaigns", icon: Send },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 group-hover:opacity-90 transition-opacity">
          Xeno AI CRM
        </span>
      </Link>

      {/* Navigation items */}
      <div className="flex items-center gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
