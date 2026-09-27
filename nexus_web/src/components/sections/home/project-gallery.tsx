"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BlueLine } from "@/components/ui/blue-line";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ProjectItem } from "@/types";
import { ArrowRight, ArrowUpRight, Code2, Terminal, Activity, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface ProjectGalleryProps {
  projects: ProjectItem[];
}

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const {
    elementRef: headerElementRef,
    isVisible: isHeaderVisible,
  } = useScrollReveal();
  const {
    elementRef: gridElementRef,
    isVisible: isGridVisible,
  } = useScrollReveal();

  const expandedVariants = {
    collapsed: {
      opacity: 0.8,
      transition: { duration: 0.3 }
    },
    expanded: {
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <section className="py-24 bg-[#050507] border-b border-[#1c1c27]">
      <Container size="xl">
        <div className="space-y-16">
          {/* Section Header */}
          <motion.div
            ref={headerElementRef}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1c1c27] pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-3 max-w-3xl">
              <div className="text-xs font-mono text-blue-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>ENGINEERING DOSSIER</span>
              </div>
              <BlueLine orientation="horizontal" variant="draw" delay={0.2} />
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                Production Works & Systems
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Platforms, embedded hardware grids, and intelligent agent applications engineered and maintained by NEXUS members.
              </p>
            </div>

            <Button href="/projects" variant="outline" size="sm" className="font-mono text-xs">
              <span>View Full Project Archive</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </motion.div>

          {/* Asymmetric Full-Width Editorial Project Dossiers */}
          <motion.div
            ref={gridElementRef}
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isGridVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {projects.slice(0, 1).map((project, index) => {
              const projectNumber = `PROJECT ${String(index + 1).padStart(3, "0")}`;
              const isExpanded = expandedProject === project.id;

              return (
                <motion.div
                  key={project.id}
                  className={`p-8 sm:p-10 rounded-2xl border transition-all space-y-6 ${
                    isExpanded
                      ? "bg-[#0c0c12] border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                      : "bg-[#09090e] border-[#1c1c27] hover:border-zinc-700 hover:bg-[#0c0c12]"
                  }`}
                  variants={expandedVariants}
                  animate={isExpanded ? "expanded" : "collapsed"}
                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                  data-interactive="true"
                >
                  {/* Top Dossier Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c27] pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {projectNumber}
                      </span>
                      <span className="text-zinc-600 font-mono">/</span>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                      <span>COMPLETED: {project.completedYear}</span>
                      <span>•</span>
                      <span>{project.contributors.length} CONTRIBUTORS</span>
                    </div>
                  </div>

                  {/* Title & Narrative Description */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-2">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
                        {project.title}
                      </h3>
                      <p className="text-xs font-mono text-blue-400">
                        {project.tagline}
                      </p>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {project.description}
                      </p>

                      {project.highlights && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-400">
                          {project.highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-blue-400">►</span>
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata & Actions Strip */}
                  <div className="pt-6 border-t border-[#1c1c27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-mono text-zinc-500 mr-2 uppercase">Tech:</span>
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#13131a] text-zinc-300 border border-[#222230]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-300 hover:text-white flex items-center gap-1.5 underline-offset-4 hover:underline"
                        >
                          <Code2 className="h-4 w-4 text-zinc-400" />
                          <span>Source Code</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
                        >
                          <span>Live Platform</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Working Under The Hood Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isGridVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-8 sm:p-10 rounded-2xl border border-[#1c1c27] bg-[#09090e] relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              />
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-blue-500/30 flex items-center justify-center"
                >
                  <Activity className="w-8 h-8 text-blue-400" />
                </motion.div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                    Working Under The Hood
                  </h3>
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-green-400"
                  />
                </div>
                <p className="text-sm text-zinc-400">
                  Engineering excellence in progress. Building the future infrastructure.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Secret Working Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isGridVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-8 sm:p-10 rounded-2xl border border-[#1c1c27] bg-[#09090e] relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20" />
              </motion.div>
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-purple-500/30 flex items-center justify-center"
                >
                  <Lock className="w-8 h-8 text-purple-400" />
                </motion.div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                    Secret Operations
                  </h3>
                  <motion.div
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </motion.div>
                </div>
                <p className="text-sm text-zinc-400">
                  Confidential projects under development. Access restricted to authorized personnel.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}