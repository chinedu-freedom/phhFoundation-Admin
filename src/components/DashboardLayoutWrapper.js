"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayoutWrapper({ user, children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`fixed md:relative z-50 h-full transition-all duration-300 ease-in-out w-64 ${
        isSidebarCollapsed ? "md:w-20" : "md:w-64"
      } ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <Sidebar user={user} isCollapsed={isSidebarCollapsed} onMobileClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <Header 
          user={user} 
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
