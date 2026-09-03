"use client";

import React from "react";

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerTitle?: string;
  centerValue?: string;
  centerSub?: string;
  showLegend?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 140,
  strokeWidth = 14,
  centerTitle,
  centerValue,
  centerSub,
  showLegend = false
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Purely calculate cumulative offsets without mutating variables in render
  const segmentsWithOffsets = segments.map((seg, idx) => {
    const priorTotal = segments.slice(0, idx).reduce((sum, s) => sum + s.value, 0);
    const strokeDashoffset = -((priorTotal / total) * circumference);
    const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
    return { ...seg, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1a1d2e"
            strokeWidth={strokeWidth}
          />
          {/* Segment strokes */}
          {segmentsWithOffsets.map((seg, idx) => (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {centerTitle && <span className="text-[10px] uppercase font-mono text-zinc-500">{centerTitle}</span>}
          {centerValue && <span className="text-xl font-bold font-mono text-zinc-100">{centerValue}</span>}
          {centerSub && <span className="text-[10px] text-zinc-400 font-mono">{centerSub}</span>}
        </div>
      </div>

      {/* Optional Legend */}
      {showLegend && (
        <div className="flex flex-col gap-1.5 text-xs font-mono">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }}></span>
              <span className="text-zinc-400 min-w-[70px]">{s.name}</span>
              <span className="text-zinc-200 font-semibold">{((s.value / total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
