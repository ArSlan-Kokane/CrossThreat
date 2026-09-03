"use client";

import React from "react";

export interface BarItem {
  label: string;
  value: number;
  displayValue?: string;
  color?: string;
  tag?: string;
}

interface HorizontalBarChartProps {
  items: BarItem[];
  maxVal?: number;
  height?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  maxVal,
}) => {
  const calculatedMax = maxVal || Math.max(...items.map((i) => Math.abs(i.value)), 0.01);

  return (
    <div className="w-full space-y-2.5 font-mono text-xs">
      {items.map((item, idx) => {
        const pct = Math.min(Math.max((Math.abs(item.value) / calculatedMax) * 100, 3), 100);
        const barColor = item.color || "#6366f1";

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                {item.tag && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-sans">
                    {item.tag}
                  </span>
                )}
                <span className="text-zinc-300 truncate">{item.label}</span>
              </div>
              <span className="text-zinc-400 font-semibold shrink-0">
                {item.displayValue || item.value.toFixed(3)}
              </span>
            </div>
            {/* Background bar */}
            <div className="w-full h-1.5 bg-[#121526] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
