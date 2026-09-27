import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getEvents } from "@/lib/data";
import { Calendar, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Event Horizon & Technical Sprints",
  description:
    "Upcoming architecture bootcamps, open innovation hackathons, and technical workshops hosted by NEXUS at RIT.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="flex flex-col w-full py-12 md:py-20 space-y-16">
      {/* 1. Header */}
      <Container size="xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/40 text-xs font-mono text-blue-300">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            <span>NEXUS CHRONOLOGICAL SPRINT HORIZON</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            Event Horizon
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Hands-on technical bootcamps, architecture deep-dives, and competitive hackathons organized by NEXUS at Rajarambapu Institute of Technology.
          </p>
        </div>

        {/* 2. Curtain Effect Section */}
        <motion.div
          className="mt-12 relative overflow-hidden rounded-3xl bg-[#09090e] border border-[#1c1c27]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          <div className="relative z-10 p-16 sm:p-24 text-center space-y-10">
            {/* Animated Sparkles */}
            <motion.div
              className="flex justify-center gap-6"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-12 h-12 text-blue-400" />
              <Sparkles className="w-16 h-16 text-purple-400" />
              <Sparkles className="w-12 h-12 text-blue-400" />
            </motion.div>

            {/* Main Message */}
            <div className="space-y-6">
              <motion.h2
                className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white uppercase"
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
              </motion.h2>
              <p className="text-xl sm:text-2xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
                We're crafting unforgettable experiences. Stay tuned for upcoming workshops, hackathons, and events that will inspire and empower the next generation of innovators.
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="flex flex-wrap justify-center gap-10 text-sm font-mono text-zinc-600">
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
              <motion.div
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              >
                INNOVATION SPRINTS AHEAD
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
