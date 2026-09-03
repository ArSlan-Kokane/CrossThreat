"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { TrendingUpIcon } from "@/components/ui/Icons";

export default function ModelInsightsPage() {
  useDashboard();

  const metrics = [
    { label: "Accuracy", val: "85.6%", change: "+2.1%", isGood: true },
    { label: "Precision", val: "84.2%", change: "+1.4%", isGood: true },
    { label: "Recall", val: "83.1%", change: "+2.6%", isGood: true },
    { label: "F1-Score", val: "83.6%", change: "+1.9%", isGood: true },
    { label: "AUC-ROC", val: "0.91", change: "+0.03", isGood: true }
  ];

  const topFeatures = [
    { label: "Dst Port Count", value: 0.28, color: "#f43f5e" },
    { label: "Packet Rate (pkts/s)", value: 0.21, color: "#f59e0b" },
    { label: "Failed Logins / Flag Anomaly", value: 0.18, color: "#6366f1" },
    { label: "Src IP Diversity", value: 0.14, color: "#06b6d4" },
    { label: "Flow Duration (ms)", value: 0.08, color: "#a855f7" },
    { label: "Protocol TCP Ratio", value: 0.06, color: "#10b981" },
    { label: "Bytes per Flow Avg", value: 0.03, color: "#e2e8f0" },
    { label: "SYN Flag Count", value: 0.02, color: "#ec4899" }
  ];

  const histogramBins = [
    { range: "0-20", count: 45 },
    { range: "20-40", count: 120 },
    { range: "40-60", count: 310 },
    { range: "60-80", count: 720 },
    { range: "80-100", count: 980 }
  ];
  const maxBin = 980;

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* Title */}
      <div>
        <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          7. MODEL INSIGHTS — DEEP LEARNING BENCHMARKS & EXPLAINABILITY
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          Validation metrics, Tree SHAP attributions, confidence distributions, and baseline comparison
        </p>
      </div>

      {/* Row 1: Model Performance KPIs */}
      <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            MODEL PERFORMANCE (LIVE INFERENCE VALIDATION)
          </span>
          <span className="text-[10px] text-zinc-500">Dataset: CSE-CIC-IDS2018 (Held-Out Test Set)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {metrics.map((m, i) => (
            <div key={i} className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
              <span className="text-[10px] text-zinc-500 uppercase">{m.label}</span>
              <div className="text-2xl font-black text-zinc-100 mt-1">{m.val}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUpIcon className="w-2.5 h-2.5" /> {m.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Feature Importance (Top 8) + Confidence Distribution Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Feature Importance (Top 8) */}
        <div className="lg:col-span-6 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                FEATURE IMPORTANCE (TOP 8)
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold">Tree SHAP</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-3">
              Absolute Shapley values computed across Random Forest & LSTM input vectors.
            </p>

            <HorizontalBarChart items={topFeatures} maxVal={0.3} />
          </div>

          <div className="mt-4 pt-3 border-t border-[#151828] text-[10px] text-zinc-500 flex justify-between">
            <span>Primary Driver: Destination Port Fan-out</span>
            <span className="text-zinc-400">Exact Shapley Algorithm</span>
          </div>
        </div>

        {/* Model Confidence Distribution Histogram */}
        <div className="lg:col-span-6 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                MODEL CONFIDENCE DISTRIBUTION
              </span>
              <span className="text-[10px] text-zinc-500">Sample Size: 2,175</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-4">
              Histogram of softmax prediction probabilities illustrating strong calibration toward high confidence.
            </p>

            {/* Custom SVG / Bar Histogram */}
            <div className="h-44 flex items-end justify-between gap-4 pt-4 px-2">
              {histogramBins.map((bin, idx) => {
                const heightPct = (bin.count / maxBin) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-zinc-400 font-bold group-hover:text-indigo-400 transition">
                      {bin.count}
                    </span>
                    <div className="w-full bg-[#121526] rounded-t overflow-hidden h-28 flex items-end">
                      <div
                        className="w-full bg-indigo-500/80 hover:bg-indigo-400 transition-all duration-500 rounded-t"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-semibold">{bin.range}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#151828] text-[10px] text-zinc-500 flex justify-between">
            <span>Confidence Score Bin (%)</span>
            <span className="text-emerald-400 font-bold">Low Epistemic Uncertainty</span>
          </div>
        </div>
      </div>
    </div>
  );
}
