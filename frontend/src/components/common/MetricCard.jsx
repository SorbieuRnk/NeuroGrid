// src/components/common/MetricCard.jsx
import React from "react";

export default function MetricCard({ title, value, unit, subtitle, icon: Icon, valueColor = "text-schneider-black" }) {
  return (
    <div className="bg-white p-5 rounded-lg border border-schneider-border shadow-sm">
      <div className="flex justify-between items-center text-schneider-darkGray mb-2">
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-schneider-darkGray" />}
      </div>
      <div className={`text-2xl font-black ${valueColor}`}>
        {value} {unit && <span className="text-sm font-semibold text-schneider-darkGray">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-schneider-darkGray mt-2">{subtitle}</p>}
    </div>
  );
}