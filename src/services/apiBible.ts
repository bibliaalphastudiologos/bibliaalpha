/**
 * apiBible.ts
 * Fontes bíblicas gratuitas, sem chave de API, com CORS habilitado:
 *
 *   1. bible.helloao.org  — 5 traduções PT + 4 EN (open source, 1256+ traduções)
 *   2. bible-api.com      — Almeida Revista e Corrigida (ARC)
 *   3. api.getbible.net   — Almeida Atualizada, Bíblia Livre, Bíblia Livre TR
 *
 * Lista completa HelloAO: https://bible.helloao.org/api/available_translations.json
 * Lista completa GetBible: https://api.getbible.net/v2/translations.json
 */

const HELLOAO_BASE = 'https://bible.helloao.org/api';
const GETBIBLE_BASE = 'https://api.getbible.net/v2';

export interface ApiBibleTranslation {
  id: string;
  name: string;
  language: 'pt' | 'en';
  source: 'helloao' | 'bible-api' | 'getbible';
}

export const AVAILABLE_TRANSLATIONS: ApiBibleTranslation[] = [
  // ── Padrão recomendado ───────────────────────────────────────────────────
  { id: 'arc',        name: '✓ Almeida Revista e Corrigida (ARC) — Padrão',  language: 'pt', source: 'bible-api' },


  // ── Português — api.getbible.net ────────────────────────────────────────
  { id: 'gb_almeida', name: 'Almeida Atualizada (AA)',              language: 'pt', source: 'getbible'  },
  { id: 'gb_livre',   name: 'Bíblia Livre (BL)',                    language: 'pt', source: 'getbible'  },
  { id: 'gb_livretr', name: 'Bíblia Livre — Textus Receptus (BLTR)',language: 'pt', source: 'getbible'  },

  // ── Português — bible.helloao.org ────────────────────────────────────────
  { id: 'por_blj',    name: 'Bíblia Livre JFA (BLJ)',               language: 'pt', source: 'helloao'   },
  { id: 'por_blt',    name: 'Bíblia Livre Para Todos (BLPT)',        language: 'pt', source: 'helloao'   },
  { id: 'por_bsl',    name: 'Bíblia Portuguesa Mundial (BSL)',       language: 'pt', source: 'helloao'   },
  { id: 'por_onbv',   name: 'Nova Bíblia Viva (NBV)',                language: 'pt', source: 'helloao'   },
  { id: 'por_tft',    name: 'Tradução para Tradutores (TFT)',        language: 'pt', source: 'helloao'   },

  // ── English — api.getbible.net ───────────────────────────────────────────
  { id: 'gb_kjv',     name: 'King James Version (KJV)',             language: 'en', source: 'getbible'  },
  { id: 'gb_asv',     name: 'American Standard Version (ASV)',      language: 'en', source: 'getbible'  },
  { id: 'gb_web',     name: 'World English Bible (WEB)',            language: 'en', source: 'getbible'  },
  { id: 'gb_darby',   name: 'Darby Translation (DBY)',              language: 'en', source: 'getbible'  },

  // ── English — bible.helloao.org ──────────────────────────────────────────
  { id: 'eng_kjv',    name: 'King James Version — HelloAO (KJV)',   language: 'en', source: 'helloao'   },
  { id: 'BSB',        name: 'Berean Standard Bible (BSB)',          language: 'en', source: 'helloao'   },
];

// ── Mapeamento de ID canônico (HelloAO / 3 letras) → número do livro (getbible.net) ──
const BOOK_NR: Record<string, number> = {
  GEN:1,EXO:2,LEV:3,NUM:4,DEU:5,JOS:6,JDG:7,RUT:8,'1SA':9,'2SA':10,
  '1KI':11,'2KI':12,'1CH':13,'2CH':14,EZR:15,NEH:16,EST:17,JOB:18,
  PSA:19,PRO:20,ECC:21,SNG:22,ISA:23,JER:24,LAM:25,EZK:26,DAN:27,
  HOS:28,JOL:29,AMO:30,OBA:31,JON:32,MIC:33,NAH:34,HAB:35,ZEP:36,
  HAG:37,ZEC:38,MAL:39,MAT:40,MRK:41,LUK:42,JHN:43,ACT:44,ROM:45,
  '1CO':46,'2CO':47,GAL:48,EPH:49,PHP:50,COL:51,'1TH':52,'2TH':53,
  '1TI':54,'2TI':55,TIT:56,PHM:57,HEB:58,JAS:59,'1PE':60,'2PE':61,
  '1JN':62,'2JN':63,'3JN':64,JUD:65,REV:66,
};

// Alias para IDs que podem vir em diferentes formatos
const BOOK_ALIAS: Record<string, string> = {
  '1SAM':'1SA','2SAM':'2SA','1KGS':'1KI','2KGS':'2KI',
  '1CHR':'1CH','2CHR':'2CH','SNG':'SNG','SONG':'SNG',
  'EZEK':'EZK','JOE':'JOL','OBD':'OBA','JONA':'JON',
  'NAHU':'NAH','ZEPH':'ZEP','HAGG':'HAG','ZECH':'ZEC',
  'MARK':'MRK','JOHN':'JHN','ACTS':'ACT',
  '1COR':'1CO','2COR':'2CO','PHIL':'PHP','PHILE':'PHM',
  'JAMES':'JAS','1PET':'1PE','2PET':'2PE',
  '1JOH':'1JN','2JOH':'2JN','3JOH':'3JN','JUDE':'JUD','REVE':'REV',
};

