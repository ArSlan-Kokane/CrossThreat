"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { NetworkTopologyGraph } from "@/components/charts/NetworkTopologyGraph";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendingUpIcon } from "@/components/ui/Icons";

export default function NetworkPage() {
  const { selectedHost } = useDashboard();

  const pairs = [
    { src: selectedHost, dst: "10.0.0.1", proto: "TCP", bytes: "2.45 MB", flows: "4,521", isTarget: true },
    { src: selectedHost, dst: "192.168.10.23", proto: "TCP", bytes: "1.12 MB", flows: "2,356", isTarget: true },
    { src: "192.168.10.8", dst: selectedHost, proto: "TCP", bytes: "985 KB", flows: "1,645", isTarget: false },
    { src: "192.168.10.14", dst: selectedHost, proto: "UDP", bytes: "645 KB", flows: "1,123", isTarget: false },
    { src: "192.168.10.12", dst: "10.0.0.1", proto: "UDP", bytes: "312 KB", flows: "856", isTarget: false }
  ];

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* Title */}
      <div>
        <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          3. LIVE NETWORK MONITOR — FLOW TOPOLOGY & PROTOCOL BREAKDOWN
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          Real-time packet inspection, host connection graphs, and bandwidth utilization telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 cols: Interactive Network Topology */}
        <div className="lg:col-span-7 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                NETWORK TOPOLOGY CLUSTER
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-semibold">
                Epicenter: {selectedHost}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mb-4">
              Real-time socket communication fan-out. Click on any peripheral node to inspect bidirectional flows.
            </p>

            <NetworkTopologyGraph targetHost={selectedHost} />
          </div>

          <div className="mt-4 pt-3 border-t border-[#151828] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Graph Layout: Star Topology</span>
            <span className="text-emerald-400 font-bold">Packets Live Stream: 60 FPS</span>
          </div>
        </div>

        {/* Right 5 cols: Flow Summary + Protocol Breakdown + Top Pairs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Flow Summary & Protocol Breakdown */}
          <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Flow Summary */}
            <div className="space-y-3 font-mono">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                FLOW SUMMARY
              </span>

              <div className="space-y-2">
                <div className="bg-[#0e1022] p-2 rounded border border-[#181b30]">
                  <span className="text-[10px] text-zinc-500 uppercase">Total Flows</span>
                  <div className="text-base font-bold text-zinc-100">12,543</div>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                    <TrendingUpIcon className="w-2.5 h-2.5" /> +2.83%
                  </span>
                </div>

                <div className="bg-[#0e1022] p-2 rounded border border-[#181b30]">
                  <span className="text-[10px] text-zinc-500 uppercase">Active Connections</span>
                  <div className="text-base font-bold text-zinc-100">256</div>
                  <span className="text-[9px] text-indigo-400 flex items-center gap-0.5">
                    <TrendingUpIcon className="w-2.5 h-2.5" /> +1.24%
                  </span>
                </div>

                <div className="bg-[#0e1022] p-2 rounded border border-[#181b30]">
                  <span className="text-[10px] text-zinc-500 uppercase">Bandwidth Rate</span>
                  <div className="text-base font-bold text-zinc-100">5.35 MB/s</div>
                  <span className="text-[9px] text-rose-400 flex items-center gap-0.5">
                    <TrendingUpIcon className="w-2.5 h-2.5" /> +3.12%
                  </span>
                </div>
              </div>
            </div>

            {/* Protocol Breakdown Donut */}
            <div className="flex flex-col justify-between">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider block mb-1">
                PROTOCOL BREAKDOWN
              </span>
              <div className="py-2">
                <DonutChart
                  size={110}
                  strokeWidth={12}
                  centerTitle="TCP"
                  centerValue="68%"
                  showLegend={true}
                  segments={[
                    { name: "TCP", value: 68, color: "#6366f1" },
                    { name: "UDP", value: 21, color: "#06b6d4" },
                    { name: "ICMP", value: 7, color: "#f59e0b" },
                    { name: "Other", value: 4, color: "#52576e" }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Top Communication Pairs Table */}
          <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                TOP COMMUNICATION PAIRS
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Sorted by Volume</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="text-[9px] text-zinc-500 border-b border-[#151828] uppercase">
                    <th className="pb-1.5 font-normal">Source IP</th>
                    <th className="pb-1.5 font-normal">Destination</th>
                    <th className="pb-1.5 font-normal">Proto</th>
                    <th className="pb-1.5 font-normal text-right">Bytes</th>
                    <th className="pb-1.5 font-normal text-right">Flows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121526]">
                  {pairs.map((p, i) => (
                    <tr key={i} className={`hover:bg-[#121528] transition ${p.isTarget ? "text-rose-300" : "text-zinc-300"}`}>
                      <td className="py-1.5">{p.src}</td>
                      <td className="py-1.5 text-zinc-400">{p.dst}</td>
                      <td className="py-1.5">
                        <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {p.proto}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-semibold">{p.bytes}</td>
                      <td className="py-1.5 text-right text-zinc-400">{p.flows}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
