"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Settings, LogOut, HeartHandshake } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header({ user, onToggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const initials = (user?.name?.[0] || "A").toUpperCase();
  const fullName = user?.name || "Admin User";
  const email = user?.email || "admin@example.com";

  const getPageTitle = () => {
    switch (pathname) {
      case "/admin":
        return "Admin Dashboard";
      case "/admin/campaigns":
        return "Campaigns Management";
      case "/admin/donations":
        return "Donations Ledger";
      case "/admin/volunteers":
        return "Volunteer Applications";
      case "/admin/blog":
        return "Blog Publisher";
      case "/admin/events":
        return "Events Scheduling";
      case "/admin/gallery":
        return "Gallery Media Manager";
      default:
        return "HH Admin Console";
    }
  };

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 cursor-pointer rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg text-foreground tracking-tight hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>
    </header>
  );
}
