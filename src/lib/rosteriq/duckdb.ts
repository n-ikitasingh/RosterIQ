import * as duckdb from "@duckdb/duckdb-wasm";
import { DATASETS, type Dataset } from "./datasets";

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;
const loaded = new Set<string>();

async function init(): Promise<duckdb.AsyncDuckDB> {
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], { type: "text/javascript" })
  );
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);
  return db;
}

export function getDB() {
  if (!dbPromise) dbPromise = init();
  return dbPromise;
}

export async function loadDataset(ds: Dataset) {
  if (loaded.has(ds.id)) return;
  const db = await getDB();
  let text: string;
  if (ds.file.startsWith("inline:")) {
    text = ds.file.slice("inline:".length);
  } else {
    const res = await fetch(ds.file);
    text = await res.text();
  }
  await db.registerFileText(`${ds.id}.csv`, text);
  const conn = await db.connect();
  await conn.query(`DROP TABLE IF EXISTS ${ds.table}`);
  await conn.query(
    `CREATE TABLE ${ds.table} AS SELECT * FROM read_csv_auto('${ds.id}.csv', header=true)`
  );
  // Detect columns for custom datasets that arrived with empty schema
  if (ds.columns.length === 0) {
    const desc = await conn.query(`DESCRIBE ${ds.table}`);
    ds.columns = desc.toArray().map((r: any) => ({ name: r.column_name, type: r.column_type }));
  }
  await conn.close();
  loaded.add(ds.id);
}

export function invalidateDataset(id: string) { loaded.delete(id); }

export async function loadAll() {
  for (const d of DATASETS) await loadDataset(d);
}

export type QueryResult = { columns: string[]; rows: Record<string, unknown>[] };

export async function runSQL(sql: string): Promise<QueryResult> {
  const db = await getDB();
  const conn = await db.connect();
  try {
    const r = await conn.query(sql);
    const columns = r.schema.fields.map((f) => f.name);
    const rows = r.toArray().map((row) => {
      const obj: Record<string, unknown> = {};
      for (const c of columns) {
        const v = (row as any)[c];
        // BigInt → number for chart libs
        obj[c] = typeof v === "bigint" ? Number(v) : v;
      }
      return obj;
    });
    return { columns, rows };
  } finally {
    await conn.close();
  }
}
