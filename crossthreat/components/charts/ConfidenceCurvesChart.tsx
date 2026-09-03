"use client";

import React from "react";

interface Curve {
  name: string;
  color: string;
  values: number[]; // e.g. 5 points: Now, +1m, +2m, +3m, +4m, +5m
}

export const ConfidenceCurvesChart: React.FC = () => {
  const curves: Curve[] = [
    { name: "Exploitation", color: "#f43f5e", values: [86, 78, 64, 52, 40, 28] },
    { name: "Privilege Escalation", color: "#f59e0b", values: [62, 74, 80, 71, 58, 42] },
    { name: "Persistence", color: "#6366f1", values: [42, 55, 68, 75, 69, 54] },
    { name: "Lateral Movement", color: "#06b6d4", values: [28, 38, 52, 65, 72, 65] },
    { name: "Data Exfiltration", color: "#a855f7", values: [15, 22, 34, 48, 59, 68] },
    { name: "Impact (Ransomware)", color: "#f97316", values: [8, 14, 21, 32, 45, 58] }
  ];

  const timeLabels = ["Now", "+1 min", "+2 min", "+3 min", "+4 min", "+5 min"];
  const width = 500;
  const height = 180;
  const padding = { top: 15, right: 15, bottom: 25, left: 35 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 items-start select-none">
      <div className="w-full md:w-3/4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Y Grid */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = padding.top + graphHeight - (v / 100) * graphHeight;
            return (
              <g key={v}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1a1d2e"
                  strokeDasharray="2 2"
                />
                <text x={padding.left - 6} y={y + 3} fill="#52576e" fontSize="9" textAnchor="end" className="font-mono">
                  {v}
                </text>
              </g>
            );
          })}

          {/* Curves */}
          {curves.map((c, cIdx) => {
            const pts = c.values.map((val, i) => {
              const x = padding.left + (i / (c.values.length - 1)) * graphWidth;
              const y = padding.top + graphHeight - (val / 100) * graphHeight;
              return { x, y };
            });

            // Smooth cubic bezier path
            const pathD = pts.reduce((acc, p, i, a) => {
              if (i === 0) return `M ${p.x},${p.y}`;
              const prev = a[i - 1];
              const cx1 = prev.x + (p.x - prev.x) / 2;
              const cy1 = prev.y;
              const cx2 = prev.x + (p.x - prev.x) / 2;
              const cy2 = p.y;
              return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
            }, "");

            return (
              <g key={cIdx}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={c.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                {pts.map((p, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={p.x}
                    cy={p.y}
                    r={pIdx === 0 ? 3.5 : 2}
                    fill="#0d0f1a"
                    stroke={c.color}
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            );
          })}

          {/* X Axis labels */}
          {timeLabels.map((lbl, i) => {
            const x = padding.left + (i / (timeLabels.length - 1)) * graphWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 6}
                fill="#52576e"
                fontSize="9"
                textAnchor={i === 0 ? "start" : i === timeLabels.length - 1 ? "end" : "middle"}
                className="font-mono"
              >
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend list */}
      <div className="w-full md:w-1/4 space-y-1.5 font-mono text-[11px] pt-2">
        {curves.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
            <span className="text-zinc-400 truncate">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
