// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Header from "../components/common/Header";
import MetricsGrid from "../components/dashboard/MetricsGrid";
import HouseholdTable from "../components/dashboard/HouseholdTable";
import AuditTable from "../components/dashboard/AuditTable";
import DispatchBanner from "../components/dashboard/DispatchBanner";
import AddConsumerModal from "../components/dashboard/AddConsumerModal";
import { fetchDashboardState, triggerDemandResponse, createConsumer } from "../api/client";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastDispatch, setLastDispatch] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const state = await fetchDashboardState();
      setData(state);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerDR = async () => {
    setTriggering(true);
    try {
      const result = await triggerDemandResponse();
      setLastDispatch(result);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  const handleAddConsumer = async (formData) => {
    await createConsumer(formData);
    await loadData();
  };

  if (loading && !data) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-schneider-black">
        <Loader2 className="w-8 h-8 animate-spin text-schneider-darkGreen mb-2" />
        <p className="text-sm font-medium">Connecting to NeuroGrid Telemetry Engine...</p>
      </div>
    );
  }

  const isCritical = data?.grid?.deficit_kw >= 1.2;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-schneider-black">
      <Header
        gridStatus={data?.grid?.status}
        isCritical={isCritical}
        onTriggerDR={handleTriggerDR}
        isTriggering={triggering}
      />

      <DispatchBanner
        lastDispatch={lastDispatch}
        onDismiss={() => setLastDispatch(null)}
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <MetricsGrid grid={data?.grid} stats={data?.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <HouseholdTable
              consumers={data?.consumers}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
          <div className="lg:col-span-7">
            <AuditTable dispatches={data?.dispatches} />
          </div>
        </div>
      </main>

      <AddConsumerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddConsumer}
      />
    </div>
  );
}