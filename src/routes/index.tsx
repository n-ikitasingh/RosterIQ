import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Cpu, Database, Sparkles, Zap, Network, Workflow, LineChart as LineIcon } from "lucide-react";
import { AppShell } from "@/components/rosteriq/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RosterIQ" },
      { name: "description", content: "Production-grade AI analytics platform with NL→SQL, agent orchestration, and memory architecture." },
      { property: "og:title", content: "RosterIQ — AI Analytics Agent" },
      { property: "og:description", content: "Ask data anything. RosterIQ generates SQL, executes against DuckDB, and explains results with persistent memory." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Hero />
      <Capabilities />
      <Pipeline />
    </AppShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative max-w-6xl mx-auto px-8 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald pulse-dot" />
          Cognitive Engine Online · Neural Analytics Core · Inference Layer Active
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
          The intelligent <span className="text-gradient">analytics copilot</span><br/>
          that remembers.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground">
          RosterIQ is an agentic data intelligence system. Ask questions in plain English and watch it plan,
          generate SQL, execute against an in-browser warehouse, render dashboards, and persist what it learns
          across episodic, semantic and procedural memory.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-3">
          <Link to="/workspace"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_30px_-5px_var(--primary)] hover:opacity-95 transition">
            Try the live demo <ArrowRight className="size-4" />
          </Link>
          <Link to="/architecture"
            className="inline-flex items-center gap-2 rounded-lg border border-border glass px-5 py-3 text-sm font-medium hover:bg-secondary/40 transition">
            <Network className="size-4" /> Explore architecture
          </Link>
          <Link to="/datasets"
            className="inline-flex items-center gap-2 rounded-lg border border-border glass px-5 py-3 text-sm font-medium hover:bg-secondary/40 transition">
            <Database className="size-4" /> Preloaded datasets
          </Link>
        </motion.div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            ["6", "Datasets preloaded"],
            ["6.7K", "Rows queryable"],
            ["3", "Memory subsystems"],
            ["100%", "Browser-native SQL"],
          ].map(([n, l]) => (
            <div key={l} className="glass rounded-xl p-4">
              <div className="text-2xl font-semibold text-gradient">{n}</div>
              <div className="text-xs text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const items = [
    { icon: Sparkles, title: "Natural Language Querying", body: "Reasoning model translates intent into safe DuckDB SQL with domain-aware grounding." },
    { icon: Cpu, title: "Agent Orchestration", body: "Schema analyzer, planner, executor, synthesizer — every step traced and observable." },
    { icon: Brain, title: "Memory Architecture", body: "Episodic, semantic and procedural memory persisted and visible across sessions." },
    { icon: LineIcon, title: "Auto Dashboards", body: "Charts chosen from query intent — bar, line, pie, KPI — rendered with motion." },
    { icon: Zap, title: "In-Browser Warehouse", body: "DuckDB-WASM runs OLAP queries on the client. No server round-trip per analysis." },
    { icon: Workflow, title: "Procedures & Replay", body: "Saved diagnostic workflows can be invoked, refined, and re-run on new data." },
  ];
  return (
    <section className="max-w-6xl mx-auto px-8 py-16">
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <motion.div key={it.title}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl glass p-5 hover:glow-border transition">
            <it.icon className="size-5 text-primary" />
            <div className="mt-3 font-medium">{it.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{it.body}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Pipeline() {
  const stages = ["Question", "Schema Analyzer", "Memory Recall", "NL→SQL Planner", "DuckDB Executor", "Insight Synthesis", "Memory Update"];
  return (
    <section className="max-w-6xl mx-auto px-8 pb-24">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Live pipeline</div>
      <div className="rounded-2xl glass glow-border p-6">
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded-md border border-border/60 bg-card/40 px-3 py-1.5 text-xs font-mono">{s}</div>
              {i < stages.length - 1 && <ArrowRight className="size-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
