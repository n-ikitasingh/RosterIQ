import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

const STORAGE_KEY = "rosteriq.theme";

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.toggle("dark", t === "dark");
  el.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY)) as Theme | null;
    const initial: Theme = stored ?? "light";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className={`relative inline-flex h-8 w-[60px] items-center rounded-full border border-border/60 bg-secondary/40 backdrop-blur transition-colors hover:bg-secondary/60 ${className}`}
    >
      <span
        className="absolute top-1 left-1 grid size-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_0_18px_-4px_var(--primary)] transition-transform duration-300"
        style={{ transform: isDark ? "translateX(0)" : "translateX(28px)" }}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        )}
      </span>
      <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground pointer-events-none w-full text-center pr-2">
        {isDark ? "dark" : "light"}
      </span>
    </button>
  );
}