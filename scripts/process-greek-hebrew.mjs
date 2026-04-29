#!/usr/bin/env node
// Process STEPBible TAGNT + TAHOT into per-chapter JSON
// CC BY 4.0 — Tyndale House, Cambridge

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__dirname, '..');
const OUT_GK = join(ROOT, 'public', 'data', 'greek');
const OUT_HB = join(ROOT, 'public', 'data', 'hebrew');

function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }
function writeJSON(p, o) { writeFileSync(p, JSON.stringify(o)); }

// Hebrew cantillation stripping
function stripCantillation(s) {
  return s.replace(/[֑-ׇ]/g, match => {
    // Keep dagesh, sheva, vowel points (nikud) but remove cantillation accents
    const cp = match.codePointAt(0);
    // Keep: 05B0-05BC (nikud/sheva/dagesh), 05C1-05C2 (shin/sin dot)
    if (cp >= 0x05B0 && cp <= 0x05BC) return match;
    if (cp === 0x05C1 || cp === 0x05C2) return match;
    return '';
  });
}

const BASE = 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Translators%20Amalgamated%20OT%2BNT';

const TAGNT_URLS = [
  `${BASE}/TAGNT%20Mat-Jhn%20-%20Translators%20Amalgamated%20Greek%20NT%20-%20STEPBible.org%20CC-BY.txt`,
  `${BASE}/TAGNT%20Act-Rev%20-%20Translators%20Amalgamated%20Greek%20NT%20-%20STEPBible.org%20CC-BY.txt`,
];
const TAHOT_URLS = [
  `${BASE}/TAHOT%20Gen-Deu%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
  `${BASE}/TAHOT%20Jos-Est%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
  `${BASE}/TAHOT%20Job-Sng%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
  `${BASE}/TAHOT%20Isa-Mal%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt`,
];

const TAGNT_BOOKS = {
  Mat:'MAT',Mrk:'MRK',Luk:'LUK',Jhn:'JHN',Act:'ACT',
  Rom:'ROM','1Co':'1CO','2Co':'2CO',Gal:'GAL',Eph:'EPH',
  Php:'PHP',Col:'COL','1Th':'1TH','2Th':'2TH','1Ti':'1TI',
  '2Ti':'2TI',Tit:'TIT',Phm:'PHM',Heb:'HEB',Jas:'JAS',
  '1Pe':'1PE','2Pe':'2PE','1Jn':'1JN','2Jn':'2JN','3Jn':'3JN',
  Jud:'JUD',Rev:'REV',
};
const TAHOT_BOOKS = {
  Gen:'GEN',Exo:'EXO',Lev:'LEV',Num:'NUM',Deu:'DEU',
  Jos:'JOS',Jdg:'JDG',Rut:'RUT','1Sa':'1SA','2Sa':'2SA',
  '1Ki':'1KI','2Ki':'2KI','1Ch':'1CH','2Ch':'2CH',Ezr:'EZR',
  Neh:'NEH',Est:'EST',Job:'JOB',Psa:'PSA',Pro:'PRO',
  Ecc:'ECC',Sng:'SNG',Isa:'ISA',Jer:'JER',Lam:'LAM',
  Ezk:'EZK',Dan:'DAN',Hos:'HOS',Jol:'JOL',Amo:'AMO',
  Oba:'OBA',Jon:'JON',Mic:'MIC',Nah:'NAH',Hab:'HAB',
  Zep:'ZEP',Hag:'HAG',Zec:'ZEC',Mal:'MAL',
};

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.text();
}

// TAGNT format:
// Mat.1.1#01=NKO \t Βίβλος (Biblos) \t [The] book \t G0976=N-NSF \t βίβλος=book \t ...
function parseTagnt(text) {
  const result = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || !line.match(/^\w+\.\d+\.\d+#/)) continue;
    const cols = line.split('\t');
    if (cols.length < 5) continue;

    const refMatch = cols[0].match(/^(\w+)\.(\d+)\.(\d+)#(\d+)/);
    if (!refMatch) continue;
    const [, bookAbbr, chap, verse, wordIdx] = refMatch;
    const bookId = TAGNT_BOOKS[bookAbbr];
    if (!bookId) continue;

    // Col 1: Greek(translit)
    const wRaw = cols[1] || '';
    const wm = wRaw.match(/^(.+?)\((.+?)\)\s*$/);
    const w = wm ? wm[1].trim() : wRaw.trim();
    const t = wm ? wm[2].trim() : '';

    // Col 2: gloss
    const g = (cols[2] || '').trim();

    // Col 3: G####=MORPH
    const sm = (cols[3] || '').split('=');
    const s = sm[0] || '';
    const m = sm[1] || '';

    // Col 4: lemma=lemmaGloss
    const lc = cols[4] || '';
    const eq = lc.indexOf('=');
    const l  = eq >= 0 ? lc.slice(0, eq).trim() : lc.trim();
    const lg = eq >= 0 ? lc.slice(eq + 1).trim() : '';

    if (!result[bookId]) result[bookId] = {};
    if (!result[bookId][chap]) result[bookId][chap] = {};
    if (!result[bookId][chap][verse]) result[bookId][chap][verse] = [];
    result[bookId][chap][verse].push({ n: parseInt(wordIdx), w, t, g, s, m, l, lg });
  }
  return result;
}

// TAHOT format:
// Gen.1.1#01=L \t בְּ/רֵאשִׁ֖ית \t be./re.Shit \t in/ beginning \t H9003/{H7225G} \t HR/Ncfsa \t ... \t H7225G \t ... \t H9003=ב=in/{H7225G=רֵאשִׁית=: beginning}
function parseTahot(text) {
  const result = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || !line.match(/^\w+\.\d+\.\d+#/)) continue;
    const cols = line.split('\t');
    if (cols.length < 6) continue;

    const refMatch = cols[0].match(/^(\w+)\.(\d+)\.(\d+)#(\d+)/);
    if (!refMatch) continue;
    const [, bookAbbr, chap, verse, wordIdx] = refMatch;
    const bookId = TAHOT_BOOKS[bookAbbr];
    if (!bookId) continue;

    const w = stripCantillation((cols[1] || '').trim());
    const t = (cols[2] || '').trim();
    const g = (cols[3] || '').trim().replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
    const m = (cols[5] || '').trim();

    // Strong: strip braces, take first entry
    const sRaw = (cols[4] || '').replace(/[{}]/g, '').split('/')[0].trim();
    const s = sRaw;

    // Lemma from last meaningful column (col 10+): {H####=lemma=gloss}
    let l = '', lg = '';
    for (let ci = cols.length - 1; ci >= 6; ci--) {
      const c = (cols[ci] || '').trim();
      if (!c) continue;
      // Pattern: H####=lemmaWord=glossText or {H####=lemmaWord=gloss}
      const lm = c.replace(/[{}]/g, '').match(/H\w+=([֐-׿\w/]+)=(.+)/);
      if (lm) {
        l  = lm[1];
        lg = lm[2].replace(/».*/, '').trim();
        break;
      }
    }
    if (!l) l = w; // fallback to word itself

    if (!result[bookId]) result[bookId] = {};
    if (!result[bookId][chap]) result[bookId][chap] = {};
    if (!result[bookId][chap][verse]) result[bookId][chap][verse] = [];
    result[bookId][chap][verse].push({ n: parseInt(wordIdx), w, t, g, s, m, l, lg });
  }
  return result;
}

function writeChapters(data, outDir) {
  let count = 0;
  for (const [bookId, chapters] of Object.entries(data)) {
    const dir = join(outDir, bookId);
    ensureDir(dir);
    for (const [chap, verses] of Object.entries(chapters)) {
      writeJSON(join(dir, `${chap}.json`), verses);
      count++;
    }
  }
  return count;
}

async function main() {
  ensureDir(OUT_GK);
  ensureDir(OUT_HB);

  // Skip if already generated
  if (existsSync(join(OUT_GK, 'JHN', '1.json')) && existsSync(join(OUT_HB, 'GEN', '1.json'))) {
    console.log('⚡ Data already present — skipping.');
    return;
  }

  let gkTotal = 0;
  for (let i = 0; i < TAGNT_URLS.length; i++) {
    console.log(`⬇ TAGNT ${i+1}/${TAGNT_URLS.length}…`);
    const text = await fetchText(TAGNT_URLS[i]);
    gkTotal += writeChapters(parseTagnt(text), OUT_GK);
  }

  let hbTotal = 0;
  for (let i = 0; i < TAHOT_URLS.length; i++) {
    console.log(`⬇ TAHOT ${i+1}/${TAHOT_URLS.length}…`);
    const text = await fetchText(TAHOT_URLS[i]);
    hbTotal += writeChapters(parseTahot(text), OUT_HB);
  }

  console.log(`✅ Concluído: ${gkTotal} capítulos gregos, ${hbTotal} capítulos hebraicos`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
