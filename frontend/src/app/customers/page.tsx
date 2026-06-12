"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Search, ChevronLeft, ChevronRight, X, Calendar, Clipboard, CreditCard, User, ShieldAlert } from "lucide-react";

interface Order {
  id: string;
  amount: number;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  totalSpend: number;
  orders: Order[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Debounced search state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(search);
      setPage(1); // Reset page on search
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers", {
        params: {
          page,
          limit: 15,
          search: searchTerm,
        },
      });
      setCustomers(response.data.customers);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCustomerStatus = (customer: Customer) => {
    const statusBadges = [];
    
    // Spend > 10000
    if (customer.totalSpend > 10000) {
      statusBadges.push({
        text: "VIP",
        color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30",
        indicator: "🟢",
      });
    }

    // Inactivity check
    let daysInactive = 0;
    if (customer.orders && customer.orders.length > 0) {
      const lastOrderDate = new Date(customer.orders[0].createdAt);
      const diffTime = Math.abs(new Date().getTime() - lastOrderDate.getTime());
      daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      const createdDate = new Date(customer.createdAt);
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (daysInactive > 60) {
      statusBadges.push({
        text: "At Risk",
        color: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30",
        indicator: "🟠",
      });
    }

    if (statusBadges.length === 0) {
      statusBadges.push({
        text: "Regular",
        color: "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800",
        indicator: "🔵",
      });
    }

    return statusBadges;
  };

  // Helper to calculate modal metrics
  const getModalMetrics = (customer: Customer) => {
    let lastOrderDateStr = "No orders yet";
    let daysInactive = 0;
    
    if (customer.orders && customer.orders.length > 0) {
      const lastOrderDate = new Date(customer.orders[0].createdAt);
      lastOrderDateStr = lastOrderDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const diffTime = Math.abs(new Date().getTime() - lastOrderDate.getTime());
      daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      const createdDate = new Date(customer.createdAt);
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return { lastOrderDateStr, daysInactive };
  };

  return (
    <ProtectedRoute>
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Customers</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Track customer profiles, purchase history, and target segments.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-50 transition-all text-zinc-900 dark:text-zinc-50"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Table layout */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase text-xs">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Phone</th>
                  <th className="py-3 px-6">Orders</th>
                  <th className="py-3 px-6">Total Spend</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading && customers.length === 0 ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="py-4 px-6">
                          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400 font-medium">
                      No customers found. Try altering your search query.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const badges = getCustomerStatus(customer);
                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-zinc-100">
                          {customer.name}
                        </td>
                        <td className="py-4 px-6 text-zinc-500">{customer.email}</td>
                        <td className="py-4 px-6 text-zinc-500">{customer.phone}</td>
                        <td className="py-4 px-6 font-medium text-zinc-700 dark:text-zinc-300">
                          {customer.orders?.length || 0} Orders
                        </td>
                        <td className="py-4 px-6 font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(customer.totalSpend)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {badges.map((badge, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${badge.color}`}
                              >
                                <span>{badge.indicator}</span>
                                {badge.text}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="py-4 px-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Showing page <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{page}</strong> of <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{totalPages}</strong> ({total} total customers)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || loading}
                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || loading}
                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Customer Details Drawer / Modal */}
      {selectedCustomer && (() => {
        const { lastOrderDateStr, daysInactive } = getModalMetrics(selectedCustomer);
        const badges = getCustomerStatus(selectedCustomer);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Customer Profile</h2>
                    <p className="text-xs text-zinc-400">Database Reference: {selectedCustomer.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Personal Information</h3>
                    <div className="bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-4.5 space-y-3">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-medium">Name</span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{selectedCustomer.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-medium">Email</span>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{selectedCustomer.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-medium">Phone</span>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer intelligence metrics */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Metrics</h3>
                    <div className="bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-4.5 space-y-3.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Total Orders</span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{selectedCustomer.orders?.length || 0}</span>
                        </div>
                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          <Clipboard className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Total Spend</span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(selectedCustomer.totalSpend)}</span>
                        </div>
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                          <CreditCard className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Last Order</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{lastOrderDateStr}</span>
                        </div>
                        <div className="p-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
                          <Calendar className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Days Inactive</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{daysInactive} days</span>
                        </div>
                        <div className="p-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg">
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges / Status Intel Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Intel & Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${badge.color}`}
                      >
                        <span className="text-base">{badge.indicator}</span>
                        {badge.text === "VIP" ? "VIP Customer" : badge.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Order History */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order History</h3>
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold bg-zinc-50 dark:bg-zinc-900/40 uppercase sticky top-0 z-10">
                              <th className="py-2.5 px-4">Order ID</th>
                              <th className="py-2.5 px-4">Date</th>
                              <th className="py-2.5 px-4 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {selectedCustomer.orders.map((order) => (
                              <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="py-2.5 px-4 font-mono text-zinc-500">{order.id}</td>
                                <td className="py-2.5 px-4 text-zinc-500">
                                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </td>
                                <td className="py-2.5 px-4 font-bold text-zinc-900 dark:text-zinc-50 text-right">
                                  {formatCurrency(order.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800 text-xs">
                      No order records found for this profile.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </ProtectedRoute>
  );
}
