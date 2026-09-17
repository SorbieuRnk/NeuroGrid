// src/components/dashboard/AddConsumerModal.jsx
import React, { useState } from "react";

export default function AddConsumerModal({ isOpen, onClose, onSubmit }) {
  const [phone, setPhone] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [currentKw, setCurrentKw] = useState("2.5");
  const [rewardPreference, setRewardPreference] = useState("Electricity Bill Discount");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        phone,
        household_name: householdName || "Primary Residence",
        current_kw: parseFloat(currentKw),
        reward_preference: rewardPreference,
      });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-schneider-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border border-schneider-border shadow-xl max-w-md w-full p-6">
        <h3 className="text-base font-bold text-schneider-black mb-1">Onboard Household Meter</h3>
        <p className="text-xs text-schneider-darkGray mb-4">Register a new endpoint into the demand-response pool.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-schneider-darkGray uppercase mb-1">
              Phone Number (E.164)
            </label>
            <input
              type="text"
              required
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-schneider-border rounded focus:outline-none focus:border-schneider-darkGreen font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-schneider-darkGray uppercase mb-1">
              Household / Villa Name
            </label>
            <input
              type="text"
              placeholder="Greenwood Villa 4A"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-schneider-border rounded focus:outline-none focus:border-schneider-darkGreen"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-schneider-darkGray uppercase mb-1">
                Initial Draw (kW)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={currentKw}
                onChange={(e) => setCurrentKw(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-schneider-border rounded focus:outline-none focus:border-schneider-darkGreen font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-schneider-darkGray uppercase mb-1">
                Incentive Type
              </label>
              <select
                value={rewardPreference}
                onChange={(e) => setRewardPreference(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-schneider-border rounded focus:outline-none focus:border-schneider-darkGreen bg-white"
              >
                <option value="Electricity Bill Discount">Bill Discount</option>
                <option value="Cashback">Direct Cashback</option>
                <option value="Travel Vouchers">Travel Vouchers</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold text-schneider-darkGray hover:bg-schneider-lightGray transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded text-xs font-bold bg-schneider-darkGreen hover:bg-schneider-green text-white transition disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Register Meter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}