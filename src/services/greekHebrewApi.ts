// Greek / Hebrew word-study service
// Data source: STEPBible TAGNT (Greek NT) + TAHOT (Hebrew OT) — CC BY 4.0
// Tyndale House, Cambridge · https://github.com/STEPBible/STEPBible-Data

export interface BibleWord {
  n: number;   // word index (1-based)
  w: string;   // original word form (Greek or Hebrew)
  t: string;   // transliteration
  g: string;   // English gloss
  s: string;   // Strong number (G3056 / H7225G)
  m: string;   // morphology code
  l: string;   // lemma
  lg: string;  // lemma gloss
}

// verse key → array of words
export type ChapterWordMap = Record<string, BibleWord[]>;

const cache = new Map<string, ChapterWordMap>();

const NT_BOOKS = new Set([
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL',
  '1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN',
  '3JN','JUD','REV',
]);

export function isNT(bookId: string): boolean {
  return NT_BOOKS.has(bookId.toUpperCase());
}

export async function getChapterWords(bookId: string, chapter: number): Promise<ChapterWordMap> {
  const key = `${bookId}-${chapter}`;
  if (cache.has(key)) return cache.get(key)!;

  const folder = isNT(bookId) ? 'greek' : 'hebrew';
  const url = `/data/${folder}/${bookId.toUpperCase()}/${chapter}.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    const data: ChapterWordMap = await res.json();
    cache.set(key, data);
    return data;
  } catch {
    return {};
  }
}

// ── Greek morphology decoder ──────────────────────────────────────────────────

const GK_POS: Record<string, string> = {
  N: 'Subst.', V: 'Verbo', ADJ: 'Adj.', ADV: 'Adv.', PREP: 'Prep.',
  CONJ: 'Conj.', PRON: 'Pron.', DET: 'Art.', PTCL: 'Part.',
  INJ: 'Interj.', ARAM: 'Aramaico', HEB: 'Hebraico',
};
const GK_CASE: Record<string, string> = {
  N: 'Nom.', G: 'Gen.', D: 'Dat.', A: 'Acus.', V: 'Voc.',
};
const GK_NUMBER: Record<string, string> = { S: 'sing.', P: 'pl.' };
const GK_GENDER: Record<string, string> = { M: 'masc.', F: 'fem.', N: 'neut.' };
const GK_TENSE: Record<string, string> = {
  P: 'Pres.', I: 'Imp.', A: 'Aor.', F: 'Fut.', R: 'Perf.', L: 'Plusperf.',
};
const GK_VOICE: Record<string, string> = { A: 'Ativo', M: 'Médio', P: 'Pass.', E: 'Médio/Pass.' };
const GK_MOOD: Record<string, string> = {
  I: 'Ind.', S: 'Subj.', O: 'Opt.', M: 'Imp.', N: 'Inf.', P: 'Part.',
};
const GK_PERSON: Record<string, string> = { '1': '1ª p.', '2': '2ª p.', '3': '3ª p.' };

export function decodeGreekMorph(code: string): string {
  if (!code) return '';
  const parts = code.split('-');
  const pos = GK_POS[parts[0]] || parts[0];
  if (!parts[1]) return pos;

  // Nominal: N-NSF, ADJ-APM…
  if (['N','ADJ','DET','PRON'].includes(parts[0])) {
    const s = parts[1];
    const c = GK_CASE[s[0]] || '';
    const n = GK_NUMBER[s[1]] || '';
    const g = GK_GENDER[s[2]] || '';
    return [pos, c, n, g].filter(Boolean).join(' ');
  }
  // Verbal: V-IAI-3S, V-PAP-NSM…
  if (parts[0] === 'V') {
    const tv = parts[1] || '';
    const extra = parts[2] || '';
    const tense = GK_TENSE[tv[0]] || '';
    const voice = GK_VOICE[tv[1]] || '';
    const mood  = GK_MOOD[tv[2]]  || '';
    // Finite: mood I/S/O/M + person+number
    const person = GK_PERSON[extra[0]] || '';
    const num    = GK_NUMBER[extra[1]] || '';
    // Participle/Inf
    if (tv[2] === 'P' || tv[2] === 'N') {
      const c2 = GK_CASE[extra[0]] || '';
      const n2 = GK_NUMBER[extra[1]] || '';
      const g2 = GK_GENDER[extra[2]] || '';
      return [pos, tense, voice, mood, c2, n2, g2].filter(Boolean).join(' ');
    }
    return [pos, tense, voice, mood, person, num].filter(Boolean).join(' ');
  }
  return [pos, parts.slice(1).join('-')].filter(Boolean).join(' ');
}

// ── Hebrew morphology decoder ────────────────────────────────────────────────

const HB_STEM: Record<string, string> = {
  q: 'Qal', N: 'Nifal', p: 'Piel', P: 'Pual', h: 'Hifil',
  H: 'Hofal', t: 'Tifal', i: 'Istafal', e: 'Etpael',
};
const HB_ASPECT: Record<string, string> = {
  p: 'Perf.', i: 'Imperf.', h: 'Coh.', j: 'Juss.', w: 'Cons.imperf.',
  q: 'Cons.perf.', a: 'Imper.', r: 'Part.ativo', s: 'Part.pass.', c: 'Inf.constr.',
  a2: 'Inf.abs.', n: 'Inf.abs.',
};
const HB_PERSON: Record<string, string> = { '1': '1ª p.', '2': '2ª p.', '3': '3ª p.' };
const HB_GENDER: Record<string, string> = { m: 'masc.', f: 'fem.', c: 'com.' };
const HB_NUMBER: Record<string, string> = { s: 'sing.', p: 'pl.', d: 'dual' };
const HB_STATE: Record<string, string>  = { a: 'abs.', c: 'constr.', d: 'det.' };

const HB_POS: Record<string, string> = {
  V: 'Verbo', N: 'Subst.', A: 'Adj.', P: 'Pron.', D: 'Adv.',
  T: 'Part.', C: 'Conj.', R: 'Prep.', I: 'Interj.', S: 'Suf.',
};

export function decodeHebrewMorph(code: string): string {
  if (!code) return '';
  // prefix removals: H = Hebrew marker, R/ = preposition prefix
  let c = code.replace(/^H/, '').replace(/^R\//, 'R');

  const pos = HB_POS[c[0]] || c[0];

  if (c[0] === 'V') {
    // HVqp3ms → V q p 3 m s
    const stem   = HB_STEM[c[1]] || c[1] || '';
    const aspect = HB_ASPECT[c[2]] || '';
    const person = HB_PERSON[c[3]] || '';
    const gender = HB_GENDER[c[4]] || '';
    const number = HB_NUMBER[c[5]] || '';
    return ['Verbo', stem, aspect, person, gender, number].filter(Boolean).join(' ');
  }
  if (c[0] === 'N') {
    // HNcmpa → N c m p a
    const gender = HB_GENDER[c[2]] || '';
    const number = HB_NUMBER[c[3]] || '';
    const state  = HB_STATE[c[4]] || '';
    return ['Subst.', gender, number, state].filter(Boolean).join(' ');
  }
  if (c[0] === 'A') {
    const gender = HB_GENDER[c[2]] || '';
    const number = HB_NUMBER[c[3]] || '';
    const state  = HB_STATE[c[4]] || '';
    return ['Adj.', gender, number, state].filter(Boolean).join(' ');
  }
  return [pos, c.slice(1)].filter(Boolean).join(' ');
}
