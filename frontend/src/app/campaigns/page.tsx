"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Copy, Check, Send, Sparkles, PlusCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

interface Campaign {
  id: string;
  name: string;
  channel: string;
  message: string;
  status: "PENDING" | "SENT";
  createdAt: string;
}

export default function CampaignsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<{
    campaignName: string;
    recommendedChannel: string;
    message: string;
  } | null>(null);

  const [creating, setCreating] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchCampaigns();
  }, [isAuthenticated, authLoading]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await api.get("/campaigns");
      setCampaigns(response.data);
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    try {
      setGenerating(true);
      setGeneratedCampaign(null);
      const response = await api.post("/ai-campaign/generate", { goal });
      setGeneratedCampaign({
        campaignName: response.data.campaignName || "We Miss You",
        recommendedChannel: response.data.recommendedChannel || "WHATSAPP",
        message: response.data.message || "",
      });
    } catch (error) {
      console.error("Failed to generate campaign", error);
      showToast("Failed to generate AI campaign content", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!generatedCampaign) return;

    try {
      setCreating(true);
      await api.post("/campaigns", {
        name: generatedCampaign.campaignName,
        channel: generatedCampaign.recommendedChannel,
        message: generatedCampaign.message,
      });
      showToast("Campaign Created Successfully!");
      setGeneratedCampaign(null);
      setGoal("");
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to create campaign", error);
      showToast("Failed to save campaign", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (id: string) => {
    try {
      setSendingId(id);
      await api.post(`/campaigns/${id}/send`);
      showToast("Campaign Sent Successfully!");
      fetchCampaigns(); // Refresh list to update status to SENT
    } catch (error) {
      console.error("Failed to send campaign", error);
      showToast("Failed to transmit campaign", "error");
    } finally {
      setSendingId(null);
    }
  };

  const handleCopyMessage = () => {
    if (!generatedCampaign) return;
    navigator.clipboard.writeText(generatedCampaign.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg border text-white transition-all transform translate-y-0 ${
            toast.type === "success"
              ? "bg-emerald-600 border-emerald-500"
              : "bg-rose-600 border-rose-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Campaign Hub</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          State-of-the-art marketing campaign generator powered by Gemini.
        </p>
      </div>

      {/* Generator Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          AI Campaign Generator
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              What is the marketing goal of this campaign?
            </label>
            <input
              type="text"
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg p-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Win back inactive customers who haven't ordered in 60 days"
            />
          </div>

          <button
            type="submit"
            disabled={generating || !goal.trim()}
            className="bg-black dark:bg-white text-white dark:text-black font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {generating ? "Generating Campaign..." : "Generate Campaign"}
          </button>
        </form>

        {/* AI Output Result */}
        {generatedCampaign && (
          <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Generated Preview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Campaign Name</span>
                  <input
                    type="text"
                    value={generatedCampaign.campaignName}
                    onChange={(e) =>
                      setGeneratedCampaign({ ...generatedCampaign, campaignName: e.target.value })
                    }
                    className="w-full mt-1 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recommended Channel</span>
                  <select
                    value={generatedCampaign.recommendedChannel}
                    onChange={(e) =>
                      setGeneratedCampaign({ ...generatedCampaign, recommendedChannel: e.target.value })
                    }
                    className="w-full mt-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg p-2.5"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Message Template</span>
                  <button
                    onClick={handleCopyMessage}
                    className="text-xs flex items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied!" : "Copy Message"}
                  </button>
                </div>
                <textarea
                  value={generatedCampaign.message}
                  onChange={(e) =>
                    setGeneratedCampaign({ ...generatedCampaign, message: e.target.value })
                  }
                  rows={5}
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg p-3 font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                {creating ? "Creating Campaign..." : "Create Campaign"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Campaigns List Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Campaign History</h2>

        {loadingCampaigns ? (
          <div className="text-center py-10 text-zinc-500">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg border-zinc-200 dark:border-zinc-800 space-y-2">
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">No campaigns created yet</p>
            <p className="text-zinc-400 text-sm">Create your first AI campaign above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium uppercase text-xs">
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-4 px-4 font-medium text-zinc-900 dark:text-zinc-100">{campaign.name}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {campaign.channel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-500">
                      {new Date(campaign.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          campaign.status === "SENT"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleSend(campaign.id)}
                        disabled={sendingId !== null}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          campaign.status === "SENT"
                            ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200"
                            : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {sendingId === campaign.id ? "Sending..." : "Send Campaign"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
