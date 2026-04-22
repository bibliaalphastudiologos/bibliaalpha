#!/usr/bin/env node
/**
 * Downloads the latest Historical Christian Faith Commentaries SQLite database
 * (~125MB, 82k+ patristic/historical commentaries per Bible verse, 335 authors)
 * from the upstream GitHub Release.
 *
 * Usage (during build or prebuild):
 *   node scripts/fetch-commentaries.mjs
 *
 * Writes to: public/data/commentaries.sqlite
 * The file is gitignored — it is fetched fresh on each build.
 *
 * Source repo: https://github.com/HistoricalChristianFaith/Commentaries-Database
 * License: upstream repo (MIT-compatible aggregation of public-domain texts).
 */
import { createWriteStream, mkdirSync, existsSync, statSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { resolve, dirname } from "node:path";

const URL = "https://github.com/HistoricalChristianFaith/Commentaries-Database/releases/download/latest/commentaries.sqlite";
const OUT = resolve(process.cwd(), "public/data/commentaries.sqlite");
const EXPECTED_MIN = 100 * 1024 * 1024;

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });

  if (existsSync(OUT) && statSync(OUT).size >= EXPECTED_MIN) {
    console.log(`[commentaries] already present: ${OUT} (${statSync(OUT).size} bytes) — skipping`);
    return;
  }

  console.log(`[commentaries] downloading ${URL}`);
  const res = await fetch(URL, { redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`download failed: ${res.status}`);

  await pipeline(res.body, createWriteStream(OUT));
  const size = statSync(OUT).size;
  if (size < EXPECTED_MIN) throw new Error(`download too small: ${size}`);
  console.log(`[commentaries] saved ${OUT} (${size} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
