import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Brain,
  Database,
  Sparkles,
  Network,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Overview", icon: Sparkles },
  { to: "/workspace", label: "Workspace", icon: LayoutDashboard },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/memory", label: "Memory", icon: Brain },
  { to: "/architecture", label: "Architecture", icon: Network },
] as const;

export function AppShell({ children }: { children?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="flex min-h-screen text-foreground relative overflow-x-hidden">
      
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 glass border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>

          <div>
            <div className="font-semibold tracking-tight">RosterIQ</div>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg border border-border/50"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40
          h-screen w-72
          transform transition-transform duration-300
          glass border-r border-border/60
          p-4 flex flex-col
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shadow-[0_0_24px_-4px_var(--primary)]">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>

          <div>
            <div className="font-semibold tracking-tight">RosterIQ</div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Analytics Agent
            </div>
          </div>
        </Link>

        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname === to;

            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  active
                    ? "bg-primary/10 text-foreground glow-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-border/60 bg-card/40 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <span className="size-1.5 rounded-full bg-emerald pulse-dot" />

            <span className="text-foreground font-medium">
              Cognitive Engine Online
            </span>
          </div>

          Inference Layer · Memory Systems · Neural Core
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-16 md:pt-0">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}