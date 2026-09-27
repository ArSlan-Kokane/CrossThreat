import { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "NEXUS",
  shortName: "NEXUS",
  tagline: "BUILD. LEAD. CONNECT.",
  description:
    "Official Innovation & Leadership Collective at Rajarambapu Institute of Technology (RIT). Fostering engineering sovereignty, technical leadership, and collaborative execution.",
  institution: {
    name: "Rajarambapu Institute of Technology",
    shortName: "RIT",
    campus: "RIT Campus",
    city: "Islampur",
    state: "Maharashtra",
    address: "Rajarambapu Institute of Technology (RIT), Rajaramnagar, Islampur, Sangli, Maharashtra - 415414",
  },
  contact: {
    email: "[Official email — to be added]",
    facultyCoordinator: "Gautami Shingan",
    instagram: "https://www.instagram.com/nexus_rit",
    github: "https://github.com/nexus-rit",
    linkedin: "https://linkedin.com/company/nexus-rit",
    whatsappCommunity: "https://chat.whatsapp.com/nexus-community-placeholder",
  },
  recruitment: {
    isOpen: true,
    googleFormUrl: "https://forms.gle/nexus-recruitment-placeholder",
    deadline: "Spring Recruitment Cycle 2026",
  },
  navItems: [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Team", href: "/team" },
    { title: "Events", href: "/events" },
    { title: "Hackathons", href: "/hackathons" },
    { title: "Projects", href: "/projects" },
    { title: "Insights", href: "/insights" },
    { title: "Resources", href: "/resources" },
    { title: "Alumni", href: "/alumni" },
    { title: "Join", href: "/join" },
    { title: "Contact", href: "/contact" },
  ],
};
