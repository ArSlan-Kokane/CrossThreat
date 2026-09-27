"use client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BlueLine } from "@/components/ui/blue-line";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface EventTimelineProps {
  events: any[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const {
    elementRef: headerElementRef,
    isVisible: isHeaderVisible,
  } = useScrollReveal();
  const {
    elementRef: curtainElementRef,
    isVisible: isCurtainVisible,
  } = useScrollReveal();

  return (
    <section className="py-24 bg-[#07070a] border-b border-[#1c1c27]">
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
                <Calendar className="h-4 w-4" />
                <span>CHRONOLOGICAL SPRINT HORIZON</span>
              </div>
              <BlueLine orientation="horizontal" variant="draw" delay={0.2} />
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                Events & Workshop Horizon
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Keynotes, hands-on architecture bootcamps, and hackathons hosted by NEXUS at RIT.
              </p>
            </div>

            <Button href="/events" variant="outline" size="sm" className="font-mono text-xs">
              <span>View Complete Event Archive</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </motion.div>

          {/* Curtain Effect Section */}
          <motion.div
            ref={curtainElementRef}
            className="relative overflow-hidden rounded-2xl bg-[#09090e] border border-[#1c1c27]"
            initial={{ opacity: 0, y: 20 }}
            animate={isCurtainVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Curtain Effect Background */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent"
                animate={{
                  y: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-900/10 to-transparent"
                animate={{
                  y: ["100%", "-100%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-12 sm:p-16 text-center space-y-8">
              {/* Animated Sparkles */}
              <motion.div
                className="flex justify-center gap-4"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-8 h-8 text-blue-400" />
                <Sparkles className="w-10 h-10 text-purple-400" />
                <Sparkles className="w-8 h-8 text-blue-400" />
              </motion.div>

              {/* Main Message */}
              <div className="space-y-4">
                <motion.h3
                  className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Many Plans Coming Ahead!
                </motion.h3>
                <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                  We're crafting unforgettable experiences. Stay tuned for upcoming workshops, hackathons, and events that will inspire and empower.
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="flex justify-center gap-8 text-xs font-mono text-zinc-600">
                <motion.div
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  WORKSHOPS IN PLANNING
                </motion.div>
                <motion.div
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  HACKATHONS IN DEVELOPMENT
                </motion.div>
                <motion.div
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  KEYNOTES IN PREPARATION
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}