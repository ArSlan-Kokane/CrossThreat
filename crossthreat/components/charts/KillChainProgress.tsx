"use client";

import React from "react";

interface Stage {
  id: number;
  name: string;
  status: "Completed" | "Current Stage" | "Predicted" | "Upcoming";
  timeOffset: string;
}

interface KillChainProgressProps {
  currentStageId: number; // 1 to 6
  compact?: boolean;
}

export const KillChainProgress: React.FC<KillChainProgressProps> = ({
  currentStageId = 2,
  compact = false
}) => {
  const stages: Stage[] = [
    {
      id: 1,
      name: "RECONNAISSANCE",
      status: currentStageId > 1 ? "Completed" : currentStageId === 1 ? "Current Stage" : "Upcoming",
      timeOffset: currentStageId > 1 ? "-02:45" : "00:00"
    },
    {
      id: 2,
      name: "SCANNING",
      status: currentStageId > 2 ? "Completed" : currentStageId === 2 ? "Current Stage" : currentStageId < 2 ? "Upcoming" : "Upcoming",
      timeOffset: currentStageId === 2 ? "00:48" : currentStageId > 2 ? "-01:12" : "+00:30"
    },
    {
      id: 3,
      name: "EXPLOITATION",
      status: currentStageId > 3 ? "Completed" : currentStageId === 3 ? "Current Stage" : currentStageId === 2 ? "Predicted" : "Upcoming",
      timeOffset: currentStageId === 3 ? "00:15" : currentStageId === 2 ? "+00:35" : "+01:00"
    },
    {
      id: 4,
      name: "PRIVILEGE ESCALATION",
      status: currentStageId > 4 ? "Completed" : currentStageId === 4 ? "Current Stage" : "Upcoming",
      timeOffset: "+01:20"
    },
    {
      id: 5,
      name: "PERSISTENCE",
      status: currentStageId > 5 ? "Completed" : currentStageId === 5 ? "Current Stage" : "Upcoming",
      timeOffset: "+02:10"
    },
    {
      id: 6,
      name: "LATERAL MOVEMENT",
      status: currentStageId === 6 ? "Current Stage" : "Upcoming",
      timeOffset: "+02:40"
    }
  ];

  return (
    <div className="w-full select-none">
      {/* Horizontal timeline bar */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-zinc-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-700"
            style={{
              width: `${Math.min(Math.max(((currentStageId - 0.5) / 5) * 100, 5), 100)}%`
            }}
          />
        </div>

        {stages.map((stage) => {
          const isCompleted = stage.status === "Completed";
          const isCurrent = stage.status === "Current Stage";
          const isPredicted = stage.status === "Predicted";

          let nodeColor = "border-zinc-700 bg-zinc-900 text-zinc-500";
          let badgeColor = "text-zinc-500";

          if (isCompleted) {
            nodeColor = "border-emerald-500 bg-emerald-950/80 text-emerald-400";
            badgeColor = "text-emerald-400";
          } else if (isCurrent) {
            nodeColor = "border-amber-500 bg-amber-950/80 text-amber-300 ring-4 ring-amber-500/20";
            badgeColor = "text-amber-400 font-bold";
          } else if (isPredicted) {
            nodeColor = "border-rose-500 bg-rose-950/80 text-rose-400 ring-2 ring-rose-500/30";
            badgeColor = "text-rose-400 font-bold";
          }

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              {/* Node Circle */}
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${nodeColor}`}
              >
                {isCompleted ? "✓" : stage.id}
              </div>

              {/* Labels below node */}
              {!compact && (
                <div className="mt-2.5 flex flex-col items-center text-center">
                  <span className={`text-[10px] font-mono tracking-wider font-semibold ${
                    isCurrent ? "text-amber-300" : isPredicted ? "text-rose-400" : isCompleted ? "text-zinc-300" : "text-zinc-500"
                  }`}>
                    {stage.name}
                  </span>
                  <span className={`text-[9px] font-mono mt-0.5 ${badgeColor}`}>
                    {stage.status}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600 mt-0.5">
                    {stage.timeOffset}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
