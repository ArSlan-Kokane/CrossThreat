"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ConfidenceCurvesChart } from "@/components/charts/ConfidenceCurvesChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";

export default function ForecastingPage() {
  useDashboard();

  const predictions = [
    { stage: "Exploitation", eta: "00:35", conf: "82%", risk: "High", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { stage: "Privilege Escalation", eta: "01:20", conf: "71%", risk: "High", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { stage: "Persistence", eta: "02:10", conf: "63%", risk: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { stage: "Lateral Movement", eta: "03:40", conf: "54%", risk: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { stage: "Data Exfiltration", eta: "05:10", conf: "42%", risk: "Low", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { stage: "Impact (Ransomware)", eta: "07:20", conf: "28%", risk: "Low", color: "text-zinc-400 bg-zinc-800/40 border-zinc-700/30" }
  ];

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* Title */}
      <div>
        <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          4. ATTACK FORECASTING VIEW — SEQUENTIAL PREDICTIVE HORIZONS
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          LSTM Deep Learning transitions anticipating adversary tactics before payload execution
        </p>
      </div>

      {/* Top 2 Panels: Upcoming Attack Predictions Table + Confidence Curves Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 6 cols: Upcoming Predictions Table */}
        <div className="lg:col-span-6 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                UPCOMING ATTACK PREDICTIONS
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                Temporal Horizon: ~30s Lead Time
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-[9px] text-zinc-500 border-b border-[#151828] uppercase">
                    <th className="pb-2 font-normal">Attack Stage</th>
                    <th className="pb-2 font-normal">ETA</th>
                    <th className="pb-2 font-normal">Confidence</th>
                    <th className="pb-2 font-normal text-right">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121526]">
                  {predictions.map((p, i) => (
                    <tr key={i} className="hover:bg-[#121528] transition">
                      <td className="py-2.5 font-bold text-zinc-200">{p.stage}</td>
                      <td className="py-2.5 text-zinc-400 font-semibold">{p.eta}</td>
                      <td className="py-2.5 text-indigo-400 font-bold">{p.conf}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${p.color}`}>
                          {p.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Input Context Length: 5 Time Windows (2.5 min)</span>
            <span className="text-emerald-400 font-bold">Deterministic Probability Vector</span>
          </div>
        </div>

        {/* Right 6 cols: Prediction Confidence Decay Curves */}
        <div className="lg:col-span-6 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                PREDICTION CONFIDENCE OVER TIME
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Confidence Decay %</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mb-2">
              Model decay projections estimating threat probability across increasing lead-time horizons.
            </p>

            <ConfidenceCurvesChart />
          </div>

          <div className="mt-4 pt-3 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Projection Interval: +1m to +5m</span>
            <span className="text-zinc-400">Target: High Confidence Window</span>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Prediction Explanation (XAI) & Model Advantage Proof */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Explanation Narrative */}
        <div className="lg:col-span-7 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
              PREDICTION EXPLANATION (XAI NARRATIVE)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              Mission 5 Compliant
            </span>
          </div>

          <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-[#0e1022] p-4 rounded-lg border border-[#1a1d33]">
            The model has identified sequential patterns of port scanning, service enumeration, and repeated TCP handshake retries which historically precede exploitation attempts within 30-60 seconds. Based on similar past attacks in CSE-CIC-IDS2018, exploitation is the most probable next step (82% probability).
          </p>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-1">
            <div className="bg-[#0e1022] p-3 rounded border border-[#181b30]">
              <span className="text-[10px] text-zinc-500 uppercase">Input x Gradient Factor</span>
              <p className="text-sm font-bold text-indigo-300 mt-1">Flow Packet Surge (+0.442)</p>
              <span className="text-[9px] text-zinc-500">Highest temporal sensitivity</span>
            </div>
            <div className="bg-[#0e1022] p-3 rounded border border-[#181b30]">
              <span className="text-[10px] text-zinc-500 uppercase">Baseline vs LSTM Advantage</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">+30s Pre-Warning Lead</p>
              <span className="text-[9px] text-zinc-500">Single-window RF was blind</span>
            </div>
          </div>
        </div>

        {/* Feature Drivers List */}
        <div className="lg:col-span-5 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
              KEY TEMPORAL ATTRIBUTIONS
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Weight</span>
          </div>

          <HorizontalBarChart
            items={[
              { label: "fwd_pkts_sum", value: 0.42, color: "#6366f1", tag: "Vol" },
              { label: "unique_dst_ports", value: 0.38, color: "#f43f5e", tag: "Port" },
              { label: "flow_count", value: 0.31, color: "#f59e0b", tag: "Flow" },
              { label: "syn_flag_sum", value: 0.24, color: "#06b6d4", tag: "TCP" },
              { label: "protocol_tcp_ratio", value: 0.16, color: "#a855f7", tag: "Proto" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
