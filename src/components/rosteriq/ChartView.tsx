import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import type { AgentRun } from "@/lib/rosteriq/agent";

const COLORS = ["var(--cyan)", "var(--violet)", "var(--emerald)", "var(--amber)", "var(--chart-5)"];
const tooltipStyle = {
  background: "oklch(0.18 0.02 260)",
  border: "1px solid oklch(0.28 0.022 260)",
  borderRadius: 8, fontSize: 12,
} as const;

export function ChartView({ run }: { run: AgentRun }) {
  if (!run.rows || run.rows.length === 0)
    return <div className="text-sm text-muted-foreground">No rows returned.</div>;

  const { rows, columns = [], chartType = "table", xKey, yKeys = [] } = run;
  const x = xKey || columns[0];
  const ys = yKeys.length ? yKeys : columns.filter((c) => c !== x && typeof rows[0][c] === "number");

  if (chartType === "kpi") {
    const r0 = rows[0];
    const entries = Object.entries(r0);
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {entries.map(([k, v]) => (
          <div key={k} className="glass rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="text-2xl font-semibold mt-1 text-gradient">
              {typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chartType === "table") {
    return (
      <div className="overflow-auto rounded-lg border border-border/60 max-h-96">
        <table className="w-full text-xs">
          <thead className="bg-secondary/40 sticky top-0">
            <tr>{columns.map((c) => <th key={c} className="text-left px-3 py-2 font-medium text-muted-foreground">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((r, i) => (
              <tr key={i} className="border-t border-border/40 hover:bg-secondary/20">
                {columns.map((c) => <td key={c} className="px-3 py-1.5 font-mono">{format(r[c])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (chartType === "pie") {
    const yk = ys[0];
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={rows} dataKey={yk} nameKey={x} outerRadius={110} innerRadius={60}>
            {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const Chart = chartType === "line" ? LineChart : chartType === "area" ? AreaChart : BarChart;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <Chart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <defs>
          {ys.map((y, i) => (
            <linearGradient key={y} id={`g-${y}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.7} />
              <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
        <XAxis dataKey={x} stroke="oklch(0.65 0.02 260)" fontSize={11} tickLine={false} />
        <YAxis stroke="oklch(0.65 0.02 260)" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {ys.map((y, i) =>
          chartType === "line" ? (
            <Line key={y} type="monotone" dataKey={y} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
          ) : chartType === "area" ? (
            <Area key={y} type="monotone" dataKey={y} stroke={COLORS[i % COLORS.length]} fill={`url(#g-${y})`} strokeWidth={2} />
          ) : (
            <Bar key={y} dataKey={y} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

function format(v: unknown) {
  if (v == null) return "";
  if (typeof v === "number") return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}
