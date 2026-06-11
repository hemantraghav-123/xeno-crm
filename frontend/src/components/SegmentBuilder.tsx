"use client";

import { useState } from "react";
import { api } from "@/services/api";

export default function SegmentBuilder() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [audienceSize, setAudienceSize] = useState(0);
  const [audience, setAudience] = useState<any[]>([]);

  const generateSegment = async () => {
    try {
      setLoading(true);
      const response = await api.post("/segments/execute", {
        prompt,
      });
      setAudienceSize(response.data.audienceSize);
      setAudience(response.data.audience);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        AI Audience Builder
      </h1>

      <textarea
        className="w-full border rounded-lg p-4"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Customers who spent over ₹10000 and haven't ordered in 60 days"
      />

      <button
        onClick={generateSegment}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate Segment"}
      </button>

      {audienceSize > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">
            Audience Size: {audienceSize}
          </h2>

          <div className="mt-6 overflow-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {audience.slice(0, 20).map((customer) => (
                  <tr key={customer.id} className="border-t">
                    <td className="p-2">{customer.name}</td>
                    <td className="p-2">{customer.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
