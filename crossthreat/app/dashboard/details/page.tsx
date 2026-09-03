"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FlameIcon } from "@/components/ui/Icons";

export default function AttackDetailsPage() {
  const { selectedHost, currentStep, riskScore } = useDashboard();
  const [actionStatus, setActionStatus] = useState<Record<number, boolean>>({});

  const handleAction = (id: number) => {
    setActionStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const actions = [
    { id: 1, title: "Block source IP address at perimeter firewall", impact: "Immediate containment" },
    { id: 2, title: "Enable TCP SYN flood rate-limiting rule", impact: "Mitigate DoS" },
    { id: 3, title: "Monitor host for credential brute-force attempts", impact: "Early warning" },
    { id: 4, title: "Dispatch high-priority alert to SOC Incident Response", impact: "Escalation" }
  ];

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      {/* Title */}
      <div>
        <h1 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          6. ATTACK DETAILS VIEW — INCIDENT FORENSICS & REMEDIATION
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          Deep packet investigation, telemetry breakdown, and operator remediation runbooks
        </p>
      </div>

      {/* Incident Header Banner */}
      <div className="bg-[#0b0d18] border border-rose-500/30 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500 font-bold block">
            ALERT / ACTIVE INCIDENT
          </span>
          <h2 className="text-2xl font-black font-mono text-zinc-100 mt-0.5">
            {currentStep?.mitre_stage || "Port Scan & Probing Detected"}
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            MITRE Stage: <span className="text-amber-400 font-semibold">{currentStep?.mitre_stage || "Scanning"}</span> | Ground Truth: <span className="text-rose-400 font-semibold">{currentStep?.ground_truth_label || "PortScan"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold flex items-center gap-1.5">
            <FlameIcon className="w-3.5 h-3.5" /> High Severity
          </span>
          <span className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-xs">
            Risk: <strong className="text-rose-400">{riskScore}/100</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 cols: Telemetry Details */}
        <div className="lg:col-span-5 bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl space-y-4">
          <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider block">
            TELEMETRY & PACKET DETAILS
          </span>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Source IP:</span>
              <span className="text-rose-400 font-bold">{selectedHost}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Destination Target:</span>
              <span className="text-zinc-300">10.0.0.1 (Gateway)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Protocol:</span>
              <span className="text-indigo-400 font-semibold">TCP / IPv4</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Timestamp:</span>
              <span className="text-zinc-300">{currentStep?.timestamp || "11:42:03 AM"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Affected Ports:</span>
              <span className="text-amber-400 font-bold">22, 80, 443, 3389, 8080</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Packets (Fwd / Bwd):</span>
              <span className="text-zinc-300">
                {currentStep?.metrics?.fwd_pkts_sum || 1254} / {currentStep?.metrics?.bwd_pkts_sum || 892}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Payload Volume:</span>
              <span className="text-zinc-300">3.62 MB</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#151828]">
              <span className="text-zinc-500">Incident Status:</span>
              <span className="text-rose-400 font-bold">ACTIVE MITIGATION</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>Sensor: CICFlowMeter Exporter</span>
            <span className="text-zinc-400">Fingerprint: CSE-CIC-IDS2018</span>
          </div>
        </div>

        {/* Right 7 cols: Description + Recommended Actions + Related Events */}
        <div className="lg:col-span-7 space-y-4">
          {/* Forensic Description */}
          <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl space-y-2 font-mono">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              FORENSIC INCIDENT DESCRIPTION
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed bg-[#0e1022] p-3.5 rounded-lg border border-[#191c32]">
              Multiple connection attempts were observed from source IP <strong className="text-rose-400">{selectedHost}</strong> targeting multiple critical ports on 10.0.0.1 and internal subnet nodes. Sequence features demonstrate SYN/RST flag anomalies, high flow velocity, and characteristic adversarial reconnaissance preceding exploitation.
            </p>
          </div>

          {/* Recommended Actions */}
          <div className="bg-[#0b0d18] border border-[#171a2c] rounded-xl p-5 shadow-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                RECOMMENDED OPERATOR ACTIONS
              </span>
              <span className="text-[10px] text-emerald-400">Automated SOAR</span>
            </div>

            <div className="space-y-2">
              {actions.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleAction(act.id)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                    actionStatus[act.id]
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-[#0e1022] border-[#181b30] hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                      {actionStatus[act.id] ? "✓" : act.id}
                    </span>
                    <div>
                      <div className="text-xs font-bold">{act.title}</div>
                      <div className="text-[10px] text-zinc-500">{act.impact}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    actionStatus[act.id]
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {actionStatus[act.id] ? "EXECUTED" : "EXECUTE"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
