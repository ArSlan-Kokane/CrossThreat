"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { KillChainProgress } from "@/components/charts/KillChainProgress";
import { DonutChart } from "@/components/charts/DonutChart";

import { TrendingUpIcon, FlameIcon } from "@/components/ui/Icons";

export default function OverviewPage() {
  const {
    currentStep,
    riskScore,
    currentMitreStageIndex,
    currentStepIndex,
    setCurrentStepIndex,
    replayData,
    selectedHost
  } = useDashboard();

  const nextProb = Math.round((currentStep?.forecast_probability || 0.82) * 100);
  const nextStage = currentStep?.forecast_next_state || "EXPLOITATION";
  const currentStage = currentStep?.mitre_stage || "SCANNING";

  // Top Talkers data derived from metrics & hosts
  const topTalkers = [
    { ip: selectedHost, sent: "1,254", recv: "3,001", flows: currentStep?.metrics?.flow_count ? currentStep.metrics.flow_count * 8 : 520, isThreat: true },
    { ip: "192.168.10.23", sent: "962", recv: "1,065", flows: 312, isThreat: false },
    { ip: "192.168.10.8", sent: "623", recv: "878", flows: 210, isThreat: false },
    { ip: "192.168.10.12", sent: "512", recv: "678", flows: 196, isThreat: false },
    { ip: "192.168.10.14", sent: "410", recv: "560", flows: 176, isThreat: false }
  ];

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            1. DASHBOARD OVERVIEW — THREAT SITUATIONAL AWARENESS
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Real-time passive traffic ingestion & deep sequential forecast horizon
          </p>
        </div>
      </div>

      {/* Row 1: Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Current Network State */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 flex flex-col justify-between card-glow-amber">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>CURRENT NETWORK STATE</span>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
              Stage {currentMitreStageIndex} of 6
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black font-mono tracking-tight text-amber-300">
              {currentStage.toUpperCase()}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              {currentStep?.ground_truth_label === "Benign"
                ? "Normal baseline traffic profile"
                : "Active reconnaissance & infiltration in progress"}
            </p>
          </div>

          <div className="pt-2 border-t border-[#171a2c] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Detection: {currentStep?.detection_source || "ML Model"}</span>
            <span className="text-zinc-300 font-bold">{( (currentStep?.baseline_probability || 0.94) * 100).toFixed(0)}% Conf</span>
          </div>
        </div>

        {/* Card 2: Threat Level */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 flex flex-col justify-between card-glow-red">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>THREAT LEVEL</span>
            <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[10px]">
              <FlameIcon className="w-3 h-3 text-rose-500" />
              {riskScore > 75 ? "CRITICAL" : riskScore > 50 ? "HIGH" : "ELEVATED"}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-3">
            <span className="text-3xl font-black font-mono text-rose-400">{riskScore}</span>
            <span className="text-xs font-mono text-zinc-500">/ 100 Risk Score</span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
              style={{ width: `${riskScore}%` }}
            />
          </div>

          <div className="pt-2 border-t border-[#171a2c] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Attack Velocity: +18.4%</span>
            <span className="text-rose-400 font-semibold">Priority 1 Alert</span>
          </div>
        </div>

        {/* Card 3: Next Likely Attack Stage */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 flex flex-col justify-between card-glow-indigo">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>NEXT LIKELY ATTACK STAGE</span>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px]">
              Forecasting
            </span>
          </div>

          <div className="my-1 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black font-mono tracking-tight text-indigo-300">
                {nextStage.toUpperCase()}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">
                Lead Time: <span className="text-zinc-200 font-bold">~30 sec</span>
              </div>
            </div>
            {/* Donut percentage gauge */}
            <DonutChart
              size={64}
              strokeWidth={8}
              centerValue={`${nextProb}%`}
              segments={[
                { name: "Target", value: nextProb, color: "#6366f1" },
                { name: "Other", value: 100 - nextProb, color: "#1a1d2e" }
              ]}
            />
          </div>

          <div className="pt-2 border-t border-[#171a2c] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Model: PyTorch LSTM</span>
            <span className="text-indigo-400 font-semibold">Horizon: 30s-120s</span>
          </div>
        </div>

        {/* Card 4: Alternative Outcomes */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>ALTERNATIVE OUTCOMES</span>
            <span className="text-zinc-500 text-[10px] font-mono">Top Candidates</span>
          </div>

          <div className="space-y-1.5 my-1 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Continued Scanning
              </span>
              <span className="text-zinc-300 font-bold">11%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Reconnaissance
              </span>
              <span className="text-zinc-300 font-bold">5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                Other Activities
              </span>
              <span className="text-zinc-500 font-bold">2%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#171a2c] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Forecast Horizon: 60-120 sec</span>
            <span className="text-emerald-400 font-bold">Confidence: High</span>
          </div>
        </div>
      </div>

      {/* Row 2: Attack Progression Timeline Scrubber */}
      <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
              ATTACK PROGRESSION TIMELINE (MITRE ATT&CK MAPPING)
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
              Live Synchronized
            </span>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            Sequence Window: <span className="text-zinc-200 font-bold">{currentStepIndex + 1}</span> / {replayData?.total_steps || 10}
          </div>
        </div>

        {/* Kill Chain Progress Steps */}
        <div className="py-2">
          <KillChainProgress currentStageId={currentMitreStageIndex} />
        </div>

        {/* Time Window Slider */}
        {replayData && (
          <div className="mt-5 pt-3 border-t border-[#151828] space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>TIME WINDOW: -120 sec (Historical Context)</span>
              <span className="text-rose-400 font-bold">NOW (Target Prediction Step)</span>
              <span>+120 sec (Forecasted Horizon)</span>
            </div>
            <input
              type="range"
              min={0}
              max={replayData.steps.length - 1}
              value={currentStepIndex}
              onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        )}
      </div>

      {/* Row 3: Why This Forecast + Live Network Summary + Top Talkers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Why This Forecast? */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                WHY THIS FORECAST?
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                SHAP & Gradient
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {currentStep?.forecast_attribution && currentStep.forecast_attribution.length > 0 ? (
                currentStep.forecast_attribution.slice(0, 5).map((attr, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 bg-[#0e1020] rounded border border-[#181b30]">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span className="text-zinc-300 truncate">{attr.feature}</span>
                    </div>
                    <span className="text-indigo-300 font-bold shrink-0">
                      +{attr.value.toFixed(3)}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between text-[11px] p-1.5 bg-[#0e1020] rounded border border-[#181b30]">
                    <span className="text-zinc-300">Increase in connection attempts</span>
                    <span className="text-rose-400 font-bold">High</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-1.5 bg-[#0e1020] rounded border border-[#181b30]">
                    <span className="text-zinc-300">High port diversity in short time</span>
                    <span className="text-rose-400 font-bold">High</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-1.5 bg-[#0e1020] rounded border border-[#181b30]">
                    <span className="text-zinc-300">Repeated probing to target host</span>
                    <span className="text-amber-400 font-bold">Medium</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-1.5 bg-[#0e1020] rounded border border-[#181b30]">
                    <span className="text-zinc-300">Abnormal packet rate change</span>
                    <span className="text-amber-400 font-bold">Medium</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#151828] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Historical pattern similarity</span>
            <span className="text-emerald-400 font-bold">87%</span>
          </div>
        </div>

        {/* Panel 2: Live Network Summary */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                LIVE NETWORK SUMMARY
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Window: 30s</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-[#0e1020] p-2.5 rounded border border-[#181b30]">
                <div className="text-[10px] text-zinc-500 uppercase">Total Flows</div>
                <div className="text-lg font-bold text-zinc-100 mt-0.5">
                  {currentStep?.metrics?.flow_count ? (currentStep.metrics.flow_count * 280).toLocaleString() : "12,543"}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUpIcon className="w-2.5 h-2.5" /> +2.83%
                </div>
              </div>

              <div className="bg-[#0e1020] p-2.5 rounded border border-[#181b30]">
                <div className="text-[10px] text-zinc-500 uppercase">Active Src IPs</div>
                <div className="text-lg font-bold text-zinc-100 mt-0.5">256</div>
                <div className="text-[10px] text-indigo-400 flex items-center gap-1 mt-0.5">
                  <TrendingUpIcon className="w-2.5 h-2.5" /> +1.24%
                </div>
              </div>

              <div className="bg-[#0e1020] p-2.5 rounded border border-[#181b30]">
                <div className="text-[10px] text-zinc-500 uppercase">Dst Port Fan-Out</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">
                  {currentStep?.metrics?.unique_dst_ports || 14}
                </div>
                <div className="text-[10px] text-amber-400">Elevated</div>
              </div>

              <div className="bg-[#0e1020] p-2.5 rounded border border-[#181b30]">
                <div className="text-[10px] text-zinc-500 uppercase">Packets / sec</div>
                <div className="text-lg font-bold text-zinc-100 mt-0.5">
                  {currentStep?.metrics?.flow_pkts_avg ? (currentStep.metrics.flow_pkts_avg * 40).toFixed(0) : "8,852"}
                </div>
                <div className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5">
                  <TrendingUpIcon className="w-2.5 h-2.5" /> High volume
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#151828] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Throughput: ~5.35 MB/s</span>
            <span className="text-zinc-400 font-semibold">Protocol: TCP 88%</span>
          </div>
        </div>

        {/* Panel 3: Top Talkers */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                TOP TALKERS
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-semibold">Live Traffic</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="text-[9px] text-zinc-500 border-b border-[#151828] pb-1 uppercase">
                    <th className="pb-1.5 font-normal">IP Address</th>
                    <th className="pb-1.5 font-normal text-right">Sent (KB)</th>
                    <th className="pb-1.5 font-normal text-right">Recv (KB)</th>
                    <th className="pb-1.5 font-normal text-right">Flows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121526]">
                  {topTalkers.map((talker, i) => (
                    <tr key={i} className={`hover:bg-[#121528] transition ${talker.isThreat ? "text-rose-400 font-bold" : "text-zinc-300"}`}>
                      <td className="py-1.5 flex items-center gap-1.5">
                        {talker.isThreat && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        {talker.ip}
                      </td>
                      <td className="py-1.5 text-right font-semibold">{talker.sent}</td>
                      <td className="py-1.5 text-right font-semibold">{talker.recv}</td>
                      <td className="py-1.5 text-right text-zinc-400">{talker.flows}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#151828] flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>Primary Suspect: {selectedHost}</span>
            <span className="text-rose-400 font-bold">Threat Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
