"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  HeartHandshake, 
  HandHeart, 
  Users, 
  BookOpen, 
  CalendarDays, 
  Image as ImageIcon,
  LogOut,
  Mail,
  Inbox,
  Building2,
  Quote,
  UserCheck,
  UserCog,
  ShieldAlert
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/campaigns", label: "Campaigns", icon: HeartHandshake },
  { href: "/admin/donations", label: "Donations", icon: HandHeart },
  { href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/partners", label: "Partners", icon: Building2 },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/team", label: "Team Members", icon: UserCheck },
  { href: "/admin/blog", label: "Blog Posts", icon: BookOpen },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/users", label: "Admin Accounts", icon: UserCog },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
];

export default function Sidebar({ isCollapsed, onMobileClose }) {
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <aside className={`w-64 ${isCollapsed ? "md:w-20" : "md:w-64"} bg-card border-r border-border flex flex-col h-full shrink-0 z-30 transition-all duration-300`}>
      {/* Brand Header */}
      <div className={`h-16 flex ${isCollapsed ? "justify-center" : "items-center px-6"} border-b border-border gap-2.5 transition-all`}>
        <div className={isCollapsed ? "py-2" : "w-12 h-12  overflow-hidden border border-border shrink-0 flex items-center justify-center"}>
          <img src="/logo.jpeg" alt="HH Logo" className="w-full h-full object-cover" />
        </div>
        <div className={isCollapsed ? "md:hidden" : "md:block"}>
            <span className="font-semibold text-sm text-[#0A2540] dark:text-gray-200 block leading-tight">
              HH Foundation
            </span>
            <span className="text-xs text-[#8F9BB3] block mt-0.5 leading-tight">
              Admin
            </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 768 && onMobileClose) {
                  onMobileClose();
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              } ${isCollapsed ? "md:justify-center md:px-0" : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
              }`} />
              <span className={isCollapsed ? "md:hidden" : "md:block"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-border bg-card/50 flex flex-col gap-3">
        <ThemeToggle isCollapsed={isCollapsed} />

        <button
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : ""}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-300 transition-all cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={isCollapsed ? "md:hidden" : "md:block"}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
