"use client";

import React, { useState } from "react";

interface Node {
  id: string;
  name: string;
  ip: string;
  type: "threat" | "gateway" | "client" | "server" | "db";
  x: number;
  y: number;
  flows: number;
  status: "compromised" | "targeted" | "normal";
}

export const NetworkTopologyGraph: React.FC<{ targetHost?: string }> = ({
  targetHost = "192.168.10.15"
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const centerNode: Node = {
    id: "target",
    name: "Target Host",
    ip: targetHost,
    type: "threat",
    x: 250,
    y: 170,
    flows: 480,
    status: "compromised"
  };

  const peripheralNodes: Node[] = [
    { id: "n1", name: "Gateway", ip: "10.0.0.1", type: "gateway", x: 250, y: 45, flows: 240, status: "normal" },
    { id: "n2", name: "Web Svc", ip: "192.168.10.23", type: "server", x: 410, y: 110, flows: 180, status: "targeted" },
    { id: "n3", name: "DB Master", ip: "192.168.10.8", type: "db", x: 390, y: 260, flows: 95, status: "targeted" },
    { id: "n4", name: "Workstation", ip: "192.168.10.14", type: "client", x: 110, y: 250, flows: 65, status: "normal" },
    { id: "n5", name: "DC Server", ip: "192.168.10.12", type: "server", x: 90, y: 110, flows: 140, status: "targeted" }
  ];

  return (
    <div className="w-full relative select-none">
      <svg viewBox="0 0 500 320" className="w-full h-auto">
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Links to Central Node */}
        {peripheralNodes.map((node) => {
          const isTargeted = node.status === "targeted";
          const linkColor = isTargeted ? "#f43f5e" : "#06b6d4";

          return (
            <g key={node.id}>
              {/* Line */}
              <line
                x1={centerNode.x}
                y1={centerNode.y}
                x2={node.x}
                y2={node.y}
                stroke={linkColor}
                strokeWidth={isTargeted ? "2" : "1.2"}
                strokeOpacity={isTargeted ? "0.7" : "0.35"}
                strokeDasharray={isTargeted ? "4 2" : "none"}
              />

              {/* Animated traveling packet */}
              <circle r="2.5" fill={linkColor}>
                <animateMotion
                  path={`M ${node.x} ${node.y} L ${centerNode.x} ${centerNode.y}`}
                  dur={isTargeted ? "1.8s" : "3s"}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Central Threat Epicenter Node */}
        <g
          className="cursor-pointer"
          onClick={() => setSelectedNode(centerNode.ip)}
        >
          {/* Radar ripple */}
          <circle cx={centerNode.x} cy={centerNode.y} r="28" fill="none" stroke="#f43f5e" opacity="0.4">
            <animate attributeName="r" values="18;45;18" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" />
          </circle>

          <circle
            cx={centerNode.x}
            cy={centerNode.y}
            r="19"
            fill="#180a12"
            stroke="#f43f5e"
            strokeWidth="3"
            filter="url(#nodeGlow)"
          />
          <text
            x={centerNode.x}
            y={centerNode.y + 4}
            textAnchor="middle"
            fill="#f43f5e"
            fontSize="10"
            fontWeight="bold"
            className="font-mono"
          >
            !
          </text>
          <text
            x={centerNode.x}
            y={centerNode.y + 32}
            textAnchor="middle"
            fill="#f43f5e"
            fontSize="10"
            fontWeight="bold"
            className="font-mono"
          >
            {centerNode.ip}
          </text>
          <text
            x={centerNode.x}
            y={centerNode.y + 44}
            textAnchor="middle"
            fill="#881337"
            fontSize="8"
            className="font-mono uppercase"
          >
            Threat Vector
          </text>
        </g>

        {/* Peripheral Nodes */}
        {peripheralNodes.map((node) => {
          const isTargeted = node.status === "targeted";
          const nodeColor = isTargeted ? "#f59e0b" : "#38bdf8";

          return (
            <g
              key={node.id}
              className="cursor-pointer group"
              onClick={() => setSelectedNode(node.ip)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r="13"
                fill="#0d1122"
                stroke={nodeColor}
                strokeWidth="1.8"
                className="transition-all duration-200 group-hover:r-15"
              />
              <circle cx={node.x} cy={node.y} r="4" fill={nodeColor} />
              
              <text
                x={node.x}
                y={node.y - 18}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="9"
                fontWeight="semibold"
                className="font-mono"
              >
                {node.name}
              </text>
              <text
                x={node.x}
                y={node.y + 24}
                textAnchor="middle"
                fill="#64748b"
                fontSize="8"
                className="font-mono"
              >
                {node.ip}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Traffic Legend at bottom */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1a1d2e] text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-rose-500 inline-block"></span> High Attack Traffic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-amber-500 inline-block"></span> Moderate Infiltration
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-cyan-500 inline-block"></span> Low Baseline
          </span>
        </div>
        {selectedNode && (
          <span className="text-zinc-300">Selected Node: {selectedNode}</span>
        )}
      </div>
    </div>
  );
};
