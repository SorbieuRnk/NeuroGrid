// src/components/dashboard/HouseholdTable.jsx
import React from "react";
import { Plus } from "lucide-react";

export default function HouseholdTable({ consumers, onOpenAddModal }) {
  return (
    <section className="bg-white rounded-lg border border-schneider-border shadow-sm p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-schneider-black">Household Telemetry</h2>
            <p className="text-xs text-schneider-darkGray">Live load metrics streamed from smart meters</p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 text-xs font-semibold bg-schneider-lightGray hover:bg-schneider-border text-schneider-black px-3 py-1.5 rounded transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-schneider-border text-schneider-darkGray font-semibold">
                <th className="pb-2">Household</th>
                <th className="pb-2">Phone</th>
                <th className="pb-2 text-right">Current Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-schneider-border">
              {consumers?.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9FAFB] transition">
                  <td className="py-3 font-semibold text-schneider-black">{c.name}</td>
                  <td className="py-3 text-schneider-darkGray font-mono">{c.phone}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        c.current_kw >= 4.0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-schneider-lightGray text-schneider-black"
                      }`}
                    >
                      {c.current_kw.toFixed(2)} kW
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}