import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Cpu, Database, MessageSquare, Sparkles, Workflow, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/rosteriq/AppShell";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — RosterIQ" },
      { name: "description", content: "Inside the agentic NL→SQL pipeline, memory subsystems, and in-browser warehouse." },
    ],
  }),
  component: ArchitecturePage,
});

const PIPELINE = [
  { icon: MessageSquare, label: "User Question", body: "Natural language intent, optionally referencing prior episodes." },
  { icon: Database, label: "Schema Analyzer", body: "Loads dataset into DuckDB-WASM and grounds the model on real columns + types." },
  { icon: Brain, label: "Memory Recall", body: "Retrieves recent episodic queries and semantic facts relevant to the dataset." },
  { icon: Sparkles, label: "NL→SQL Planner", body: "Inference layer (Gemini Flash) calls a typed tool schema returning SQL + viz plan." },
  { icon: Cpu, label: "DuckDB Executor", body: "OLAP query runs in the browser. Zero server round-trip, sub-100ms typical latency." },
  { icon: BarChart3, label: "Insight Synthesis", body: "Summary + bullet insights + auto-selected chart type rendered with Recharts." },
  { icon: Workflow, label: "Memory Update", body: "Episode persisted; procedural memory may be incremented if a workflow matched." },
];

function ArchitecturePage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Systems view</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Architecture</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">RosterIQ is an agentic system, not a chatbot. Every question is decomposed into a traceable, observable workflow with persistent state.</p>

        <div className="mt-12 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-accent/40 to-transparent -translate-x-1/2" />
          <div className="space-y-5">
            {PIPELINE.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`relative grid grid-cols-2 gap-4 ${i % 2 === 0 ? "" : ""}`}>
                <div className={`${i % 2 === 0 ? "" : "col-start-2"} `}>
                  <div className="rounded-xl glass glow-border p-5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gradient-to-br from-primary/40 to-accent/40 grid place-items-center">
                        <s.icon className="size-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stage {i + 1}</div>
                        <div className="font-medium">{s.label}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">{s.body}</div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3 rounded-full bg-primary shadow-[0_0_24px_var(--primary)]" />
              </motion.div>
            ))}
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Memory subsystems</h2>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            {[
              { t: "Episodic", d: "Time-indexed log of every question, SQL, and result. Powers recall, replay, pattern mining.", k: "localStorage / SQLite-equivalent" },
              { t: "Semantic", d: "Domain facts: column meanings, derived metrics, entity relationships. Injected into every system prompt.", k: "Weighted fact store" },
              { t: "Procedural", d: "Reusable diagnostic workflows. User-improvable. Versioned with usage counters.", k: "JSON registry" },
            ].map((m) => (
              <div key={m.t} className="rounded-xl glass p-5">
                <div className="text-xs uppercase tracking-wider text-primary">{m.t}</div>
                <div className="mt-2 text-sm">{m.d}</div>
                <div className="mt-3 text-[10px] font-mono text-muted-foreground">{m.k}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl glass p-6">
          <h3 className="font-medium">Tech stack</h3>
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ["Frontend", "TanStack Start · React 19 · Tailwind v4"],
              ["Visualization", "Recharts · Framer Motion"],
              ["Warehouse", "DuckDB-WASM (in-browser OLAP)"],
              ["Reasoning", "Inference Layer · Gemini Flash"],
              ["Memory", "Episodic / Semantic / Procedural"],
              ["Edge", "Serverless NL→SQL function"],
              ["Auth", "Optional · Managed cloud backend"],
              ["Deploy", "One-click cloud deployment"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border/60 bg-card/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="mt-1 font-mono text-xs">{v}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
