import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Database, DollarSign, FileText, Stethoscope, TrendingUp, Users, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/rosteriq/AppShell";
import { DATASETS } from "@/lib/rosteriq/datasets";

const ICONS = { Activity, Database, DollarSign, FileText, Stethoscope, TrendingUp, Users } as const;

export const Route = createFileRoute("/datasets")({
  head: () => ({
    meta: [
      { title: "Datasets — RosterIQ" },
      { name: "description", content: "Six preloaded analytics datasets across healthcare, revenue, people, and finance." },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preloaded warehouses</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Datasets</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Every dataset is loaded into the in-browser DuckDB warehouse on demand. Pick one and start asking questions — no upload required.</p>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATASETS.map((d, i) => {
            const Icon = (ICONS as any)[d.icon] || Database;
            return (
              <motion.div key={d.id}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl glass p-5 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 grid place-items-center">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.domain}</span>
                </div>
                <div className="mt-4 font-medium">{d.name}</div>
                <div className="text-sm text-muted-foreground mt-1 flex-1">{d.description}</div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {d.columns.slice(0, 6).map((c) => (
                    <span key={c.name} className="text-[10px] font-mono rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5">{c.name}</span>
                  ))}
                  {d.columns.length > 6 && <span className="text-[10px] text-muted-foreground">+{d.columns.length - 6}</span>}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{d.rows.toLocaleString()} rows · {d.columns.length} cols</span>
                  <Link to="/workspace" search={{ dataset: d.id }} className="text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Query <ArrowRight className="size-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  ),
});
