"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";

export interface FeatureImportance {
  feature: string;
  value: number;
}

export interface TimelineStep {
  step: number;
  timestamp: string;
  ground_truth_label: string;
  baseline_predicted_state: string;
  baseline_probability: number;
  baseline_shap: FeatureImportance[];
  forecast_next_state: string;
  forecast_probability: number;
  forecast_lead_time: string;
  forecast_attribution: FeatureImportance[];
  mitre_stage: string;
  rule_stage: string;
  ml_stage: string;
  triggered_rules: string[];
  detection_source: string;
  metrics: Record<string, number>;
}

export interface ReplayData {
  host: string;
  total_steps: number;
  steps: TimelineStep[];
}

export interface GeneralizationResults {
  indist_accuracy: number;
  ood_accuracy: number;
  accuracy_delta: number;
  ood_sequences: number;
}

export interface AlertItem {
  id: string;
  time: string;
  alert: string;
  source: string;
  dest: string;
  severity: "High" | "Medium" | "Low";
  status: "Active" | "Acknowledged" | "Resolved";
  mitreStage: string;
}

interface DashboardContextType {
  hosts: string[];
  selectedHost: string;
  setSelectedHost: (host: string) => void;
  replayData: ReplayData | null;
  currentStepIndex: number;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  genResults: GeneralizationResults | null;
  isApiHealthy: boolean;
  isLoading: boolean;
  error: string;
  stepForward: () => void;
  stepBackward: () => void;
  resetPlayback: () => void;
  currentStep: TimelineStep | undefined;
  riskScore: number;
  riskHistory: { time: string; score: number; step: number }[];
  alerts: AlertItem[];
  mitreStagesList: { id: number; name: string; key: string; description: string }[];
  currentMitreStageIndex: number;
}

const MITRE_STAGES = [
  { id: 1, name: "Reconnaissance", key: "reconnaissance", description: "Active probing & scanning" },
  { id: 2, name: "Scanning", key: "scanning", description: "Port & service discovery" },
  { id: 3, name: "Exploitation", key: "exploitation", description: "Initial access exploit" },
  { id: 4, name: "Privilege Escalation", key: "privilege escalation", description: "Elevating credentials" },
  { id: 5, name: "Persistence", key: "persistence", description: "Maintaining foothold" },
  { id: 6, name: "Lateral Movement", key: "lateral movement", description: "Pivoting internal nodes" }
];

