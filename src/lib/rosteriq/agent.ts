import { runSQL, loadDataset } from "./duckdb";
import { Memory } from "./memory";
import type { Dataset } from "./datasets";
import { supabase } from "@/integrations/supabase/client";

export type TraceStep = {
  id: string;
  ts: number;
  tool: string;
  status: "running" | "done" | "error";
  detail?: string;
  durationMs?: number;
};

export type AgentRun = {
  question: string;
  dataset: Dataset;
  sql?: string;
  explanation?: string;
  summary?: string;
  insights?: string[];
  assumptions?: string[];
  confidence?: number;
  chartType?: "bar" | "line" | "pie" | "area" | "table" | "kpi";
  xKey?: string;
  yKeys?: string[];
  rows?: Record<string, unknown>[];
  columns?: string[];
  error?: string;
};

type Callbacks = {
  onTrace: (s: TraceStep) => void;
  onUpdate: (run: AgentRun) => void;
};

function step(cb: (s: TraceStep) => void, tool: string, detail?: string) {
  const id = crypto.randomUUID();
  const start = performance.now();
  cb({ id, ts: Date.now(), tool, status: "running", detail });
  return {
    done: (extra?: string) => cb({ id, ts: Date.now(), tool, status: "done", detail: extra ?? detail, durationMs: Math.round(performance.now() - start) }),
    fail: (err: string) => cb({ id, ts: Date.now(), tool, status: "error", detail: err, durationMs: Math.round(performance.now() - start) }),
  };
}

export async function runAgent(question: string, dataset: Dataset, cbs: Callbacks): Promise<AgentRun> {
  const run: AgentRun = { question, dataset };
  const update = () => cbs.onUpdate({ ...run });

  // 1. Schema analyzer
  const s1 = step(cbs.onTrace, "Schema Analyzer", `Loading schema for ${dataset.name}`);
  try { await loadDataset(dataset); s1.done(`${dataset.columns.length} columns indexed`); }
  catch (e) { s1.fail(String(e)); run.error = String(e); update(); return run; }

  // 2. Memory recall
  const s2 = step(cbs.onTrace, "Memory Recall", "Searching episodic + semantic memory");
  const recent = Memory.getEpisodes().filter((e) => e.datasetId === dataset.id).slice(0, 3);
  const facts = Memory.getSemantic().filter((f) => f.subject.startsWith(dataset.table) || dataset.columns.some((c) => f.subject.includes(c.name))).slice(0, 6);
  s2.done(`${recent.length} prior episodes · ${facts.length} semantic facts`);

  // 3. NL → SQL via inference layer edge function
  const s3 = step(cbs.onTrace, "NL→SQL Planner", "Calling reasoning model");
  let plan: any;
  try {
    const { data, error } = await supabase.functions.invoke("nl-to-sql", {
      body: {
        question,
        dataset: { table: dataset.table, columns: dataset.columns, name: dataset.name },
        memory: { recent: recent.map((r) => ({ q: r.question, sql: r.sql })), facts: facts.map((f) => f.fact) },
      },
    });
    if (error) throw error;
    plan = data;
    s3.done(`Generated ${plan.sql?.length || 0} chars of SQL`);
  } catch (e: any) {
    s3.fail(e.message || String(e));
    run.error = e.message || String(e);
    update(); return run;
  }

  run.sql = plan.sql;
  run.explanation = plan.explanation;
  run.chartType = plan.chartType;
  run.xKey = plan.xKey;
  run.yKeys = plan.yKeys;
  run.confidence = typeof plan.confidence === "number" ? plan.confidence : 0.75;
  run.assumptions = Array.isArray(plan.assumptions) ? plan.assumptions : [];
  update();

  // 4. Execute
  const s4 = step(cbs.onTrace, "DuckDB Executor", "Running query against in-browser warehouse");
  try {
    const result = await runSQL(plan.sql);
    run.rows = result.rows; run.columns = result.columns;
    s4.done(`${result.rows.length} rows · ${result.columns.length} cols`);
  } catch (e: any) {
    s4.fail(e.message || String(e));
    run.error = `SQL error: ${e.message || e}`;
    update(); return run;
  }
  update();

  // 5. Synthesize insights
  const s5 = step(cbs.onTrace, "Insight Synthesizer", "Computing summary + KPIs");
  run.summary = plan.summary || `Returned ${run.rows!.length} rows.`;
  run.insights = plan.insights || [];
  s5.done(`${run.insights!.length} insight(s)`);
  update();

  // 6. Memory write
  const s6 = step(cbs.onTrace, "Memory Update", "Persisting episode");
  Memory.addEpisode({
    datasetId: dataset.id, question, sql: run.sql, summary: run.summary,
    rowCount: run.rows?.length, chartType: run.chartType,
  });
  s6.done("Episode persisted");

  return run;
}
