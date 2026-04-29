import React from 'react';

// ── Complete Bible book name map (EN + PT) ─────────────────────────────────
export const BOOK_NAME_MAP: Record<string, string> = {
  'Genesis':'GEN','Exodus':'EXO','Leviticus':'LEV','Numbers':'NUM','Deuteronomy':'DEU',
  'Joshua':'JOS','Judges':'JDG','Ruth':'RUT','1 Samuel':'1SA','2 Samuel':'2SA',
  '1 Kings':'1KI','2 Kings':'2KI','1 Chronicles':'1CH','2 Chronicles':'2CH',
  'Ezra':'EZR','Nehemiah':'NEH','Esther':'EST','Job':'JOB','Psalms':'PSA','Psalm':'PSA',
  'Proverbs':'PRO','Ecclesiastes':'ECC','Song of Solomon':'SNG','Song of Songs':'SNG',
  'Isaiah':'ISA','Jeremiah':'JER','Lamentations':'LAM','Ezekiel':'EZK','Daniel':'DAN',
  'Hosea':'HOS','Joel':'JOL','Amos':'AMO','Obadiah':'OBA','Jonah':'JON','Micah':'MIC',
  'Nahum':'NAH','Habakkuk':'HAB','Zephaniah':'ZEP','Haggai':'HAG','Zechariah':'ZEC','Malachi':'MAL',
  'Matthew':'MAT','Mark':'MRK','Luke':'LUK','John':'JHN','Acts':'ACT','Romans':'ROM',
  '1 Corinthians':'1CO','2 Corinthians':'2CO','Galatians':'GAL','Ephesians':'EPH',
  'Philippians':'PHP','Colossians':'COL','1 Thessalonians':'1TH','2 Thessalonians':'2TH',
  '1 Timothy':'1TI','2 Timothy':'2TI','Titus':'TIT','Philemon':'PHM','Hebrews':'HEB',
  'James':'JAS','1 Peter':'1PE','2 Peter':'2PE','1 John':'1JN','2 John':'2JN',
  '3 John':'3JN','Jude':'JUD','Revelation':'REV',
  'Gênesis':'GEN','Êxodo':'EXO','Levítico':'LEV','Números':'NUM','Deuteronômio':'DEU',
  'Josué':'JOS','Juízes':'JDG','Rute':'RUT',
  '1 Reis':'1KI','2 Reis':'2KI','1 Crônicas':'1CH','2 Crônicas':'2CH',
  'Esdras':'EZR','Neemias':'NEH','Ester':'EST','Jó':'JOB','Salmos':'PSA','Salmo':'PSA',
  'Provérbios':'PRO','Eclesiastes':'ECC','Cântico dos Cânticos':'SNG',
  'Isaías':'ISA','Jeremias':'JER','Lamentações':'LAM','Ezequiel':'EZK','Oseias':'HOS',
  'Joel':'JOL','Amós':'AMO','Obadias':'OBA','Jonas':'JON','Miquéias':'MIC',
  'Naum':'NAH','Habacuque':'HAB','Sofonias':'ZEP','Ageu':'HAG','Zacarias':'ZEC','Malaquias':'MAL',
  'Mateus':'MAT','Marcos':'MRK','Lucas':'LUK','João':'JHN','Atos':'ACT','Romanos':'ROM',
  '1 Coríntios':'1CO','2 Coríntios':'2CO','Gálatas':'GAL','Efésios':'EPH',
  'Filipenses':'PHP','Colossenses':'COL','1 Tessalonicenses':'1TH','2 Tessalonicenses':'2TH',
  '1 Timóteo':'1TI','2 Timóteo':'2TI','Tito':'TIT','Filemom':'PHM','Hebreus':'HEB',
  'Tiago':'JAS','1 Pedro':'1PE','2 Pedro':'2PE','1 João':'1JN','2 João':'2JN',
  '3 João':'3JN','Judas':'JUD','Apocalipse':'REV',
};

const _sorted = Object.keys(BOOK_NAME_MAP).sort((a, b) => b.length - a.length);
const _pattern = _sorted.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

export type TextSegment = {
  text: string;
  ref?: { bookId: string; chapter: number; verseStart: number };
};

export function parseReferences(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(`(${_pattern})\\s+(\\d+):(\\d+)(?:[–-]\\d+)?`, 'g');
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) segments.push({ text: text.slice(lastIndex, match.index) });
    const bookId = BOOK_NAME_MAP[match[1]];
    const chapter = parseInt(match[2], 10);
    const verseStart = parseInt(match[3], 10);
    if (bookId) {
      segments.push({ text: match[0], ref: { bookId, chapter, verseStart } });
    } else {
      segments.push({ text: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex) });
  return segments;
}

export interface ReferenceTextProps {
  text: string;
  onNavigate?: (bookId: string, chapter: number) => void;
  className?: string;
}

export function ReferenceText({ text, onNavigate, className }: ReferenceTextProps) {
  const segments = parseReferences(text);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.ref ? (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate?.(seg.ref!.bookId, seg.ref!.chapter); }}
            className="inline text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-dotted font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm"
            title={`Navegar para ${seg.text}`}
          >
            {seg.text}
          </button>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  );
}
