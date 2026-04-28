/**
 * scofieldApi.ts
 *
 * Loads Scofield Reference Notes (1917, public domain) extracted from the
 * CrossWire SWORD module. Data is served as a static JSON from /data/scofield_notes.json.
 *
 * Data format:
 *   { [bookKey: string]: { [chapter: string]: Array<{ k: string; t: string }> } }
 *   k = keyword/heading (bold phrase from the KJV verse)
 *   t = note body text
 *
 * Translation: translateToPortuguese() from knowledgeApi (Google Translate, no key).
 */

import { translateToPortuguese } from './knowledgeApi';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScofieldNote {
  keyword: string;      // Bold keyword in English (e.g. "without form and void")
  keywordPt: string;    // Keyword translated to PT
  text: string;         // Note body in English
  textPt: string;       // Note body translated to PT
}

export interface ScofieldChapterNotes {
  bookKey: string;
  chapter: number;
  notes: ScofieldNote[];
}

// ── Cache ─────────────────────────────────────────────────────────────────────

let rawDataCache: Record<string, Record<string, Array<{ k: string; t: string }>>> | null = null;
const translatedCache = new Map<string, ScofieldChapterNotes>();

// ── Loader ────────────────────────────────────────────────────────────────────

async function loadRawData() {
  if (rawDataCache) return rawDataCache;
  const res = await fetch('/data/scofield_notes.json');
  if (!res.ok) throw new Error('Failed to load Scofield data');
  rawDataCache = await res.json();
  return rawDataCache!;
}

// ── Main API ──────────────────────────────────────────────────────────────────

export async function getScofieldNotes(
  bookKey: string,
  chapter: number
): Promise<ScofieldChapterNotes> {
  const cacheKey = `${bookKey}_${chapter}`;
  if (translatedCache.has(cacheKey)) return translatedCache.get(cacheKey)!;

  const data = await loadRawData();
  const bookData = data[bookKey];

  if (!bookData) {
    const empty: ScofieldChapterNotes = { bookKey, chapter, notes: [] };
    translatedCache.set(cacheKey, empty);
    return empty;
  }

  const rawNotes = bookData[String(chapter)] ?? [];

  if (rawNotes.length === 0) {
    const empty: ScofieldChapterNotes = { bookKey, chapter, notes: [] };
    translatedCache.set(cacheKey, empty);
    return empty;
  }

  // Translate in parallel (keyword + text for each note)
  const notes: ScofieldNote[] = await Promise.all(
    rawNotes.map(async ({ k, t }) => {
      const [keywordPt, textPt] = await Promise.all([
        k ? translateToPortuguese(k) : Promise.resolve(''),
        translateToPortuguese(t),
      ]);
      return { keyword: k, keywordPt, text: t, textPt };
    })
  );

  const result: ScofieldChapterNotes = { bookKey, chapter, notes };
  translatedCache.set(cacheKey, result);
  return result;
}
