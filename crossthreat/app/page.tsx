import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100 font-sans">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.08)_0,transparent_60%)] pointer-events-none"></div>

      <div className="max-w-xl text-center space-y-8 relative z-10">
        {/* Animated badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-rose-400 font-semibold shadow-inner">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
          Threat Intelligence Engine Active
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-red-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
            CrossThreat
          </h1>
          <p className="text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
            A state-of-the-art passive cyber-threat forecasting pipeline driven by sequential deep learning and MITRE ATT&CK stage mapping.
          </p>
        </div>

        {/* Launch Button */}
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-rose-950/20 tracking-wide text-base"
          >
            Launch Analyst Dashboard →
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-4 pt-12 border-t border-zinc-900 text-left">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs uppercase font-bold">Temporal</span>
            <p className="text-xs text-zinc-400">LSTM forecasts threat transition cycles</p>
          </div>
          <div className="space-y-1 border-l border-zinc-900 pl-4">
            <span className="text-zinc-500 text-xs uppercase font-bold">ATT&CK Mapping</span>
            <p className="text-xs text-zinc-400">Deterministic stage translation</p>
          </div>
          <div className="space-y-1 border-l border-zinc-900 pl-4">
            <span className="text-zinc-500 text-xs uppercase font-bold">Explainable</span>
            <p className="text-xs text-zinc-400">Tree SHAP and sequence attributions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
