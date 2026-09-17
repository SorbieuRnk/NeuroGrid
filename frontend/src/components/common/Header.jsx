// src/components/common/Header.jsx
import React from "react";
import { Zap, AlertTriangle, Loader2 } from "lucide-react";

export default function Header({ gridStatus, isCritical, onTriggerDR, isTriggering }) {
  return (
    <header className="bg-white border-b border-schneider-border sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-schneider-darkGreen flex items-center justify-center text-white font-black text-xl tracking-tighter">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-schneider-black leading-tight">
            NeuroGrid <span className="text-schneider-darkGreen font-normal">| Operator Console</span>
          </h1>
          <p className="text-xs text-schneider-darkGray">Schneider Demand-Response Intelligence & Verification Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-schneider-darkGray font-medium">Grid State:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
            isCritical ? "bg-red-100 text-red-700" : "bg-green-100 text-schneider-darkGreen"
          }`}>
            {gridStatus || "OPTIMAL"}
          </span>
        </div>

        <button
          onClick={onTriggerDR}
          disabled={isTriggering}
          className="flex items-center gap-2 bg-schneider-darkGreen hover:bg-schneider-green text-white px-4 py-2 rounded text-xs font-bold tracking-wide transition shadow-sm disabled:opacity-50"
        >
          {isTriggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
          DISPATCH DEMAND RESPONSE
        </button>
      </div>
    </header>
  );
}