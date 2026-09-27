import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getProjects } from "@/lib/data";
import { ArrowUpRight, Code2, Sparkles, Terminal, Users, Activity, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Index & Codebases",
  description:
    "Production-grade software platforms, embedded IoT telemetry grids, and AI tools built by NEXUS members at RIT.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const [flagship] = projects;

  return (
    <div className="flex flex-col w-full py-12 md:py-20 space-y-16">
      {/* 1. Header */}
      <Container size="xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-[#1c1c27] pb-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/40 text-xs font-mono text-blue-300">
              <Terminal className="h-3.5 w-3.5 text-blue-400" />
              <span>NEXUS OPEN REPOSITORY REGISTRY</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
              Project Index
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Production-grade platforms, autonomous systems, and campus utilities designed, tested, and maintained by NEXUS student engineers.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-zinc-400 shrink-0">
            <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1c1a27] text-center min-w-[100px]">
              <div className="text-xl font-bold text-white">{projects.length}</div>
              <div className="text-[10px] text-zinc-500 uppercase mt-0.5">Active Systems</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1c1a27] text-center min-w-[100px]">
              <div className="text-xl font-bold text-blue-400">2</div>
              <div className="text-[10px] text-zinc-500 uppercase mt-0.5">In Development</div>
            </div>
          </div>
        </div>

        {/* 2. Flagship Dossier */}
        {flagship && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-widest font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FLAGSHIP PRODUCTION PLATFORM</span>
            </div>

            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0c0c16] via-[#08080d] to-[#050507] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.08)] relative overflow-hidden space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c27] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-blue-400">
                    DOSSIER 001
                  </span>
                  <span className="text-zinc-600 font-mono">/</span>
                  <Badge variant="accent">{flagship.category.replace(/_/g, " ")}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span>DEPLOYED: {flagship.completedYear}</span>
                  <span>•</span>
                  <span>{flagship.contributors.length} CONTRIBUTORS</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                    {flagship.title}
                  </h2>
                  <p className="text-xs font-mono text-blue-400">{flagship.tagline}</p>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed pt-2">
                    {flagship.description}
                  </p>
                </div>

                <div className="lg:col-span-6 space-y-4 bg-[#07070c] p-6 rounded-2xl border border-[#1a1a24]">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                    Engineering Architecture Highlights:
                  </span>
                  {flagship.highlights && (
                    <div className="space-y-2 text-xs font-mono text-zinc-300">
                      {flagship.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold mt-0.5">►</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#1c1c27]">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-2">
                      Core Technology Scaffolding:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {flagship.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#101018] text-blue-300 border border-blue-900/40"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1c1c27] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Users className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Lead Engineers: {flagship.contributors.map((c) => c.name).join(", ")}</span>
                </div>

                <div className="flex items-center gap-3">
                  {flagship.githubUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      href={flagship.githubUrl}
                      className="font-mono text-xs"
                    >
                      <Code2 className="h-3.5 w-3.5 mr-1.5" />
                      View Source
                    </Button>
                  )}
                  {flagship.liveUrl && (
                    <Button
                      variant="primary"
                      size="sm"
                      href={flagship.liveUrl}
                      className="font-mono text-xs"
                    >
                      <span>Launch Live System</span>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Working Under The Hood & Secret Operations */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1c1c27] pb-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-bold">
              Active Development
            </h3>
            <span className="text-xs font-mono text-zinc-600">ENGINEERING OPERATIONS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Working Under The Hood */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#08080c] border border-[#1c1c27] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse" />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-blue-500/30 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                      Working Under The Hood
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-mono text-green-400">ACTIVE</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400">
                  Engineering excellence in progress. Building the future infrastructure and systems.
                </p>
              </div>
            </div>

            {/* Secret Operations */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#08080c] border border-[#1c1c27] relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 animate-pulse" />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-purple-500/30 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                      Secret Operations
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-xs font-mono text-purple-400">CLASSIFIED</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400">
                  Confidential projects under development. Access restricted to authorized personnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
