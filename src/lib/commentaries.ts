/**
 * Runtime helper to query the Historical Christian Faith Commentaries DB.
 * Requires the SQLite file at /public/data/commentaries.sqlite
 * (fetched at build time by scripts/fetch-commentaries.mjs).
 *
 * Uses sql.js (WebAssembly SQLite) in the browser. Install:
 *   npm i sql.js
 *
 * Dataset: 82,404 commentaries from 335 church fathers & reformers, keyed
 * per Bible verse. See src/data/commentariesIndex.ts for the metadata index.
 */
import type { Database, SqlJsStatic } from "sql.js";

let dbPromise: Promise<Database> | null = null;

export interface Commentary {
  id: string;
  father_name: string;
  append_to_author_name: string;
  ts: number;
  book: string;
  location_start: number;
  location_end: number;
  txt: string;
  source_url: string;
  source_title: string;
}

async function loadDb(): Promise<Database> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const initSqlJs = (await import("sql.js")).default;
    const SQL: SqlJsStatic = await initSqlJs({
      locateFile: (f: string) => `/sql-wasm/${f}`,
    });
    const buf = await fetch("/data/commentaries.sqlite").then((r) => r.arrayBuffer());
    return new SQL.Database(new Uint8Array(buf));
  })();
  return dbPromise;
}

/** Encode a Bible verse as the numeric location used by the DB: chapter*1000 + verse. */
export function encodeLocation(chapter: number, verse: number): number {
  return chapter * 1000 + verse;
}

/** Query commentaries that cover the given book/chapter/verse. */
export async function getCommentariesForVerse(
  book: string,
  chapter: number,
  verse: number
): Promise<Commentary[]> {
  const db = await loadDb();
  const loc = encodeLocation(chapter, verse);
  const res = db.exec(
    `SELECT id, father_name, append_to_author_name, ts, book,
            location_start, location_end, txt, source_url, source_title
       FROM commentary
      WHERE book = :book
        AND location_start <= :loc
        AND location_end   >= :loc
      ORDER BY ts ASC, father_name ASC`,
    { ":book": book.toLowerCase(), ":loc": loc }
  );
  if (!res.length) return [];
  const [{ columns, values }] = res;
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((c, i) => (obj[c] = row[i]));
    return obj as unknown as Commentary;
  });
}
