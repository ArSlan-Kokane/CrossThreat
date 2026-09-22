"use client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { siteConfig } from "@/data/site-config";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function RecruitmentCallout() {
  const { recruitment } = siteConfig;
  const {
    elementRef: containerElementRef,
    isVisible: isContainerVisible,
  } = useScrollReveal();

  return (
    <section className="py-24 bg-[#050507] border-b border-[#1c1c27] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <Container size="xl" className="relative z-10">
        <motion.div
          ref={containerElementRef}
          className="p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-[#0e0e16] to-[#08080c] border border-[#222230] text-center max-w-4xl mx-auto space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isContainerVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/40 border border-blue-800/40 text-xs font-mono text-blue-300">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-400" />
            <span>{recruitment.isOpen ? recruitment.deadline : "RECRUITMENT UPDATES"}</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
              {recruitment.isOpen ? "The Guild is Forming." : "Stay Connected."}
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {recruitment.isOpen
                ? "We are inducting passionate software developers, media creators, operations leads, and community coordinators at RIT. Take ownership, build production platforms, and lead."
                : "Recruitment is currently closed. Explore the NEXUS charter and follow our official channels for the next induction cycle."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {recruitment.isOpen && (
              <Button
                href="/recruitment"
                size="lg"
                variant="primary"
                className="w-full sm:w-auto h-14 px-8 text-sm font-semibold"
              >
                <span>Apply Now</span>
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button
              href="/about"
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto h-14 px-8 text-sm"
            >
              <span>Explore Organization Charter</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="pt-8 border-t border-[#1c1c27] flex items-center justify-center gap-4 text-xs font-mono text-zinc-500">
            <span>Rajarambapu Institute of Technology (RIT)</span>
            <span>•</span>
            <span>BUILD. LEAD. CONNECT.</span>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
