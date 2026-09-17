// src/components/dashboard/AuditTable.jsx
import React from "react";
import StatusBadge from "../common/StatusBadge";

export default function AuditTable({ dispatches }) {
  return (
    <section className="bg-white rounded-lg border border-schneider-border shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-schneider-black">
          Dispatches & Spot Audits
        </h2>
        <p className="text-xs text-schneider-darkGray">
          Live curtailment alerts and 3-point audit checks
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-schneider-border text-schneider-darkGray font-semibold">
              <th className="pb-2">Recipient / Time</th>
              <th className="pb-2">Target Shed</th>
              <th className="pb-2">LLM Notification Sent</th>
              <th className="pb-2 text-center">Audits</th>
              <th className="pb-2 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-schneider-border">
            {(!dispatches || dispatches.length === 0) ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-schneider-darkGray italic">
                  No demand-response dispatches recorded yet.
                </td>
              </tr>
            ) : (
              dispatches.map((d) => (
                <tr key={d.id} className="hover:bg-[#F9FAFB] transition">
                  <td className="py-3 align-top">
                    <div className="font-semibold text-schneider-black font-mono">{d.phone}</div>
                    <div className="text-[10px] text-schneider-darkGray">{d.dispatched_at}</div>
                  </td>
                  <td className="py-3 align-top whitespace-nowrap">
                    <div className="font-semibold text-schneider-darkGreen">-{d.reduction_percent}%</div>
                    <div className="text-[10px] text-schneider-darkGray">
                      {d.target_kw} kW of {d.baseline_kw} kW
                    </div>
                  </td>
                  <td className="py-3 align-top max-w-[220px]">
                    <div className="bg-[#F4F5F7] border border-schneider-border rounded p-2 text-[11px] text-schneider-black leading-snug font-sans break-words shadow-xs">
                      <span className="text-[10px] font-bold text-schneider-darkGreen uppercase block mb-0.5">
                        💬 AI SMS Notice:
                      </span>
                      "{d.message}"
                    </div>
                  </td>
                  <td className="py-3 text-center align-top">
                    <span className="font-mono font-bold bg-schneider-lightGray px-2 py-0.5 rounded text-schneider-black border border-schneider-border">
                      {d.audits_completed}
                    </span>
                  </td>
                  <td className="py-3 text-right align-top">
                    <StatusBadge status={d.verification_status} />
                    {d.failed_reason && (
                      <p
                        className="text-[10px] text-red-600 font-medium mt-1 truncate max-w-[150px] ml-auto"
                        title={d.failed_reason}
                      >
                        {d.failed_reason}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}