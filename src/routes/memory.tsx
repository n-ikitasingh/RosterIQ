import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, BookOpen, Workflow, Trash2, Clock } from "lucide-react";
import { AppShell } from "@/components/rosteriq/AppShell";
import { Memory, type Episode, type SemanticFact, type Procedure } from "@/lib/rosteriq/memory";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory — RosterIQ" },
      { name: "description", content: "Visualize episodic, semantic, and procedural memory of the analytics agent." },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [facts, setFacts] = useState<SemanticFact[]>([]);
  const [procs, setProcs] = useState<Procedure[]>([]);
  const [patterns, setPatterns] = useState<ReturnType<typeof Memory.patterns>>({ totalEpisodes: 0, datasetCount: {}, topWords: [] });

  useEffect(() => {
    setEpisodes(Memory.getEpisodes());
    setFacts(Memory.getSemantic());
    setProcs(Memory.getProcedural());
    setPatterns(Memory.patterns());
  }, []);

  const wordData = patterns.topWords.map(([word, count]) => ({ word, count }));

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cognitive substrate</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Memory Architecture</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Three persistent memory systems shape every reasoning step. Updated live as you query.</p>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Stat icon={Clock} label="Episodes Persisted" value={episodes.length} accent="cyan" />
          <Stat icon={BookOpen} label="Semantic Facts" value={facts.length} accent="violet" />
          <Stat icon={Workflow} label="Procedures Available" value={procs.length} accent="emerald" />
        </div>

        <Section icon={Clock} title="Episodic Memory" subtitle="Every interaction is recorded for retrieval and pattern mining.">
          {episodes.length === 0 ? (
            <Empty msg="No episodes yet — ask a question in the Workspace to populate." />
          ) : (
            <div className="space-y-2">
              {episodes.slice(0, 12).map((e) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-lg border border-border/60 bg-card/40 p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">{e.datasetId}</span>
                    <span>{new Date(e.ts).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-sm">{e.question}</div>
                  {e.summary && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{e.summary}</div>}
                  <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {e.rowCount != null && <span>{e.rowCount} rows</span>}
                    {e.chartType && <span>{e.chartType}</span>}
                  </div>
                </motion.div>
              ))}
              <button onClick={() => { Memory.clearEpisodes(); setEpisodes([]); setPatterns(Memory.patterns()); }}
                className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 mt-2">
                <Trash2 className="size-3" /> Clear episodes
              </button>
            </div>
          )}

          {wordData.length > 0 && (
            <div className="mt-6 rounded-lg border border-border/60 bg-card/40 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Recurring patterns</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wordData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                  <XAxis dataKey="word" stroke="oklch(0.65 0.02 260)" fontSize={10} />
                  <YAxis stroke="oklch(0.65 0.02 260)" fontSize={10} />
                  <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(0.28 0.022 260)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>

        <Section icon={BookOpen} title="Semantic Memory" subtitle="Schema knowledge, derived metrics, and entity relationships injected into every reasoning step.">
          <div className="grid md:grid-cols-2 gap-3">
            {facts.map((f) => (
              <div key={f.id} className="rounded-lg border border-border/60 bg-card/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.type}</span>
                  <span className="text-[10px] font-mono text-primary">w={f.weight.toFixed(2)}</span>
                </div>
                <div className="mt-1 text-sm font-mono text-foreground">{f.subject}</div>
                <div className="mt-1 text-xs text-muted-foreground">{f.fact}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Workflow} title="Procedural Memory" subtitle="Reusable diagnostic workflows the agent can invoke and refine.">
          <div className="grid md:grid-cols-2 gap-3">
            {procs.map((p) => (
              <div key={p.id} className="rounded-lg border border-border/60 bg-card/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.name}</div>
                  <span className="text-[10px] font-mono text-muted-foreground">used {p.uses}×</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{p.description}</div>
                <ol className="mt-3 space-y-1">
                  {p.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <span className="size-4 shrink-0 rounded bg-primary/15 text-primary grid place-items-center font-mono text-[10px]">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl glass p-5 glow-border">
      <div className="flex items-center justify-between">
        <Icon className="size-5" style={{ color: `var(--${accent})` }} />
        <Brain className="size-4 text-muted-foreground/40" />
      </div>
      <div className="mt-4 text-3xl font-semibold text-gradient">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, children }: { icon: any; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-1">
        <div className="size-8 rounded-md bg-secondary/60 grid place-items-center">
          <Icon className="size-4 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 ml-11">{subtitle}</p>
      {children}
    </section>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">{msg}</div>;
}
