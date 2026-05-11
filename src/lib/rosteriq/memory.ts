// Three memory subsystems persisted to localStorage.
// Episodic: every interaction. Semantic: schema/concept facts. Procedural: reusable workflows.

export type Episode = {
  id: string;
  ts: number;
  datasetId: string;
  question: string;
  sql?: string;
  summary?: string;
  rowCount?: number;
  chartType?: string;
};

export type SemanticFact = {
  id: string;
  type: "schema" | "metric" | "entity";
  subject: string;
  fact: string;
  source: string;
  weight: number;
};

export type Procedure = {
  id: string;
  name: string;
  description: string;
  steps: string[];
  uses: number;
  updated: number;
};

const KEYS = {
  ep: "rosteriq.episodic",
  sem: "rosteriq.semantic",
  proc: "rosteriq.procedural",
};

const isClient = () => typeof window !== "undefined";
function read<T>(k: string, fallback: T): T {
  if (!isClient()) return fallback;
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write<T>(k: string, v: T) { if (isClient()) localStorage.setItem(k, JSON.stringify(v)); }

export const Memory = {
  getEpisodes(): Episode[] { return read<Episode[]>(KEYS.ep, []); },
  addEpisode(e: Omit<Episode, "id" | "ts">) {
    const all = this.getEpisodes();
    const ep: Episode = { ...e, id: crypto.randomUUID(), ts: Date.now() };
    all.unshift(ep);
    write(KEYS.ep, all.slice(0, 200));
    return ep;
  },
  clearEpisodes() { write(KEYS.ep, []); },

  getSemantic(): SemanticFact[] { return read<SemanticFact[]>(KEYS.sem, DEFAULT_SEMANTIC); },
  addSemantic(f: Omit<SemanticFact, "id">) {
    const all = this.getSemantic();
    all.push({ ...f, id: crypto.randomUUID() });
    write(KEYS.sem, all);
  },

  getProcedural(): Procedure[] { return read<Procedure[]>(KEYS.proc, DEFAULT_PROCEDURES); },
  bumpProcedure(id: string) {
    const all = this.getProcedural();
    const p = all.find((x) => x.id === id);
    if (p) { p.uses += 1; p.updated = Date.now(); write(KEYS.proc, all); }
  },

  // Aggregate view for dashboards
  patterns() {
    const eps = this.getEpisodes();
    const datasetCount: Record<string, number> = {};
    const wordCount: Record<string, number> = {};
    for (const e of eps) {
      datasetCount[e.datasetId] = (datasetCount[e.datasetId] || 0) + 1;
      for (const w of e.question.toLowerCase().match(/\b[a-z]{4,}\b/g) || []) {
        if (STOP.has(w)) continue;
        wordCount[w] = (wordCount[w] || 0) + 1;
      }
    }
    const topWords = Object.entries(wordCount).sort((a,b)=>b[1]-a[1]).slice(0,12);
    return { totalEpisodes: eps.length, datasetCount, topWords };
  },
};

const STOP = new Set(["show","what","which","compare","find","give","list","with","from","that","this","have","does","using","across","over","than"]);

const DEFAULT_SEMANTIC: SemanticFact[] = [
  { id: "s1", type: "schema", subject: "claims.status", fact: "Statuses: APPROVED, DENIED, PENDING, PROCESSING, REJECTED. DENIED is post-review; REJECTED is intake failure.", source: "domain", weight: 0.9 },
  { id: "s2", type: "schema", subject: "claims.line_of_business", fact: "LOB values: Medicare, Medicaid, Commercial, HMO, PPO. Government LOBs use stricter coding rules.", source: "domain", weight: 0.85 },
  { id: "s3", type: "metric", subject: "approval_rate", fact: "approval_rate = APPROVED claims / total claims, computed per provider or region.", source: "derived", weight: 0.95 },
  { id: "s4", type: "entity", subject: "providers↔claims", fact: "claims.provider_id joins providers.provider_id (1:N).", source: "schema", weight: 1.0 },
  { id: "s5", type: "metric", subject: "churn_rate", fact: "churn_rate = COUNT(churned=true) / COUNT(*) over a cohort.", source: "derived", weight: 0.9 },
  { id: "s6", type: "schema", subject: "txns.is_flagged", fact: "Transactions auto-flagged when |amount| > 30000.", source: "rule", weight: 0.8 },
];

const DEFAULT_PROCEDURES: Procedure[] = [
  {
    id: "p1", name: "Triage Stuck Operations",
    description: "Surface claims/orders stuck in PENDING/PROCESSING beyond SLA.",
    steps: ["Filter status IN ('PENDING','PROCESSING')","Compute days since submit","Rank by age desc","Group by region for hotspots"],
    uses: 0, updated: Date.now(),
  },
  {
    id: "p2", name: "Quality Audit",
    description: "Quantify denial/rejection share and top denial reasons.",
    steps: ["Aggregate by status","Filter DENIED + REJECTED","Group denial_reason","Compute % of total"],
    uses: 0, updated: Date.now(),
  },
  {
    id: "p3", name: "Market Health Report",
    description: "Cross-cut approval rates, volume and spend per region.",
    steps: ["Group by region","Approval rate","Total approved amount","Z-score vs national mean"],
    uses: 0, updated: Date.now(),
  },
  {
    id: "p4", name: "Retention Lift Analysis",
    description: "Estimate retention impact of contract type and tenure.",
    steps: ["Bucket tenure_months","Churn % per bucket","Compare contract types","Identify high-risk segments"],
    uses: 0, updated: Date.now(),
  },
];
