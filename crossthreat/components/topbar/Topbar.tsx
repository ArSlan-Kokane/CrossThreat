"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { PlayIcon, PauseIcon } from "@/components/ui/Icons";

export const Topbar: React.FC = () => {
  const { isPlaying, setIsPlaying, isApiHealthy } = useDashboard();
  const [timeStr, setTimeStr] = useState<string>("11:42:07 AM");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 border-b border-[#151828] bg-[#07080f]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left Info Badges */}
      <div className="flex items-center gap-6 text-xs font-mono">
        {/* Data Source */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase text-[10px] tracking-wider">DATA SOURCE</span>
          <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
            Network Traffic Replay
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </span>
        </div>

        {/* Dataset */}
        <div className="hidden sm:flex items-center gap-2 border-l border-[#1a1d2e] pl-5">
          <span className="text-zinc-500 uppercase text-[10px] tracking-wider">DATASET</span>
          <span className="text-zinc-300">CSE-CIC-IDS2018</span>
        </div>

        {/* Time */}
        <div className="hidden md:flex items-center gap-2 border-l border-[#1a1d2e] pl-5">
          <span className="text-zinc-500 uppercase text-[10px] tracking-wider">TIME</span>
          <span className="text-zinc-200 font-bold">{timeStr}</span>
        </div>

        {/* Session */}
        <div className="hidden lg:flex items-center gap-2 border-l border-[#1a1d2e] pl-5">
          <span className="text-zinc-500 uppercase text-[10px] tracking-wider">SESSION</span>
          <span className="text-indigo-400 font-semibold">Demo_01</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend health status pill */}
        <div
          className={`hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded border ${
            isApiHealthy
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isApiHealthy ? "bg-emerald-400" : "bg-indigo-400 animate-pulse"}`} />
          {isApiHealthy ? "FastAPI Connected" : "Local ML Pipeline Active"}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-2 border transition shadow-sm ${
            isPlaying
              ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
          }`}
        >
          {isPlaying ? (
            <>
              <PauseIcon className="w-3 h-3" />
              <span>Pause Replay</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-3 h-3 ml-0.5" />
              <span>Play Replay</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
