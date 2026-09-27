import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SocialLinks } from "@/components/common/social-links";
import { siteConfig } from "@/data/site-config";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Navigation, Sparkles, User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Institutional Coordinates",
  description:
    "Get in touch with NEXUS — Innovation & Leadership Collective at Rajarambapu Institute of Technology (RIT).",
};

export default function ContactPage() {
  const isEmailPending = !siteConfig.contact.email || siteConfig.contact.email.includes("[");
  const isFacultyPending = !siteConfig.contact.facultyCoordinator || siteConfig.contact.facultyCoordinator.includes("[");
  const isInstagramPending = !siteConfig.contact.instagram || siteConfig.contact.instagram.includes("[");

  return (
    <div className="flex flex-col w-full py-12 md:py-20 space-y-16">
      {/* 1. HEADER */}
      <section>
        <Container size="xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/40 text-xs font-mono text-blue-300">
              <Navigation className="h-3.5 w-3.5 text-blue-400" />
              <span>INSTITUTIONAL LIAISON // RIT CAMPUS</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
              Contact NEXUS
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Connect with our directorate regarding national hackathon alliances, industry sponsorships, student development workshops, or club recruitment at Rajarambapu Institute of Technology.
            </p>
          </div>
        </Container>
      </section>

      {/* 2. CHANNELS & CAMPUS COORDINATES */}
      <section>
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Direct Channels Grid */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Official Communications */}
                <div className="p-6 rounded-2xl bg-[#08080c] border border-[#1c1c27] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-blue-950/50 border border-blue-800/30 flex items-center justify-center text-blue-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Official Communications</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Sponsorship proposals, inter-club partnerships, and institutional administration inquiries.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#1c1c27]">
                    {isEmailPending ? (
                      <span className="text-xs font-mono text-zinc-500 bg-[#0d0d14] px-3 py-1.5 rounded border border-zinc-800 block text-center">
                        Direct Inquiries via Directorate Leads
                      </span>
                    ) : (
                      <a
                        href={`mailto:${siteConfig.contact.email}`}
                        className="text-xs font-mono text-blue-400 hover:underline"
                      >
                        {siteConfig.contact.email}
                      </a>
                    )}
                  </div>
                </div>

                {/* Faculty Coordination */}
                <div className="p-6 rounded-2xl bg-[#08080c] border border-[#1c1c27] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-indigo-950/50 border border-indigo-800/30 flex items-center justify-center text-indigo-400">
                      <User className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Faculty Advisory</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Departmental faculty coordination and academic oversight at RIT.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#1c1c27]">
                    {isFacultyPending ? (
                      <span className="text-xs font-mono text-zinc-500 bg-[#0d0d14] px-3 py-1.5 rounded border border-zinc-800 block text-center">
                        Faculty Advisor Designation in Progress
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-zinc-300">
                        {siteConfig.contact.facultyCoordinator}
                      </span>
                    )}
                  </div>
                </div>

                {/* WhatsApp Community Hub */}
                <div className="p-6 rounded-2xl bg-[#08080c] border border-[#1c1c27] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">WhatsApp Community</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Student matchmaking, hackathon discussions, and sprint updates.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#1c1c27]">
                    <Button
                      variant="primary"
                      size="sm"
                      href="https://whatsapp.com/channel/0029VbDMvGCIyPtZvvAWLG19"
                      className="w-full text-xs font-mono bg-emerald-600 hover:bg-emerald-500"
                    >
                      <span>Join WhatsApp Channel</span>
                      <ArrowUpRight className="h-3 w-3 ml-1.5" />
                    </Button>
                  </div>
                </div>

                {/* Digital Media & Narratives */}
                <div className="p-6 rounded-2xl bg-[#08080c] border border-[#1c1c27] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-purple-950/50 border border-purple-800/30 flex items-center justify-center text-purple-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Social & Media Channel</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Hackathon victory announcements, event highlights, and tech updates.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#1c1c27]">
                    {isInstagramPending ? (
                      <span className="text-xs font-mono text-zinc-500 bg-[#0d0d14] px-3 py-1.5 rounded border border-zinc-800 block text-center">
                        Media Channels Launching with Spring Cohort
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        href={siteConfig.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-xs font-mono bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                      >
                        <span>Follow on Instagram</span>
                        <ArrowUpRight className="h-3 w-3 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Digital Handles Strip */}
              <div className="p-6 rounded-2xl bg-[#0c0c14] border border-[#1f1f2e] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Verified Digital Presence</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Official GitHub organization and LinkedIn collective network.
                  </p>
                </div>
                <SocialLinks socials={siteConfig.contact} variant="card" />
              </div>
            </div>

            {/* Campus Coordinates & Location */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-3xl bg-[#08080d] border border-[#1c1c27] space-y-6">
                <div className="space-y-2 border-b border-[#1c1c27] pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-widest font-semibold">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>CAMPUS HEADQUARTERS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {siteConfig.institution.shortName}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {siteConfig.institution.name}
                  </p>
                </div>

                <div className="space-y-3 text-xs font-mono text-zinc-300">
                  <div className="p-3 rounded-xl bg-[#0d0d16] border border-zinc-800/80 space-y-1">
                    <span className="text-zinc-500 uppercase text-[10px] block">Coordinates:</span>
                    <p className="text-blue-300 font-bold">17.0458° N, 74.2638° E</p>
                    <p className="text-zinc-500 text-[11px] pt-1">Islampur, Sangli District, Maharashtra - 415414</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    href="https://maps.google.com/?q=Rajarambapu+Institute+of+Technology+Islampur"
                    className="w-full font-mono text-xs h-10 justify-center"
                  >
                    <span>Locate on Google Maps</span>
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
