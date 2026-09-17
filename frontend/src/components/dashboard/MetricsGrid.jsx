// src/components/dashboard/MetricsGrid.jsx
import React from "react";
import { Thermometer, ArrowDownRight, ShieldCheck, Users } from "lucide-react";
import MetricCard from "../common/MetricCard";

export default function MetricsGrid({ grid, stats }) {
  const totalAudits = (stats?.verified_audits || 0) + (stats?.failed_audits || 0);

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Thermal Grid Deficit"
        value={grid?.deficit_kw ?? 0.0}
        unit="kW"
        subtitle={`${grid?.temperature}°C • ${grid?.humidity}% Humidity`}
        icon={Thermometer}
      />
      <MetricCard
        title="Total Load Shed Target"
        value={stats?.total_shed_kw ?? 0.0}
        unit="kW"
        subtitle="Aggregated active DR curtailments"
        icon={ArrowDownRight}
        valueColor="text-schneider-darkGreen"
      />
      <MetricCard
        title="Audit Compliance"
        value={`${stats?.verified_audits ?? 0}`}
        unit={`/ ${totalAudits}`}
        subtitle="Passed 3-point randomized audits"
        icon={ShieldCheck}
      />
      <MetricCard
        title="Active Telemetry"
        value={stats?.total_consumers ?? 0}
        unit="Meters"
        subtitle="Connected smart grid endpoints"
        icon={Users}
      />
    </section>
  );
}