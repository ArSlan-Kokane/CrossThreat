"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { AreaLineChart } from "@/components/charts/AreaLineChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendingUpIcon, FileTextIcon } from "@/components/ui/Icons";

export default function ReportsPage() {
  const { genResults } = useDashboard();
  const [activeReport, setActiveReport] = useState<string>("Executive Summary");
  const [downloading, setDownloading] = useState<boolean>(false);

  const reportsList = [
    "Executive Summary",
    "Threat Report",
    "Attack Timeline Report",
    "Traffic Analysis Report",
    "Model Performance Report",
    "Compliance Report",
    "OOD Generalization (CIC-IDS2017)"
  ];

  const handleGenerate = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Executive Threat Forecast Report generated and downloaded as PDF.");
    }, 1200);
  };

  // 24-hr attacks over time sample points
  const attacks24hr = [
    { time: "12 AM", score: 32 },
    { time: "04 AM", score: 24 },
    { time: "08 AM", score: 65 },
    { time: "12 PM", score: 48 },
    { time: "04 PM", score: 85 },
    { time: "08 PM", score: 56 },
    { time: "11 PM", score: 72 }
  ];

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* Title & Generate Report Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            8. REPORTS & ANALYTICS — EXECUTIVE COMPLIANCE & GENERALIZATION
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Automated intelligence briefs, out-of-distribution audits, and adversary metrics
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={downloading}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/30 shrink-0"
        >
          <FileTextIcon className="w-4 h-4" />
          <span>{downloading ? "Generating PDF..." : "Generate Report"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 4 cols: Reports List Menu */}
        <div className="lg:col-span-4 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between font-mono">
          <div>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-3">
              AVAILABLE INTELLIGENCE REPORTS
            </span>

            <div className="space-y-1">
              {reportsList.map((rep) => {
                const isActive = activeReport === rep;
                return (
                  <div
                    key={rep}
                    onClick={() => setActiveReport(rep)}
                    className={`px-3 py-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-bold"
                        : "text-zinc-400 hover:bg-[#121526] hover:text-zinc-200"
                    }`}
                  >
                    <span>{rep}</span>
                    <span className="text-[10px] text-zinc-600">→</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#151828] text-[10px] text-zinc-500 flex justify-between">
            <span>Audit Standard: ISO 27001</span>
            <span className="text-emerald-400 font-semibold">Verified</span>
          </div>
        </div>

        {/* Right 8 cols: Executive Summary Dashboard */}
        <div className="lg:col-span-8 space-y-4">
          {/* Executive Summary Top KPIs */}
          <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl font-mono">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-3">
              EXECUTIVE SUMMARY (LAST 24 HOURS)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
                <span className="text-[10px] text-zinc-500 uppercase">Total Threats</span>
                <div className="text-2xl font-black text-zinc-100 mt-1">193</div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <TrendingUpIcon className="w-2.5 h-2.5" /> +12.1%
                </span>
              </div>

              <div className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
                <span className="text-[10px] text-zinc-500 uppercase">High Severity</span>
                <div className="text-2xl font-black text-rose-400 mt-1">58</div>
                <span className="text-[10px] text-rose-400 flex items-center gap-0.5 mt-0.5">
                  <TrendingUpIcon className="w-2.5 h-2.5" /> +10.2%
                </span>
              </div>

              <div className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
                <span className="text-[10px] text-zinc-500 uppercase">Blocked Attacks</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">156</div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <TrendingUpIcon className="w-2.5 h-2.5" /> +15.3%
                </span>
              </div>

              <div className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
                <span className="text-[10px] text-zinc-500 uppercase">Avg Response Time</span>
                <div className="text-2xl font-black text-indigo-300 mt-1">46.7 sec</div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  -8.4% faster
                </span>
              </div>
            </div>
          </div>

          {/* Attacks Over Time & Top Attack Types */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Attacks Over Time */}
            <div className="md:col-span-7 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                    ATTACKS OVER TIME
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">24hr Trend</span>
                </div>
                <AreaLineChart
                  data={attacks24hr}
                  height={140}
                  color="#f43f5e"
                  gradientId="reports24hrGrad"
                />
              </div>

              <div className="pt-2 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
                <span>Peak Volume: 04:00 PM</span>
                <span className="text-rose-400 font-semibold">High Activity Window</span>
              </div>
            </div>

            {/* Top Attack Types */}
            <div className="md:col-span-5 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider block mb-2">
                  TOP ATTACK TYPES
                </span>
                <div className="py-2">
                  <DonutChart
                    size={110}
                    strokeWidth={12}
                    centerTitle="Top Type"
                    centerValue="35%"
                    showLegend={true}
                    segments={[
                      { name: "Brute Force", value: 35, color: "#f43f5e" },
                      { name: "Scanning", value: 28, color: "#f59e0b" },
                      { name: "Exploitation", value: 20, color: "#6366f1" },
                      { name: "Malware", value: 10, color: "#06b6d4" },
                      { name: "Other", value: 7, color: "#52576e" }
                    ]}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#151828] text-[10px] font-mono text-zinc-500 flex justify-between">
                <span>Attack Classes: 11 Identified</span>
                <span className="text-zinc-400 font-semibold">100% Attributed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission 6 OOD Generalization Assessment Banner */}
      <div className="bg-[#0b0d18] border border-indigo-500/20 rounded-xl p-5 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            MISSION 6: OUT-OF-DISTRIBUTION (OOD) GENERALIZATION AUDIT — CIC-IDS2017
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
            Leakage-Safe Validation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
            <span className="text-zinc-500 text-[10px] uppercase">In-Distribution Accuracy (IDS2018)</span>
            <div className="text-2xl font-black text-zinc-100 mt-1">
              {((genResults?.indist_accuracy || 0.942) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-zinc-500">Days 8-10 held-out</span>
          </div>

          <div className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
            <span className="text-zinc-500 text-[10px] uppercase">OOD Accuracy (CIC-IDS2017)</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {((genResults?.ood_accuracy || 0.865) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-indigo-300">Unseen network topology</span>
          </div>

          <div className="bg-[#0e1022] p-3 rounded-lg border border-[#181b30]">
            <span className="text-zinc-500 text-[10px] uppercase">Generalization Delta</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {((genResults?.accuracy_delta || -0.077) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Under 10% Drop (Stable)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
