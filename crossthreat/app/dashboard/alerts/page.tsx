"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { DonutChart } from "@/components/charts/DonutChart";

export default function AlertsPage() {
  const { alerts, selectedHost } = useDashboard();
  const [filterSeverity, setFilterSeverity] = useState<string>("All");

  const staticAlerts = [
    { id: "a1", time: "11:42:00", alert: "Port Scan Detected across internal subnet", source: selectedHost, severity: "High", status: "Active" },
    { id: "a2", time: "11:41:58", alert: "Multiple Failed Login Attempts (HTTP Auth)", source: selectedHost, severity: "High", status: "Active" },
    { id: "a3", time: "11:41:32", alert: "Possible SSH Brute Force against Gateway", source: "192.168.10.23", severity: "High", status: "Active" },
    { id: "a4", time: "11:41:10", alert: "Unusual DNS Query Pattern to External Resolver", source: "192.168.10.8", severity: "Medium", status: "Acknowledged" },
    { id: "a5", time: "11:40:45", alert: "Suspicious High-Volume Query to Database", source: "192.168.10.8", severity: "High", status: "Active" },
    { id: "a6", time: "11:40:12", alert: "New External Connection on Port 8080", source: "192.168.10.14", severity: "Low", status: "Resolved" },
    { id: "a7", time: "11:39:58", alert: "Service Enumeration Activity (Nmap banner)", source: selectedHost, severity: "Medium", status: "Resolved" }
  ];

  const allAlerts = alerts.length > 0 ? alerts : staticAlerts;
  const filtered = filterSeverity === "All" ? allAlerts : allAlerts.filter(a => a.severity === filterSeverity);

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* Title */}
      <div>
        <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          5. ALERTS CENTER — SIGNATURE DETECTIONS & SEVERITY TRIAGE
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          Real-time incident response queue, rule engine triggers, and active threat mitigation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 cols: Live Alert Table */}
        <div className="lg:col-span-8 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                  ALERTS (LIVE QUEUE)
                </span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold">
                  {filtered.length} Displayed
                </span>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {["All", "High", "Medium", "Low"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2 py-0.5 rounded border transition ${
                      filterSeverity === sev
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
                        : "text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-[9px] text-zinc-500 border-b border-[#151828] uppercase">
                    <th className="pb-2 font-normal">Time</th>
                    <th className="pb-2 font-normal">Alert / Signature</th>
                    <th className="pb-2 font-normal">Source</th>
                    <th className="pb-2 font-normal">Severity</th>
                    <th className="pb-2 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121526]">
                  {filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#121528] transition">
                      <td className="py-2.5 text-zinc-400 text-[11px]">{item.time}</td>
                      <td className="py-2.5 font-semibold text-zinc-200 text-[11px] max-w-[280px] truncate">
                        {item.alert}
                      </td>
                      <td className="py-2.5 text-zinc-300 text-[11px]">{item.source}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                            item.severity === "High"
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              : item.severity === "Medium"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                          }`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`text-[10px] font-semibold ${
                            item.status === "Active"
                              ? "text-rose-400 font-bold"
                              : item.status === "Acknowledged"
                              ? "text-amber-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Automated SIEM Ingestion</span>
            <span className="text-zinc-400 font-bold">Rule Engine v1.0 Active</span>
          </div>
        </div>

        {/* Right 4 cols: Summary KPIs & Alert Status Donut */}
        <div className="lg:col-span-4 space-y-4">
          {/* Summary KPIs */}
          <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl space-y-3 font-mono">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              ALERT SUMMARY
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-[#120a10] border border-rose-500/20 rounded-lg">
                <span className="text-xs text-rose-300 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  High Severity
                </span>
                <span className="text-lg font-black text-rose-400">27</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#12100a] border border-amber-500/20 rounded-lg">
                <span className="text-xs text-amber-300 flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Medium Severity
                </span>
                <span className="text-lg font-black text-amber-400">15</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#0a0e14] border border-indigo-500/20 rounded-lg">
                <span className="text-xs text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Low Severity
                </span>
                <span className="text-lg font-black text-indigo-400">8</span>
              </div>
            </div>
          </div>

          {/* Alert Status Donut */}
          <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider block mb-2">
                ALERT STATUS DISTRIBUTION
              </span>
              <div className="py-2">
                <DonutChart
                  size={120}
                  strokeWidth={13}
                  centerTitle="ACTIVE"
                  centerValue="42%"
                  showLegend={true}
                  segments={[
                    { name: "Active", value: 42, color: "#f43f5e" },
                    { name: "Ack", value: 31, color: "#f59e0b" },
                    { name: "Resolved", value: 27, color: "#10b981" }
                  ]}
                />
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>Resolution Rate: 27%</span>
              <span className="text-emerald-400 font-bold">Auto-Quarantine Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
