"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldIcon,
  ActivityIcon,
  NetworkIcon,
  BellIcon,
  CpuIcon,
  FileTextIcon,
  CompassIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  RotateCcwIcon
} from "@/components/ui/Icons";
import { useDashboard } from "@/context/DashboardContext";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    hosts,
    selectedHost,
    setSelectedHost,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    stepBackward,
    stepForward,
    resetPlayback,
    currentStepIndex,
    replayData
  } = useDashboard();

  const navItems = [
    { name: "Dashboard", href: "/dashboard/overview", icon: ActivityIcon },
    { name: "Attack Timeline", href: "/dashboard/timeline", icon: CompassIcon },
    { name: "Network View", href: "/dashboard/network", icon: NetworkIcon },
    { name: "Forecasting", href: "/dashboard/forecasting", icon: EyeIcon },
    { name: "Alerts Center", href: "/dashboard/alerts", icon: BellIcon },
    { name: "Attack Details", href: "/dashboard/details", icon: ShieldIcon },
    { name: "Model Insights", href: "/dashboard/insights", icon: CpuIcon },
    { name: "Reports", href: "/dashboard/reports", icon: FileTextIcon }
  ];

  return (
    <aside className="w-64 bg-[#080911] border-r border-[#151828] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand & Logo */}
      <div>
        <div className="p-4 border-b border-[#151828] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/30 shrink-0">
            <ShieldIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[12px] font-black uppercase tracking-wider text-zinc-100 font-mono leading-tight">
              CYBER THREAT
            </div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
              Forecasting Engine
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/dashboard" && item.href.includes("overview"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-mono tracking-wide transition-all duration-150 ${
                  isActive
                    ? "nav-active font-semibold shadow-inner"
                    : "nav-item text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-rose-500" : "text-zinc-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Target Host & Playback Controls in Sidebar Footer */}
      <div className="p-3.5 border-t border-[#151828] bg-[#07080f] space-y-3">
        {/* Host Selector */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>TARGET HOST</span>
            <span className="text-zinc-600">{hosts.length} Hosts</span>
          </div>
          <select
            value={selectedHost}
            onChange={(e) => setSelectedHost(e.target.value)}
            className="w-full bg-[#0d0f1a] border border-[#1a1d2e] text-zinc-200 text-xs font-mono rounded px-2.5 py-1.5 outline-none focus:border-rose-500/60"
          >
            {hosts.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Playback Controls */}
        <div className="bg-[#0b0d18] border border-[#171a2c] rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>REPLAY CONTROL</span>
            <span className="text-rose-400 font-semibold">
              Step {(currentStepIndex + 1)} / {replayData?.total_steps || 10}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <button
              onClick={resetPlayback}
              title="Reset"
              className="p-1.5 rounded hover:bg-[#1a1d2e] text-zinc-400 hover:text-zinc-200 transition"
            >
              <RotateCcwIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={stepBackward}
              disabled={currentStepIndex === 0}
              title="Step Backward"
              className="p-1.5 rounded hover:bg-[#1a1d2e] text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition"
            >
              <SkipBackIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause" : "Play"}
              className={`p-2 rounded-full font-bold transition flex items-center justify-center shadow-md ${
                isPlaying
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }`}
            >
              {isPlaying ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              onClick={stepForward}
              disabled={!replayData || currentStepIndex === replayData.steps.length - 1}
              title="Step Forward"
              className="p-1.5 rounded hover:bg-[#1a1d2e] text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition"
            >
              <SkipForwardIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-[#151828]">
            <span>Speed:</span>
            <div className="flex gap-1">
              {[
                { label: "0.5x", val: 2000 },
                { label: "1x", val: 1200 },
                { label: "2x", val: 600 },
                { label: "4x", val: 300 }
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setPlaybackSpeed(s.val)}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition ${
                    playbackSpeed === s.val
                      ? "bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
