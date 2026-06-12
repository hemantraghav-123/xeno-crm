"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Send, LayoutDashboard, Sparkles, LogOut, User, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Segments", href: "/segments", icon: Layers },
    { name: "Campaigns", href: "/campaigns", icon: Send },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  // Do not show navigation links if not authenticated
  const showNav = isAuthenticated && pathname !== "/login" && pathname !== "/register";

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg">
          <Sparkles className="h-5 w-5 text-indigo-500" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 group-hover:opacity-90 transition-opacity">
          Xeno AI CRM
        </span>
      </Link>

      {/* Navigation items */}
      {showNav && (
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
      )}

      {/* User profile & logout controls */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
              {user?.name ? user.name.substring(0, 2) : <User className="h-4 w-4" />}
            </div>
            <span className="hidden sm:inline font-medium text-zinc-700 dark:text-zinc-300">
              {user?.name || user?.email}
            </span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-500 bg-rose-50 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-lg transition-all"
            title="Log Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>
      ) : (
        pathname !== "/login" && pathname !== "/register" && (
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 rounded-lg transition-all"
          >
            Log In
          </Link>
        )
      )}
    </nav>
  );
}

