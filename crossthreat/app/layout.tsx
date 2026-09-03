import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossThreat — Passive Cyber-Threat Forecasting",
  description: "Passive temporal cyber-threat forecasting and explainability platform with MITRE ATT&CK mapping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#06070e] text-[#e2e8f0] font-sans">
        {children}
      </body>
    </html>
  );
}
