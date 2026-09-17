// src/api/client.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchDashboardState() {
  const res = await fetch(`${API_BASE}/events/dashboard-state`);
  if (!res.ok) throw new Error("Failed to fetch dashboard state");
  return res.json();
}

export async function triggerDemandResponse() {
  const res = await fetch(`${API_BASE}/events/trigger`);
  if (!res.ok) throw new Error("Failed to trigger demand response");
  return res.json();
}

export async function createConsumer(consumerData) {
  const res = await fetch(`${API_BASE}/consumers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consumerData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to create consumer");
  }
  return res.json();
}