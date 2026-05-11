import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useSyncExternalStore, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Code2, ChevronDown, ChevronUp, Lightbulb, Upload, RotateCcw, Gauge, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/rosteriq/AppShell";
import { AgentTrace } from "@/components/rosteriq/AgentTrace";
import { ChartView } from "@/components/rosteriq/ChartView";
import { getAllDatasets, registerCustomDataset, subscribeDatasets, type Dataset } from "@/lib/rosteriq/datasets";
import { runAgent, type AgentRun, type TraceStep } from "@/lib/rosteriq/agent";
import { toast } from "sonner";

export const Route = createFileRoute("/workspace")({
  validateSearch: (s: Record<string, unknown>) => ({ dataset: typeof s.dataset === "string" ? s.dataset : undefined }),
  head: () => ({
    meta: [
      { title: "Workspace — RosterIQ" },
      { name: "description", content: "Ask questions in plain English. Watch the agent plan, query, and visualize." },
    ],
  }),
  component: Workspace,
});

type Turn = { id: string; question: string; run?: AgentRun; trace: TraceStep[]; loading: boolean };

function useDatasets() {
  return useSyncExternalStore(
    (cb) => subscribeDatasets(cb),
    () => getAllDatasets(),
    () => getAllDatasets(),
  );
}

function Workspace() {
  const datasets = useDatasets();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/workspace" });

  const activeId = useMemo(() => {
    if (search.dataset && datasets.some((d) => d.id === search.dataset)) return search.dataset!;
    return datasets[0]?.id;
  }, [search.dataset, datasets]);

  const dataset = datasets.find((d) => d.id === activeId) || datasets[0];

  // per-dataset conversation state
  const [turnsByDs, setTurnsByDs] = useState<Record<string, Turn[]>>({});
  const turns = dataset ? (turnsByDs[dataset.id] ?? []) : [];
  const setTurns = (updater: (prev: Turn[]) => Turn[]) => {
    if (!dataset) return;
    setTurnsByDs((m) => ({ ...m, [dataset.id]: updater(m[dataset.id] ?? []) }));
  };

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [turns.length, dataset?.id]);

  function selectDataset(id: string) {
    navigate({ search: { dataset: id }, replace: true });
  }

  if (!dataset) {
    return (
      <AppShell>
        <div className="grid place-items-center h-screen text-sm text-muted-foreground">
          Initializing intelligence core…
        </div>
      </AppShell>
    );
  }

  async function ask(q: string) {
    if (!q.trim() || !dataset) return;
    const id = crypto.randomUUID();
    const ds = dataset;
    setTurns((t) => [...t, { id, question: q, trace: [], loading: true }]);
    setInput("");
    try {
      const run = await runAgent(q, ds, {
        onTrace: (s) => setTurnsByDs((m) => ({ ...m, [ds.id]: (m[ds.id] ?? []).map((t) => t.id === id ? { ...t, trace: [...t.trace, s] } : t) })),
        onUpdate: (run) => setTurnsByDs((m) => ({ ...m, [ds.id]: (m[ds.id] ?? []).map((t) => t.id === id ? { ...t, run } : t) })),
      });
      setTurnsByDs((m) => ({ ...m, [ds.id]: (m[ds.id] ?? []).map((t) => t.id === id ? { ...t, run, loading: false } : t) }));
      if (run.error) toast.error(run.error);
    } catch (e: any) {
      const msg = e?.message || String(e);
      toast.error(`Inference failed: ${msg}`);
      setTurnsByDs((m) => ({ ...m, [ds.id]: (m[ds.id] ?? []).map((t) => t.id === id ? { ...t, loading: false, run: { question: q, dataset: ds, error: msg } } : t) }));
    }
  }

  function onCsvUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      if (!text.includes(",")) return toast.error("File doesn't look like a CSV.");
      const ds = registerCustomDataset(file.name.replace(/\.csv$/i, ""), text);
      selectDataset(ds.id);
      toast.success(`Loaded ${ds.name} · schema will be detected on first query`);
    };
    reader.readAsText(file);
  }

  return (
    <AppShell>
      <div className="relative flex h-screen flex-col overflow-hidden">
        {/* ambient cybernetic background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="absolute -top-40 -left-40 size-[480px] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute top-1/3 -right-32 size-[420px] rounded-full bg-accent/15 blur-[120px]" />
        </div>

        <header className="flex items-center justify-between border-b border-border/60 px-6 py-3 glass">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald animate-pulse" /> Live · Workspace
              </div>
              <div className="text-lg font-medium leading-tight">{dataset.name}</div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground border-l border-border/60 pl-4">
              <span className="text-primary">{dataset.table}</span>
              <span>·</span>
              <span>{dataset.columns.length || "?"} cols</span>
              <span>·</span>
              <span>{dataset.rows.toLocaleString()} rows</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs hover:border-primary/60 transition">
              <Upload className="size-3.5" /> Upload CSV
              <input type="file" accept=".csv,text/csv" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onCsvUpload(f); e.target.value = ""; }} />
            </label>
            <select value={dataset.id} onChange={(e) => selectDataset(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
              {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-auto px-6 py-6 space-y-8">
          {turns.length === 0 && <EmptyState dataset={dataset} onAsk={ask} />}
          {turns.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-4 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-md bg-secondary grid place-items-center text-xs font-mono">You</div>
                  <div className="flex-1 pt-1 text-sm flex items-center justify-between gap-3">
                    <span>{t.question}</span>
                    <button onClick={() => ask(t.question)}
                      title="Replay this analysis on current data"
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary">
                      <RotateCcw className="size-3" /> replay
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-3 group">
                  <div className="size-7 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center">
                    <Sparkles className="size-3.5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    {t.loading && !t.run?.summary && (
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                        Reasoning through the schema…
                      </div>
                    )}
                    {t.run?.summary && (
                      <div className="prose prose-invert prose-sm max-w-none text-sm">
                        <ReactMarkdown>{t.run.summary}</ReactMarkdown>
                      </div>
                    )}
                    {t.run?.insights && t.run.insights.length > 0 && (
                      <ul className="space-y-1.5">
                        {t.run.insights.map((i, k) => (
                          <li key={k} className="flex gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="size-3.5 text-amber shrink-0 mt-0.5" /> {i}
                          </li>
                        ))}
                      </ul>
                    )}
                    {t.run?.sql && <QueryIntelligence run={t.run} />}
                    {t.run?.rows && (
                      <div className="rounded-xl glass p-4">
                        <ChartView run={t.run} />
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      {t.run && !t.loading && (
                        <button onClick={() => ask(t.question)}
                          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition">
                          <RotateCcw className="size-3" /> Replay analysis
                        </button>
                      )}
                    </div>
                    {t.run?.error && (
                      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Inference pipeline failure</div>
                          <div className="text-xs opacity-80 mt-0.5">{t.run.error}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <aside className="lg:sticky lg:top-4 self-start rounded-xl glass p-4">
                <AgentTrace steps={t.trace} />
              </aside>
            </motion.div>
          ))}
        </div>

        <footer className="border-t border-border/60 px-6 py-4 glass">
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${dataset.name} anything…`}
              className="flex-1 rounded-lg border border-border bg-card/60 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
            <button type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)] hover:opacity-95">
              <Send className="size-4" /> Ask
            </button>
          </form>
        </footer>
      </div>
    </AppShell>
  );
}

function EmptyState({ dataset, onAsk }: { dataset: Dataset; onAsk: (q: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto pt-12">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Suggested questions</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Try asking about <span className="text-gradient">{dataset.name}</span></h2>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {dataset.sampleQuestions.map((q) => (
          <button key={q} onClick={() => onAsk(q)}
            className="text-left rounded-xl glass p-4 hover:glow-border transition group">
            <div className="text-sm">{q}</div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-primary">Run query →</div>
          </button>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-border/60 bg-card/30 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Schema · {dataset.table}</div>
        {dataset.columns.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {dataset.columns.map((c) => (
              <span key={c.name} className="text-[11px] font-mono rounded border border-border/60 bg-secondary/40 px-2 py-0.5">
                {c.name} <span className="text-muted-foreground">{c.type}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Schema will be auto-detected on first query.</div>
        )}
      </div>
    </div>
  );
}

function QueryIntelligence({ run }: { run: AgentRun }) {
  const [open, setOpen] = useState(false);
  const conf = Math.round((run.confidence ?? 0.75) * 100);
  const confColor = conf >= 80 ? "text-emerald" : conf >= 60 ? "text-amber" : "text-destructive";
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/30">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Code2 className="size-3.5" /> Query Intelligence
          {run.chartType && (
            <span className="ml-2 normal-case tracking-normal text-[10px] font-mono rounded bg-secondary/60 px-1.5 py-0.5 text-foreground/70">
              chart: {run.chartType}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-[11px] font-mono ${confColor}`}>
            <Gauge className="size-3.5" /> {conf}%
          </div>
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/60 overflow-hidden">
            <div className="p-4 space-y-3">
              {run.explanation && <p className="text-sm text-muted-foreground">{run.explanation}</p>}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Generated SQL</div>
                  <pre className="text-xs font-mono overflow-auto bg-background/60 p-3 rounded-md border border-border/60 max-h-56">{run.sql}</pre>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Visualization plan</div>
                    <div className="text-xs font-mono rounded-md border border-border/60 bg-background/40 p-3 space-y-1">
                      <div><span className="text-muted-foreground">type</span> {run.chartType}</div>
                      {run.xKey && <div><span className="text-muted-foreground">x</span> {run.xKey}</div>}
                      {run.yKeys && run.yKeys.length > 0 && <div><span className="text-muted-foreground">y</span> {run.yKeys.join(", ")}</div>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Assumptions</div>
                    {run.assumptions && run.assumptions.length > 0 ? (
                      <ul className="text-xs space-y-1">
                        {run.assumptions.map((a, i) => (
                          <li key={i} className="rounded border border-border/40 bg-background/40 px-2 py-1.5">{a}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">No additional assumptions stated.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
