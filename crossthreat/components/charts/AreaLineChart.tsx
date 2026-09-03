"use client";

import React, { useState } from "react";

interface DataPoint {
  time: string;
  score: number;
  step?: number;
}

interface AreaLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  gradientId?: string;
  showPoints?: boolean;
}

export const AreaLineChart: React.FC<AreaLineChartProps> = ({
  data,
  height = 140,
  color = "#f43f5e",
  gradientId = "riskGrad",
  showPoints = true
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-zinc-600 text-xs font-mono">
        Awaiting sequence data...
      </div>
    );
  }

  const width = 600;
  const padding = { top: 15, right: 20, bottom: 25, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const minVal = 0;
  const maxVal = 100;

  // Generate coordinate points
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * graphWidth;
    const y = padding.top + graphHeight - ((d.score - minVal) / (maxVal - minVal)) * graphHeight;
    return { x, y, ...d };
  });

  // Build SVG path
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  // Closed area path
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${padding.top + graphHeight} L ${points[0].x},${padding.top + graphHeight} Z`
    : "";

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.38" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Y-Axis Gridlines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = padding.top + graphHeight - (val / 100) * graphHeight;
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1a1d2e"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fill="#52576e"
                fontSize="9"
                textAnchor="end"
                className="font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line stroke with subtle glow */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Data points */}
        {showPoints &&
          points.map((pt, i) => (
            <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={i === points.length - 1 ? 5 : 3.5}
                fill="#0d0f1a"
                stroke={color}
                strokeWidth={i === points.length - 1 ? 2.5 : 1.5}
                className="cursor-pointer transition-all duration-150 hover:r-6"
              />
              {i === points.length - 1 && (
                <circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke={color} strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="6;13;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}

        {/* X-Axis timestamps */}
        {points.length > 0 && (
          <>
            <text
              x={points[0].x}
              y={height - 6}
              fill="#52576e"
              fontSize="9"
              textAnchor="start"
              className="font-mono"
            >
              {points[0].time}
            </text>
            {points.length > 2 && (
              <text
                x={points[Math.floor(points.length / 2)].x}
                y={height - 6}
                fill="#52576e"
                fontSize="9"
                textAnchor="middle"
                className="font-mono"
              >
                {points[Math.floor(points.length / 2)].time}
              </text>
            )}
            <text
              x={points[points.length - 1].x}
              y={height - 6}
              fill="#52576e"
              fontSize="9"
              textAnchor="end"
              className="font-mono font-semibold"
            >
              {points[points.length - 1].time}
            </text>
          </>
        )}
      </svg>

      {/* Floating Tooltip */}
      {hoverIdx !== null && points[hoverIdx] && (
        <div
          className="absolute pointer-events-none bg-[#0d0f1a] border border-[#2a2d45] px-2.5 py-1 rounded shadow-xl text-xs font-mono z-20 -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${(points[hoverIdx].x / width) * 100}%`,
            top: `${(points[hoverIdx].y / height) * 100}%`
          }}
        >
          <div className="text-zinc-400 text-[10px]">{points[hoverIdx].time}</div>
          <div className="text-white font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
            Score: {points[hoverIdx].score}
          </div>
        </div>
      )}
    </div>
  );
};
