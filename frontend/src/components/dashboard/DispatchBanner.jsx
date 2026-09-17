// src/components/dashboard/DispatchBanner.jsx
import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function DispatchBanner({ lastDispatch, onDismiss }) {
  if (!lastDispatch || !lastDispatch.messages || lastDispatch.messages.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 pt-6">
      <div className="bg-emerald-50 border border-schneider-green/40 rounded-lg p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-schneider-darkGreen uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> AI Curtailment Notices Dispatched Successfully
          </span>
          <button
            onClick={onDismiss}
            className="text-xs text-schneider-darkGray hover:text-schneider-black font-semibold"
          >
            Dismiss
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          {lastDispatch.messages.map((m, idx) => (
            <div key={idx} className="bg-white p-3 rounded border border-schneider-border text-xs">
              <div className="flex justify-between items-center font-mono font-semibold text-schneider-black mb-1">
                <span>To: {m.to}</span>
                <span className="text-schneider-darkGreen">Target: -{m.reduction_target}</span>
              </div>
              <p className="text-schneider-darkGray italic">"{m.message}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}