// Fallback demo mock if backend isn't running yet so dashboard is always fully interactive
const generateMockSteps = (): TimelineStep[] => {
  const steps: TimelineStep[] = [];
  const baseDate = new Date("2026-09-03T11:38:22");
  
  const stageFlow = [
    { label: "Benign", stage: "Normal", prob: 0.98, next: "PortScan", nextP: 0.72, rules: [] },
    { label: "Benign", stage: "Normal", prob: 0.95, next: "PortScan", nextP: 0.81, rules: ["Unusual TTL values detected"] },
    { label: "PortScan", stage: "Reconnaissance (Port Scan)", prob: 0.91, next: "Brute Force -Web", nextP: 0.84, rules: ["High destination port fan-out (14 unique ports contacted)", "Rapid SYN packets"] },
    { label: "PortScan", stage: "Reconnaissance (Port Scan)", prob: 0.94, next: "Brute Force -Web", nextP: 0.88, rules: ["Port scan confirmed across subnet 192.168.10.0/24"] },
    { label: "Brute Force -Web", stage: "Credential Access (Brute Force)", prob: 0.89, next: "Exploitation / Initial Access", nextP: 0.82, rules: ["Repetitive connection attempts with TCP flags (SYN: 18, RST: 8)", "Multiple failed HTTP auth attempts"] },
    { label: "Brute Force -Web", stage: "Credential Access (Brute Force)", prob: 0.92, next: "Infiltration", nextP: 0.86, rules: ["Credential stuffing pattern identified on :443"] },
    { label: "Infiltration", stage: "Initial Access / Exploitation", prob: 0.88, next: "Bot", nextP: 0.79, rules: ["Abnormal payload execution & outbound command channel initiated"] },
    { label: "Bot", stage: "Command and Control", prob: 0.85, next: "Lateral Movement / Exploitation", nextP: 0.83, rules: ["Periodic beaconing traffic to 10.0.0.1 on TCP 8080"] },
    { label: "DoS-Hulk", stage: "Impact (Denial of Service)", prob: 0.96, next: "Impact (Denial of Service)", nextP: 0.94, rules: ["Abnormally high flow rate (240 flows) and packet flood"] },
    { label: "DoS-Hulk", stage: "Impact (Denial of Service)", prob: 0.98, next: "Exfiltration", nextP: 0.74, rules: ["Resource exhaustion on web server gateway"] }
  ];

  for (let i = 0; i < stageFlow.length; i++) {
    const d = new Date(baseDate.getTime() + i * 30000);
    const timeStr = d.toTimeString().split(" ")[0];
    const s = stageFlow[i];
    
    steps.push({
      step: i + 1,
      timestamp: timeStr,
      ground_truth_label: s.label,
      baseline_predicted_state: s.label,
      baseline_probability: s.prob,
      baseline_shap: [
        { feature: "unique_dst_ports", value: 0.38 + i * 0.02 },
        { feature: "flow_count", value: 0.28 + i * 0.03 },
        { feature: "syn_flag_sum", value: 0.21 + i * 0.01 },
        { feature: "duration_avg", value: 0.14 },
        { feature: "protocol_tcp_ratio", value: 0.09 }
      ],
      forecast_next_state: s.next,
      forecast_probability: s.nextP,
      forecast_lead_time: "30s",
      forecast_attribution: [
        { feature: "flow_pkts_avg", value: 0.42 + i * 0.02 },
        { feature: "fwd_bytes_sum", value: 0.31 + i * 0.01 },
        { feature: "unique_dst_ips", value: 0.24 },
        { feature: "rst_flag_sum", value: 0.19 },
        { feature: "flow_bytes_avg", value: 0.12 }
      ],
      mitre_stage: s.stage,
      rule_stage: s.stage,
      ml_stage: s.stage,
      triggered_rules: s.rules,
      detection_source: s.rules.length > 0 ? "Rule Engine (Signatures)" : "ML Temporal Forecaster",
      metrics: {
        flow_count: 12 + i * 8,
        duration_avg: 4500 + i * 1200,
        duration_sum: (4500 + i * 1200) * (12 + i * 8),
        fwd_pkts_sum: 84 + i * 45,
        bwd_pkts_sum: 72 + i * 38,
        fwd_bytes_sum: 5200 + i * 2800,
        bwd_bytes_sum: 4100 + i * 2100,
        flow_bytes_avg: 820 + i * 140,
        flow_pkts_avg: 24 + i * 12,
        syn_flag_sum: 6 + i * 3,
        ack_flag_sum: 14 + i * 5,
        psh_flag_sum: 4 + i * 2,
        rst_flag_sum: i > 2 ? 3 + i : 0,
        unique_dst_ips: 1 + Math.floor(i / 2),
        unique_dst_ports: 2 + i * 3,
        protocol_tcp_ratio: 0.88
      }
    });
  }

  return steps;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hosts, setHosts] = useState<string[]>(["192.168.10.15", "192.168.10.14", "192.168.10.8", "192.168.10.25"]);
  const [selectedHost, setSelectedHost] = useState<string>("192.168.10.15");
  const [replayData, setReplayData] = useState<ReplayData | null>(() => {
    const mockSteps = generateMockSteps();
    return {
      host: "192.168.10.15",
      total_steps: mockSteps.length,
      steps: mockSteps
    };
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200);
  const [genResults, setGenResults] = useState<GeneralizationResults | null>({
    indist_accuracy: 0.942,
    ood_accuracy: 0.865,
    accuracy_delta: -0.077,
    ood_sequences: 420
  });
  const [isApiHealthy, setIsApiHealthy] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check API health and attempt live connection
  useEffect(() => {
    let isMounted = true;
    const connectBackend = async () => {
      try {
        await apiClient.checkHealth();
        if (!isMounted) return;
        setIsApiHealthy(true);

        const hostList = await apiClient.getReplayList();
        if (hostList && hostList.length > 0) {
          setHosts(hostList);
          setSelectedHost(hostList[0]);
        }

        try {
          const gen = await apiClient.getGeneralization();
          if (gen) setGenResults(gen);
        } catch {
          // ignore generalization failure
        }
      } catch {
        if (!isMounted) return;
        setIsApiHealthy(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    connectBackend();
    return () => { isMounted = false; };
  }, []);

  // Fetch host sequence when selected host changes & backend is healthy
  useEffect(() => {
    if (!isApiHealthy || !selectedHost) return;

    let isMounted = true;
    const fetchSequence = async () => {
      try {
        const data = await apiClient.getHostSequence(selectedHost, 60);
        if (isMounted && data) {
          setReplayData(data);
          setCurrentStepIndex(0);
        }
      } catch {
        // keep current fallback if request fails
      }
    };

    fetchSequence();
    return () => { isMounted = false; };
  }, [selectedHost, isApiHealthy]);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (replayData && prev < replayData.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, replayData, playbackSpeed]);

  const stepForward = () => {
    if (replayData && currentStepIndex < replayData.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const currentStep = replayData?.steps[currentStepIndex];

  // Dynamic Risk Score calculation
  const calculateRiskScore = (step?: TimelineStep): number => {
    if (!step) return 15;
    const stage = step.mitre_stage.toLowerCase();
    let base = 15;

    if (stage.includes("recon") || stage.includes("scanning")) base = 48;
    else if (stage.includes("credential") || stage.includes("access")) base = 68;
    else if (stage.includes("exploit") || stage.includes("infiltrat")) base = 82;
    else if (stage.includes("command") || stage.includes("lateral")) base = 89;
    else if (stage.includes("impact") || stage.includes("dos") || stage.includes("exfil")) base = 96;

    const probBonus = Math.round((step.baseline_probability || 0.8) * 6);
    const ruleBonus = (step.triggered_rules?.length || 0) * 3;
    return Math.min(Math.max(base + probBonus + ruleBonus, 10), 99);
  };

  const riskScore = calculateRiskScore(currentStep);

  // Risk history array for charts
  const riskHistory = (replayData?.steps.slice(0, currentStepIndex + 1) || []).map((s, idx) => ({
    time: s.timestamp,
    score: calculateRiskScore(s),
    step: idx + 1
  }));

  // Derive Alerts from past and current steps
  const alerts: AlertItem[] = (replayData?.steps.slice(0, currentStepIndex + 1) || [])
    .flatMap((s, stepIdx) => {
      const items: AlertItem[] = [];
      if (s.triggered_rules && s.triggered_rules.length > 0) {
        s.triggered_rules.forEach((rule, rIdx) => {
          items.push({
            id: `alert-${stepIdx}-${rIdx}`,
            time: s.timestamp,
            alert: rule,
            source: selectedHost,
            dest: `10.0.0.${(stepIdx % 4) + 1}`,
            severity: s.ground_truth_label.includes("DoS") || s.ground_truth_label.includes("Exploit") ? "High" : "Medium",
            status: stepIdx === currentStepIndex ? "Active" : "Acknowledged",
            mitreStage: s.mitre_stage
          });
        });
      }
      return items;
    })
    .reverse();

  // Find active MITRE stage index (1-based)
  const currentStageText = currentStep?.mitre_stage.toLowerCase() || "";
  let currentMitreStageIndex = 1;
  if (currentStageText.includes("scan") || currentStageText.includes("recon")) currentMitreStageIndex = 2;
  else if (currentStageText.includes("exploit") || currentStageText.includes("access") || currentStageText.includes("infiltrat")) currentMitreStageIndex = 3;
  else if (currentStageText.includes("credential") || currentStageText.includes("privilege")) currentMitreStageIndex = 4;
  else if (currentStageText.includes("persist") || currentStageText.includes("command")) currentMitreStageIndex = 5;
  else if (currentStageText.includes("lateral") || currentStageText.includes("impact")) currentMitreStageIndex = 6;

  return (
    <DashboardContext.Provider
      value={{
        hosts,
        selectedHost,
        setSelectedHost,
        replayData,
        currentStepIndex,
        setCurrentStepIndex,
        isPlaying,
        setIsPlaying,
        playbackSpeed,
        setPlaybackSpeed,
        genResults,
        isApiHealthy,
        isLoading,
        error,
        stepForward,
        stepBackward,
        resetPlayback,
        currentStep,
        riskScore,
        riskHistory,
        alerts,
        mitreStagesList: MITRE_STAGES,
        currentMitreStageIndex
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
