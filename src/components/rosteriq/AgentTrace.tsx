import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle, Cpu } from "lucide-react";
import type { TraceStep } from "@/lib/rosteriq/agent";

export function AgentTrace({ steps }: { steps: TraceStep[] }) {
  // collapse duplicate ids (running -> done updates same id)
  const map = new Map<string, TraceStep>();
  for (const s of steps) map.set(s.id, s);
  const items = [...map.values()];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Cpu className="size-3" /> Agent Reasoning Trace
      </div>
      <ol className="relative border-l border-border/60 pl-4 space-y-2">
        <AnimatePresence initial={false}>
          {items.map((s) => (
            <motion.li key={s.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="relative">
              <span className={`absolute -left-[22px] top-1.5 size-3 rounded-full grid place-items-center ${
                s.status === "done" ? "bg-emerald/20 text-emerald" :
                s.status === "error" ? "bg-destructive/20 text-destructive" :
                "bg-primary/20 text-primary"
              }`}>
                {s.status === "done" ? <Check className="size-2" /> :
                 s.status === "error" ? <AlertCircle className="size-2" /> :
                 <Loader2 className="size-2 animate-spin" />}
              </span>
              <div className="rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{s.tool}</span>
                  {s.durationMs != null && <span className="text-[10px] font-mono text-muted-foreground">{s.durationMs}ms</span>}
                </div>
                {s.detail && <div className="text-xs text-muted-foreground mt-0.5">{s.detail}</div>}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}
