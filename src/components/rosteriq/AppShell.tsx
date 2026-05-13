import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Brain, Database, Sparkles, Network, LayoutDashboard, Menu } from "lucide-react";
import { ThemeToggle } from "@/lib/theme";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Overview", icon: Sparkles },
  { to: "/workspace", label: "Workspace", icon: LayoutDashboard },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/memory", label: "Memory", icon: Brain },
  { to: "/architecture", label: "Architecture", icon: Network },
] as const;

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col p-4">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 px-2 py-3">
        <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shadow-[0_0_24px_-4px_var(--primary)]">
          <Sparkles className="size-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">RosterIQ</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Analytics Agent</div>
        </div>
      </Link>
      <nav className="mt-6 flex-1 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                active ? "bg-primary/10 text-foreground glow-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}>
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-2 pl-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <span className="size-1.5 rounded-full bg-emerald pulse-dot" />
            <span className="text-foreground font-medium">Cognitive Engine Online</span>
          </div>
          Inference Layer · Memory Systems · Neural Core
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <div className="flex min-h-screen text-foreground">
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border/60 glass flex-col sticky top-0 h-screen">
        <SidebarContent pathname={loc.pathname} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 glass border-b border-border/60">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shadow-[0_0_24px_-4px_var(--primary)]">
            <Sparkles className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight text-sm">RosterIQ</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="inline-flex items-center justify-center size-9 rounded-lg border border-border/60 bg-card/40 text-foreground hover:bg-secondary/60 transition-colors" aria-label="Open menu">
              <Menu className="size-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 glass border-r border-border/60">
            <SidebarContent pathname={loc.pathname} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">{children ?? <Outlet />}</main>
    </div>
  );
}