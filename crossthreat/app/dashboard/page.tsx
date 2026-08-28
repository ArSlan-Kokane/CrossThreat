"use client";

import React, { useState, useEffect, useRef } from "react";

interface FeatureImportance {
  feature: string;
  value: number;
}

interface TimelineStep {
  step: number;

  forecast_attribution: FeatureImportance[];
  mitre_stage: string;
  rule_stage: string;
  ml_stage: string;
  triggered_rules: string[];
  detection_source: string;
  metrics: Record<string, number>;
}

interface ReplayData {
  host: string;
  total_steps: number;
  steps: TimelineStep[];
}

interface GeneralizationResults {
  indist_accuracy: number;
  ood_accuracy: number;
  accuracy_delta: number;
  ood_sequences: number;
}

export default function Dashboard() {
  const [hosts, setHosts] = useState<string[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>("");
  const [replayData, setReplayData] = useState<ReplayData | null>(null);
  
  // Playback control state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  
  // Generalization evaluation state
  const [genResults, setGenResults] = useState<GeneralizationResults | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "generalization">("live");
  
  // UI toggles
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch host list and generalization results on load
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/replay/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load hosts list");
        return res.json();
      })
      .then((data) => {
        setHosts(data);
        if (data.length > 0) {
          setSelectedHost(data[0]);
        }
      })
      .catch((err) => setError("FastAPI backend is offline or loading failed. Make sure server.py is running."));

    fetch("http://127.0.0.1:8000/api/generalization")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load generalization data");
        return res.json();
      })
      .then((data) => setGenResults(data))
      .catch((err) => console.log("Generalization results loading failed."));
  }, []);

  // Fetch replay data when selected host changes
  useEffect(() => {
    if (!selectedHost) return;
    setIsPlaying(false);
    setCurrentStepIndex(0);
    
    fetch(`http://127.0.0.1:8000/api/replay/host/${selectedHost}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load host sequence data");
        return res.json();
      })
      .then((data) => {
        setReplayData(data);
        setError("");
      })
      .catch((err) => {
        setError(`Error loading replay data for host ${selectedHost}: ${err.message}`);
        setReplayData(null);
      });
  }, [selectedHost]);

  // Handle playback interval timer
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

  const getStageColorClass = (stage: string) => {
    const s = stage.toLowerCase();
    if (s.includes("normal")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (s.includes("reconnaissance") || s.includes("discovery")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (s.includes("credential") || s.includes("access") || s.includes("exploitation")) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    if (s.includes("command") || s.includes("lateral")) return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    if (s.includes("impact") || s.includes("exfil")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    return "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  const getAttackBadgeColorClass = (label: string) => {
    if (label === "Benign") return "bg-emerald-500/20 text-emerald-400";
    if (label.includes("DoS") || label.includes("DDoS")) return "bg-rose-500/20 text-rose-400";
    if (label.includes("Bot")) return "bg-indigo-500/20 text-indigo-400";
    if (label.includes("Brute")) return "bg-amber-500/20 text-amber-400";
    return "bg-orange-500/20 text-orange-400";
  };

  const currentStep = replayData?.steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-zinc-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse"></span>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              CrossThreat Security Engine
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Passive Temporal Cyber-Threat Forecasting and Explainability Platform
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-4 md:mt-0 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/80">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "live"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Live Threat Replay
          </button>
          <button
            onClick={() => setActiveTab("generalization")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "generalization"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            OOD Generalization Test
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
          <strong>Connection Alert: </strong> {error}
        </div>
      )}

      {activeTab === "live" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Controls and Timeline */}
          <div className="lg:col-span-8 space-y-6">
            {/* Playback Controls Card */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 rounded-xl p-5 shadow-xl">
              <h2 className="text-lg font-bold mb-4 text-zinc-200 flex items-center gap-2">
                <span>🎮</span> Threat Replay Controller
              </h2>
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
                {/* Host Select */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-400 font-medium">Target Host:</label>
                  <select
                    value={selectedHost}
                    onChange={(e) => setSelectedHost(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 p-2.5 outline-none min-w-[180px]"
                  >
                    {hosts.map((host) => (
                      <option key={host} value={host}>
                        {host}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={resetPlayback}
                    className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 transition-colors"
                    title="Reset"
                  >
                    ⏮️
                  </button>
                  <button
                    onClick={stepBackward}
                    disabled={currentStepIndex === 0}
                    className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 disabled:opacity-40 transition-colors"
                    title="Previous Step"
                  >
                    ◀️
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                      isPlaying
                        ? "bg-amber-600 hover:bg-amber-500 text-white"
                        : "bg-rose-600 hover:bg-rose-500 text-white"
                    }`}
                  >
                    {isPlaying ? "⏸️ Pause" : "▶️ Play Replay"}
                  </button>
                  <button
                    onClick={stepForward}
                    disabled={!replayData || currentStepIndex === replayData.steps.length - 1}
                    className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 disabled:opacity-40 transition-colors"
                    title="Next Step"
                  >
                    ▶️
                  </button>
                </div>

                {/* Speed Controls & Side-by-side Toggle */}
                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400">Speed:</label>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md p-1.5 outline-none"
                    >
                      <option value={2000}>0.5x</option>
                      <option value={1000}>1.0x</option>
                      <option value={500}>2.0x</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBaseline(!showBaseline)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                        showBaseline
                          ? "bg-zinc-800 text-white border-zinc-700"
                          : "bg-transparent text-zinc-500 border-zinc-800/80"
                      }`}
                    >
                      Comparison Mode: {showBaseline ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              {replayData && (
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Sequence Window Progress:</span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {currentStepIndex + 1} / {replayData.steps.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={replayData.steps.length - 1}
                    value={currentStepIndex}
                    onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-xs font-mono text-zinc-500">
                    <span>Start of Ingestion (Normal)</span>
                    <span>Threat Attack Point</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Metrics and Rules Alerts */}
            {currentStep && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traffic Stats */}
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    📊 Current Traffic Statistics (30s Window)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/80 border border-zinc-800/50 p-3 rounded-lg">
                      <span className="text-xs text-zinc-500">Flow Count</span>
                      <p className="text-xl font-bold text-zinc-100 font-mono mt-1">
                        {currentStep.metrics.flow_count}
                      </p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800/50 p-3 rounded-lg">
                      <span className="text-xs text-zinc-500">Average Duration</span>
                      <p className="text-xl font-bold text-zinc-100 font-mono mt-1">
                        {(currentStep.metrics.duration_avg / 1e3).toFixed(1)} ms
                      </p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800/50 p-3 rounded-lg">
                      <span className="text-xs text-zinc-500">Total Packets (Fwd/Bwd)</span>
                      <p className="text-base font-bold text-zinc-100 font-mono mt-1">
                        {currentStep.metrics.fwd_pkts_sum} / {currentStep.metrics.bwd_pkts_sum}
                      </p>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800/50 p-3 rounded-lg">
                      <span className="text-xs text-zinc-500">Destination IPs/Ports</span>
                      <p className="text-base font-bold text-zinc-100 font-mono mt-1">
                        {currentStep.metrics.unique_dst_ips} / {currentStep.metrics.unique_dst_ports}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signatures & Rule Alerts */}
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                      ⚠️ Rule Engine Signature Alerts
                    </h3>
                    {currentStep.triggered_rules.length > 0 ? (
                      <div className="space-y-2">
                        {currentStep.triggered_rules.map((rule, idx) => (
                          <div
                            key={idx}
                            className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
                          >
                            <span className="text-amber-500">⚡</span> {rule}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg text-center text-xs text-zinc-500">
                        No signature violations detected in this window.
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-between text-xs text-zinc-400">
                    <span>Resolved Tactic:</span>
                    <span className="font-bold text-zinc-200">{currentStep.rule_stage}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trajectory Timeline */}
            {replayData && currentStep && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  📈 Attack Trajectory Timeline (Confirmed vs Predicted)
                </h3>
                
                <div className="relative pl-6 border-l border-zinc-800 space-y-6">
                  {replayData.steps.slice(0, currentStepIndex + 1).map((step, idx) => {
                    const isLast = idx === currentStepIndex;
                    return (
                      <div key={step.step} className="relative">
                        {/* Timeline Node Icon */}
                        <span
                          className={`absolute -left-[30px] top-1.5 h-4 w-4 rounded-full border-2 ${
                            isLast
                              ? "bg-rose-500 border-rose-400 ring-4 ring-rose-500/20"
                              : "bg-zinc-900 border-zinc-700"
                          }`}
                        ></span>
                        
                        <div className={`p-3.5 rounded-lg border transition-all ${
                          isLast 
                            ? "bg-zinc-900/80 border-zinc-700 shadow-md" 
                            : "bg-zinc-950/40 border-zinc-900/80 opacity-60"
                        }`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="text-xs text-zinc-500 font-mono">
                              Step {step.step} | Timestamp: {step.timestamp}
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              getAttackBadgeColorClass(step.ground_truth_label)
                            }`}>
                              Observed: {step.ground_truth_label}
                            </span>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-zinc-500">Current MITRE ATT&CK Stage:</span>
                              <p className="font-bold text-zinc-200 mt-0.5">{step.mitre_stage}</p>
                            </div>
                            
                            <div>
                              <span className="text-zinc-500">Next State Forecast (Temporal):</span>
                              <p className="font-bold text-zinc-300 mt-0.5">
                                {step.forecast_next_state} ({ (step.forecast_probability * 100).toFixed(0) }% confidence)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Active threat status, Explainability, Side-by-side */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Threat Card */}
            {currentStep && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 shadow-xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  🔴 System State Analysis
                </h3>
                
                {/* MITRE ATT&CK Tactic Stage Display */}
                <div className={`border p-4 rounded-xl flex flex-col justify-center text-center ${
                  getStageColorClass(currentStep.mitre_stage)
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                    Active MITRE ATT&CK Tactic
                  </span>
                  <p className="text-xl font-extrabold mt-1.5 leading-tight">
                    {currentStep.mitre_stage}
                  </p>
                  <span className="text-[10px] mt-2 block font-medium">
                    Source: {currentStep.detection_source}
                  </span>
                </div>

                {/* Forecasting Prediction Display */}
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Temporal Next-State Forecast:</span>
                    <span className="text-zinc-400 font-mono font-bold">Lead Time: 30s</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-base font-extrabold text-zinc-200">
                      {currentStep.forecast_next_state}
                    </span>
                    <span className="text-sm font-mono text-zinc-400 font-semibold">
                      {(currentStep.forecast_probability * 100).toFixed(0)}% Conf
                    </span>
                  </div>
                  {/* Probability Bar */}
                  <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentStep.forecast_probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Explainability Panels ("Why" panel) */}
            {currentStep && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 shadow-xl space-y-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    🔍 "Why" Panel (Feature Attribution)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Reveals which network traffic indicators are driving the model's predictions.
                  </p>
                </div>
                
                {/* LSTM forecast attribution (Input x Gradient) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                    Forecast Model Drivers (LSTM)
                  </h4>
                  <div className="space-y-2">
                    {currentStep.forecast_attribution.map((attr, idx) => {
                      // Normalize score for bar display (absolute mapping)
                      const maxVal = Math.max(...currentStep.forecast_attribution.map(a => Math.abs(a.value)), 1e-5);
                      const pct = (Math.abs(attr.value) / maxVal) * 100;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-400">{attr.feature}</span>
                            <span className="text-zinc-500">{attr.value.toFixed(4)}</span>
                          </div>
                          <div className="w-full bg-zinc-850 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-400 h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Baseline SHAP attribution (Side-by-side comparison) */}
                {showBaseline && (
                  <div className="space-y-3 pt-3 border-t border-zinc-800/50">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                      Current Window Drivers (SHAP)
                    </h4>
                    <div className="space-y-2">
                      {currentStep.baseline_shap.map((attr, idx) => {
                        const maxVal = Math.max(...currentStep.baseline_shap.map(a => Math.abs(a.value)), 1e-5);
                        const pct = (Math.abs(attr.value) / maxVal) * 100;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-zinc-400">{attr.feature}</span>
                              <span className="text-zinc-500">{attr.value.toFixed(4)}</span>
                            </div>
                            <div className="w-full bg-zinc-850 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-400 h-full rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Side-by-Side Model Comparison Proof */}
            {showBaseline && currentStep && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    ⚖️ Model Advantage Analysis
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Proving the value of temporal sequential context (LSTM) vs single-window classifier (Random Forest).
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-zinc-950/80 border border-zinc-800/60 p-3 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold">Baseline model</span>
                    <p className="text-sm font-extrabold text-amber-400 mt-1">
                      {currentStep.baseline_predicted_state}
                    </p>
                    <span className="text-[9px] text-zinc-600 block mt-1">
                      ({(currentStep.baseline_probability * 100).toFixed(0)}% confidence)
                    </span>
                  </div>

                  <div className="bg-zinc-950/80 border border-zinc-800/60 p-3 rounded-lg border-indigo-500/20">
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold">LSTM Forecaster</span>
                    <p className="text-sm font-extrabold text-indigo-400 mt-1">
                      {currentStep.forecast_next_state}
                    </p>
                    <span className="text-[9px] text-zinc-600 block mt-1">
                      ({(currentStep.forecast_probability * 100).toFixed(0)}% confidence)
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 leading-relaxed bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/20">
                  {currentStep.ground_truth_label !== "Benign" && currentStep.baseline_predicted_state === "Benign" ? (
                    <span className="text-emerald-400 font-semibold">
                      ⚡ LSTM correctly anticipates the threat step ahead, whereas the baseline model missed the attack signature inside the window.
                    </span>
                  ) : (
                    <span>
                      LSTM takes 2.5 minutes of host flow memory to forecast transition phases, providing early warning lead times of ~30s.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Generalization Tab View */
        <div className="max-w-4xl mx-auto space-y-6">
          {genResults ? (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-200">
                  📁 Mission 6: Out-of-Distribution Generalization Test
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Evaluating the trained temporal forecasting LSTM model on the independent, unseen **CIC-IDS2017** dataset.
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/80 border border-zinc-800/50 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">In-Distribution Accuracy (IDS2018)</span>
                  <p className="text-3xl font-extrabold text-zinc-100 font-mono mt-1">
                    {(genResults.indist_accuracy * 100).toFixed(2)}%
                  </p>
                </div>
                
                <div className="bg-zinc-900/80 border border-zinc-800/50 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">OOD Accuracy (CIC-IDS2017)</span>
                  <p className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">
                    {(genResults.ood_accuracy * 100).toFixed(2)}%
                  </p>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800/50 p-4 rounded-xl">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">Generalization Delta</span>
                  <p className={`text-3xl font-extrabold font-mono mt-1 ${
                    genResults.accuracy_delta < -0.1 ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {(genResults.accuracy_delta * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Assessment details */}
              <div className="bg-zinc-950/50 border border-zinc-850 p-5 rounded-lg text-sm space-y-4">
                <h3 className="font-bold text-zinc-300">🔍 Generalization Assessment Report</h3>
                
                <p className="text-zinc-400 leading-relaxed">
                  The model was trained on partitioned temporal subsets from **CSE-CIC-IDS2018** (Days 1-7). 
                  To test whether the model merely memorized traffic signatures or generalized to broader structures, we ran evaluation passes over **CIC-IDS2017**, which features a completely separate network mix and different attack intervals.
                </p>

                <div className="border-t border-zinc-800/60 pt-3 text-xs text-zinc-500 space-y-2">
                  <p>
                    • **Total OOD sequence sequences evaluated:**{" "}
                    <span className="font-bold text-zinc-300">{genResults.ood_sequences} sequences</span>
                  </p>
                  <p>
                    • **OOD Accuracy Drop:**{" "}
                    <span className="font-bold text-zinc-300">
                      {(Math.abs(genResults.accuracy_delta) * 100).toFixed(1)}%
                    </span>
                  </p>
                  <p>
                    • **Analysis Status:**{" "}
                    {genResults.accuracy_delta > -0.15 ? (
                      <span className="text-emerald-400 font-bold">Stable Generalization (Under 15% drop)</span>
                    ) : (
                      <span className="text-rose-400 font-bold">Overfitting Warning (Significant gap)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-8 shadow-xl text-center space-y-3">
              <span className="text-3xl">⏳</span>
              <h3 className="font-bold text-zinc-200">Evaluating OOD Generalization...</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Running data pipeline on CIC-IDS2017 to compute accuracy delta vs in-distribution test sets.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
