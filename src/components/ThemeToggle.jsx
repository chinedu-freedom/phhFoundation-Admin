"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ isCollapsed }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 opacity-0"></div>;
  }

  const isDark = theme === "dark";

  return (
    <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} w-full`}>
      {!isCollapsed && (
        <span className="text-sm font-medium text-foreground transition-colors">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
      
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          isDark ? "bg-blue-600" : "bg-muted-foreground/30"
        }`}
        title="Toggle theme"
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
