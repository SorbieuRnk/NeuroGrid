// src/components/common/StatusBadge.jsx
import React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function StatusBadge({ status }) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-schneider-darkGreen">
        <CheckCircle2 className="w-3 h-3" /> VERIFIED
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" /> FAILED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      <Clock className="w-3 h-3" /> PENDING
    </span>
  );
}