function resolveBookNr(bookId: string): number | null {
  const upper = bookId.toUpperCase();
  return BOOK_NR[upper] ?? BOOK_NR[BOOK_ALIAS[upper] ?? ''] ?? null;
}

// Mapeamento bible-api.com usa nomes em inglês abreviados (ex: "john", "1co")
const BIBLEAPI_ID: Record<string, string> = {
  GEN:'genesis',EXO:'exodus',LEV:'leviticus',NUM:'numbers',DEU:'deuteronomy',
  JOS:'joshua',JDG:'judges',RUT:'ruth','1SA':'1+samuel','2SA':'2+samuel',
  '1KI':'1+kings','2KI':'2+kings','1CH':'1+chronicles','2CH':'2+chronicles',
  EZR:'ezra',NEH:'nehemiah',EST:'esther',JOB:'job',PSA:'psalms',PRO:'proverbs',
  ECC:'ecclesiastes',SNG:'song+of+solomon',ISA:'isaiah',JER:'jeremiah',
  LAM:'lamentations',EZK:'ezekiel',DAN:'daniel',HOS:'hosea',JOL:'joel',
  AMO:'amos',OBA:'obadiah',JON:'jonah',MIC:'micah',NAH:'nahum',HAB:'habakkuk',
  ZEP:'zephaniah',HAG:'haggai',ZEC:'zechariah',MAL:'malachi',MAT:'matthew',
  MRK:'mark',LUK:'luke',JHN:'john',ACT:'acts',ROM:'romans',
  '1CO':'1+corinthians','2CO':'2+corinthians',GAL:'galatians',EPH:'ephesians',
  PHP:'philippians',COL:'colossians','1TH':'1+thessalonians','2TH':'2+thessalonians',
  '1TI':'1+timothy','2TI':'2+timothy',TIT:'titus',PHM:'philemon',HEB:'hebrews',
  JAS:'james','1PE':'1+peter','2PE':'2+peter','1JN':'1+john','2JN':'2+john',
  '3JN':'3+john',JUD:'jude',REV:'revelation',
};

function extractTextFromContent(content: any[]): string {
  return content.filter((c: any) => typeof c === 'string').join('').trim();
}

// ── Fonte: bible-api.com (ARC) ───────────────────────────────────────────────
async function fetchBibleApiCom(bookId: string, chapter: number): Promise<any[]> {
  const name = BIBLEAPI_ID[bookId.toUpperCase()] ?? bookId.toLowerCase();
  const res = await fetch(`https://bible-api.com/${name}+${chapter}?translation=almeida`);
  if (!res.ok) throw new Error(`bible-api.com: ${res.status}`);
  const data = await res.json();
  return data.verses.map((v: any) => ({
    type: 'verse', number: v.verse, content: [v.text.trim()],
  }));
}

// ── Fonte: api.getbible.net ──────────────────────────────────────────────────
async function fetchGetBible(abbr: string, bookId: string, chapter: number): Promise<any[]> {
  const bookNr = resolveBookNr(bookId);
  if (!bookNr) throw new Error(`Livro desconhecido: ${bookId}`);
  const res = await fetch(`${GETBIBLE_BASE}/${abbr}/${bookNr}/${chapter}.json`);
  if (!res.ok) throw new Error(`getbible.net: ${res.status}`);
  const data = await res.json();
  return (data.verses as any[]).map((v) => ({
    type: 'verse', number: v.verse, content: [v.text.trim()],
  }));
}

// ── Fonte: bible.helloao.org ─────────────────────────────────────────────────
async function fetchHelloAO(translationId: string, bookId: string, chapter: number): Promise<any[]> {
  const res = await fetch(`${HELLOAO_BASE}/${translationId}/${bookId}/${chapter}.json`);
  if (!res.ok) throw new Error(`HelloAO: ${res.status} para ${translationId}`);
  const data = await res.json();
  return data.chapter.content
    .filter((item: any) => item.type === 'verse')
    .map((item: any) => ({
      type: 'verse', number: item.number,
      content: [extractTextFromContent(item.content)],
    }));
}

/**
 * Busca um capítulo completo da tradução selecionada.
 * Roteamento automático por source da tradução.
 */
export async function getChapterFromApiBible(
  translationId: string,
  bookId: string,
  chapter: number
): Promise<any[]> {
  try {
    // bible-api.com
    if (translationId === 'arc') {
      return await fetchBibleApiCom(bookId, chapter);
    }

    // getbible.net — prefixo gb_
    if (translationId.startsWith('gb_')) {
      const abbr = translationId.slice(3); // remove "gb_"
      return await fetchGetBible(abbr, bookId, chapter);
    }

    // HelloAO — tudo o mais
    return await fetchHelloAO(translationId, bookId, chapter);

  } catch (e) {
    console.error(`[apiBible] Falha em "${translationId}" ${bookId} ${chapter}:`, e);
    return [{ type: 'verse', number: 1, content: ['Erro ao carregar tradução. Tente outra.'] }];
  }
}

/**
 * Busca o texto de um versículo específico numa tradução.
 */
export async function getVerseTranslation(
  translationId: string,
  bookId: string,
  chapter: number,
  verseNumber: number
): Promise<string> {
  try {
    const verses = await getChapterFromApiBible(translationId, bookId, chapter);
    const v = verses.find((x) => x.type === 'verse' && x.number === verseNumber);
    return v ? (v.content[0] ?? '') : '';
  } catch {
    return '';
  }
}
