import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Activity, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Thermometer, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newKw, setNewKw] = useState(2.5);
  const [newPreference, setNewPreference] = useState("Electricity Bill Discount");

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/dashboard-state`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Telemetry sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 3000);
    return () => clearInterval(timer);
  }, []);

  const triggerDR = async () => {
    setTriggering(true);
    try {
      await fetch(`${API_BASE}/events/trigger`);
      await fetchData();
    } finally {
      setTriggering(false);
    }
  };

  const handleCreateConsumer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/consumers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: newPhone,
          household_name: newName,
          current_kw: parseFloat(newKw),
          reward_preference: newPreference,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewPhone("");
        setNewName("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add consumer:", err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex items-center gap-3 text-slate-700 font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#3dcd58]" />
          Connecting to NeuroGrid Telemetry Engine...
        </div>
      </div>
    );
  }

  const isCritical = data?.grid?.status === "CRITICAL DEFICIT";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-7 bg-[#3dcd58] rounded-sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-black">NeuroGrid</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  Control Center
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous AI Demand-Response Grid Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${
                isCritical
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCritical ? "bg-rose-500 animate-pulse" : "bg-[#3dcd58]"
                }`}
              />
              {data?.grid?.status || "OPTIMAL"}
            </span>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              Add Consumer
            </button>

            <button
              onClick={triggerDR}
              disabled={triggering}
              className="flex items-center gap-2 bg-[#3dcd58] hover:bg-[#34b54c] text-white font-semibold text-xs px-4 py-1.5 rounded shadow-sm transition disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              {triggering ? "Dispatching..." : "Manual DR Dispatch"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metric KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Thermal Deficit</span>
              <Thermometer className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-black mt-2">
              {data?.grid?.deficit_kw} <span className="text-sm font-semibold text-slate-500">kW</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ambient: {data?.grid?.temperature}°C | {data?.grid?.humidity}% RH
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Target Curtailment</span>
              <Zap className="w-4 h-4 text-[#3dcd58]" />
            </div>
            <div className="text-2xl font-black text-black mt-2">
              {data?.stats?.total_shed_kw} <span className="text-sm font-semibold text-slate-500">kW</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Cumulative DR load reduction</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Audit Pass Ratio</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-black mt-2">
              {data?.stats?.verified_audits}{" "}
              <span className="text-sm font-semibold text-slate-500">
                / {data?.stats?.verified_audits + data?.stats?.failed_audits}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">3-point spot audits verified</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Monitored Meters</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-black mt-2">
              {data?.stats?.total_consumers}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active household nodes</p>
          </div>
        </section>

        {/* Operational Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Table: Consumers Live Load */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3dcd58]" />
                <h2 className="font-bold text-sm text-black">Live Household Telemetry</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Stream: 3s Interval</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                    <th className="py-3 px-5">Household</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3 text-right">Current Load</th>
                    <th className="py-3 px-5">Reward Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.consumers?.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-5 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{c.phone}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            c.current_kw >= 4.0
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "text-slate-800"
                          }`}
                        >
                          {c.current_kw.toFixed(2)} kW
                        </span>
                      </td>
                      <td className="py-3 px-5 text-slate-600">{c.preference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Table: 3-Point Audits */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-black" />
                <h2 className="font-bold text-sm text-black">Random 3-Point Audits</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Anti-Gaming Loop</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                    <th className="py-3 px-4">Event ID / Target</th>
                    <th className="py-3 px-3">Target Shed</th>
                    <th className="py-3 px-3 text-center">Progress</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.dispatches?.map((d) => {
                    let badgeClasses = "bg-slate-100 text-slate-700 border-slate-300";
                    let Icon = Clock;

                    if (d.verification_status === "VERIFIED") {
                      badgeClasses = "bg-emerald-50 text-emerald-800 border-emerald-300";
                      Icon = CheckCircle2;
                    } else if (d.verification_status === "FAILED") {
                      badgeClasses = "bg-rose-50 text-rose-800 border-rose-300";
                      Icon = XCircle;
                    }

                    return (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 font-mono">{d.phone}</div>
                          <div className="text-[10px] text-slate-400">
                            Log #{d.id} • {d.dispatched_at}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800">
                            -{d.reduction_percent}%
                          </span>{" "}
                          <span className="text-slate-400">({d.target_kw} kW)</span>
                          <div className="text-[10px] text-slate-400">Base: {d.baseline_kw} kW</div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {d.audits_completed}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${badgeClasses}`}
                          >
                            <Icon className="w-3 h-3" />
                            {d.verification_status}
                          </span>
                          {d.failed_reason && (
                            <div
                              className="text-[10px] text-rose-600 mt-1 max-w-[200px] truncate"
                              title={d.failed_reason}
                            >
                              {d.failed_reason}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Onboard Consumer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-black mb-1">Register New Consumer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new household smart meter channel to the demand-response registry.
            </p>

            <form onSubmit={handleCreateConsumer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (E.164)</label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3dcd58]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Household / Villa Name</label>
                <input
                  type="text"
                  required
                  placeholder="Green Valley Villa 10"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3dcd58]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Meter Load (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newKw}
                  onChange={(e) => setNewKw(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3dcd58]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reward Preference</label>
                <select
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#3dcd58]"
                >
                  <option>Electricity Bill Discount</option>
                  <option>Cashback</option>
                  <option>Travel Vouchers</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3dcd58] hover:bg-[#34b54c] text-white rounded font-semibold shadow-sm"
                >
                  Save Consumer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}