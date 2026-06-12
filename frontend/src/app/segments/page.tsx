"use client";

import SegmentBuilder from "@/components/SegmentBuilder";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SegmentsPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <SegmentBuilder />
      </div>
    </ProtectedRoute>
  );
}

