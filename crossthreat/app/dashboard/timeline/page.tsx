"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { KillChainProgress } from "@/components/charts/KillChainProgress";
import { AreaLineChart } from "@/components/charts/AreaLineChart";
import { DonutChart } from "@/components/charts/DonutChart";

export default function TimelinePage() {
  const { currentStep, riskScore, riskHistory, currentMitreStageIndex } = useDashboard();

  const nextProb = Math.round((currentStep?.forecast_probability || 0.82) * 100);
  const nextStage = currentStep?.forecast_next_state || "Exploitation";

  const stageHistory = [
    { name: "Reconnaissance", enter: "11:36:37 AM", exit: "11:39:22 AM", duration: "02:45", score: 45, status: "Completed" },
    { name: "Scanning", enter: "11:39:22 AM", exit: "Active", duration: "00:48", score: riskScore, status: "Current" },
    { name: "Exploitation", enter: "Projected", exit: "+00:35", duration: "01:10", score: 85, status: "Predicted" },
    { name: "Privilege Escalation", enter: "Projected", exit: "+01:20", duration: "00:50", score: 89, status: "Upcoming" },
    { name: "Persistence", enter: "Projected", exit: "+02:10", duration: "01:30", score: 92, status: "Upcoming" },
    { name: "Lateral Movement", enter: "Projected", exit: "+02:40", duration: "--:--", score: 96, status: "Upcoming" }
  ];

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* View Title */}
      <div>
        <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          2. ATTACK TIMELINE / PROGRESSION VIEW — MITRE ATT&CK STAGE TRANSITIONS
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          Temporal sequence alignment tracking confirmed indicators versus LSTM forward transition forecast
        </p>
      </div>

      {/* Stage Progression Bar Header */}
      <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 shadow-lg">
        <KillChainProgress currentStageId={currentMitreStageIndex} />
      </div>

      {/* 3 Middle Cards: Details, Top Indicators, Transition Probabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Timeline Details */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                TIMELINE DETAILS
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                Active Stage
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-[#141729]">
                <span className="text-zinc-500">Stage:</span>
                <span className="text-amber-300 font-bold uppercase">{currentStep?.mitre_stage || "Scanning"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141729]">
                <span className="text-zinc-500">Start Time:</span>
                <span className="text-zinc-200">{currentStep?.timestamp || "11:39:22 AM"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141729]">
                <span className="text-zinc-500">Duration:</span>
                <span className="text-zinc-200">00:48</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141729]">
                <span className="text-zinc-500">Risk Score:</span>
                <span className="text-rose-400 font-bold">{riskScore} / 100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141729]">
                <span className="text-zinc-500">Confidence:</span>
                <span className="text-emerald-400 font-semibold">High ({( (currentStep?.baseline_probability || 0.94) * 100).toFixed(0)}%)</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-[#0e1022] rounded border border-[#191c32] text-[11px] font-mono text-zinc-400 leading-relaxed">
              Description: Host discovery and service scanning in progress across internal subnets. High packet frequency detected.
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Detection Source:</span>
            <span className="text-zinc-300">{currentStep?.detection_source || "Rule Engine (Signatures)"}</span>
          </div>
        </div>

        {/* Card 2: Top Indicators (Current Stage) */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                TOP INDICATORS (CURRENT STAGE)
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-semibold">
                Signatures
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {currentStep?.triggered_rules && currentStep.triggered_rules.length > 0 ? (
                currentStep.triggered_rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#0e1022] rounded border border-[#1a1d33]">
                    <span className="text-zinc-200 text-[11px] truncate">{rule}</span>
                    <span className="text-rose-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 shrink-0">
                      High
                    </span>
                  </div>
                ))
              ) : null}

              <div className="flex items-center justify-between p-2 bg-[#0e1022] rounded border border-[#1a1d33]">
                <span className="text-zinc-300 text-[11px]">Port scan detected</span>
                <span className="text-rose-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10">High</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0e1022] rounded border border-[#1a1d33]">
                <span className="text-zinc-300 text-[11px]">Multiple connection attempts</span>
                <span className="text-rose-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10">High</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0e1022] rounded border border-[#1a1d33]">
                <span className="text-zinc-300 text-[11px]">Increased packet rate</span>
                <span className="text-amber-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10">Medium</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0e1022] rounded border border-[#1a1d33]">
                <span className="text-zinc-300 text-[11px]">Unusual TTL values</span>
                <span className="text-zinc-500 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800">Low</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Violations active:</span>
            <span className="text-rose-400 font-bold">4 Rules Triggered</span>
          </div>
        </div>

        {/* Card 3: Stage Transition Probabilities */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                STAGE TRANSITION PROBABILITIES
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-bold">
                LSTM Output
              </span>
            </div>

            <div className="py-2">
              <DonutChart
                size={130}
                strokeWidth={14}
                centerTitle="Next Stage"
                centerValue={`${nextProb}%`}
                centerSub={nextStage}
                showLegend={true}
                segments={[
                  { name: "Exploitation", value: nextProb, color: "#f43f5e" },
                  { name: "Privilege Esc", value: 11, color: "#f59e0b" },
                  { name: "Persistence", value: 5, color: "#6366f1" },
                  { name: "Other", value: 2, color: "#52576e" }
                ]}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Lead Time: ~30s</span>
            <span className="text-emerald-400 font-bold">Forecast Proven Ahead of Time</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Risk Score Over Time + Stage History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Score Over Time Line Chart */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
              RISK SCORE OVER TIME
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Current: <span className="text-rose-400 font-bold">{riskScore} / 100</span>
            </span>
          </div>
          <AreaLineChart
            data={riskHistory}
            height={150}
            color="#f43f5e"
            gradientId="timelineRiskGrad"
          />
        </div>

        {/* Stage History Table */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                STAGE HISTORY
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Chronological Audit</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="text-[9px] text-zinc-500 border-b border-[#151828] uppercase">
                    <th className="pb-1.5 font-normal">Stage</th>
                    <th className="pb-1.5 font-normal">Enter Time</th>
                    <th className="pb-1.5 font-normal">Exit Time</th>
                    <th className="pb-1.5 font-normal">Duration</th>
                    <th className="pb-1.5 font-normal text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121526]">
                  {stageHistory.map((s, i) => (
                    <tr key={i} className={`hover:bg-[#121528] transition ${s.status === "Current" ? "text-amber-300 font-bold bg-amber-500/5" : s.status === "Predicted" ? "text-rose-400 font-semibold" : "text-zinc-400"}`}>
                      <td className="py-1.5 flex items-center gap-1.5">
                        {s.status === "Current" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                        {s.status === "Predicted" && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                        {s.name}
                      </td>
                      <td className="py-1.5 text-zinc-400">{s.enter}</td>
                      <td className="py-1.5 text-zinc-400">{s.exit}</td>
                      <td className="py-1.5 text-zinc-500">{s.duration}</td>
                      <td className="py-1.5 text-right font-bold">{s.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Total Recorded Duration: 04:33</span>
            <span className="text-zinc-400">Time-based Split Validation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
