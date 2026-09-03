import React from "react";
import { DashboardProvider } from "@/context/DashboardContext";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/topbar/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#06070e] text-[#e2e8f0] font-sans antialiased">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-5 relative page-enter bg-[#06070e] grid-overlay">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
