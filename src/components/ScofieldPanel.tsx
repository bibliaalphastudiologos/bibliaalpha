import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../App';
import { getScofieldNotes, ScofieldNote } from '../services/scofieldApi';

// ── Bible reference parser ────────────────────────────────────────────────────

const BOOK_NAME_MAP: Record<string, string> = {
  // English full names
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
  // Portuguese (Google Translate output)
  'Gênesis':'GEN','Êxodo':'EXO','Levítico':'LEV','Números':'NUM','Deuteronômio':'DEU',
  'Josué':'JOS','Juízes':'JDG','Rute':'RUT','1 Samuel':'1SA','2 Samuel':'2SA',
  '1 Reis':'1KI','2 Reis':'2KI','1 Crônicas':'1CH','2 Crônicas':'2CH',
  'Esdras':'EZR','Neemias':'NEH','Ester':'EST','Jó':'JOB','Salmos':'PSA','Salmo':'PSA',
  'Provérbios':'PRO','Eclesiastes':'ECC','Cântico dos Cânticos':'SNG','Isaías':'ISA',
  'Jeremias':'JER','Lamentações':'LAM','Ezequiel':'EZK','Daniel':'DAN','Oseias':'HOS',
  'Joel':'JOL','Amós':'AMO','Obadias':'OBA','Jonas':'JON','Miquéias':'MIC',
  'Naum':'NAH','Habacuque':'HAB','Sofonias':'ZEP','Ageu':'HAG','Zacarias':'ZEC','Malaquias':'MAL',
  'Mateus':'MAT','Marcos':'MRK','Lucas':'LUK','João':'JHN','Atos':'ACT','Romanos':'ROM',
  '1 Coríntios':'1CO','2 Coríntios':'2CO','Gálatas':'GAL','Efésios':'EPH',
  'Filipenses':'PHP','Colossenses':'COL','1 Tessalonicenses':'1TH','2 Tessalonicenses':'2TH',
  '1 Timóteo':'1TI','2 Timóteo':'2TI','Tito':'TIT','Filemom':'PHM','Hebreus':'HEB',
  'Tiago':'JAS','1 Pedro':'1PE','2 Pedro':'2PE','1 João':'1JN','2 João':'2JN',
  '3 João':'3JN','Judas':'JUD','Apocalipse':'REV',
};

// Sorted by length descending to match longer names first (e.g. "Song of Solomon" before "Song")
const BOOK_NAMES_SORTED = Object.keys(BOOK_NAME_MAP).sort((a, b) => b.length - a.length);
const BOOK_NAMES_PATTERN = BOOK_NAMES_SORTED.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const REF_REGEX = new RegExp(`(${BOOK_NAMES_PATTERN})\\s+(\\d+):(\\d+)`, 'g');

type TextSegment = { text: string; ref?: { bookId: string; chapter: number; verse: number } };

function parseReferences(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  REF_REGEX.lastIndex = 0;

  while ((match = REF_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }
    const bookId = BOOK_NAME_MAP[match[1]];
    const chapter = parseInt(match[2], 10);
    const verse   = parseInt(match[3], 10);
    if (bookId) {
      segments.push({ text: match[0], ref: { bookId, chapter, verse } });
    } else {
      segments.push({ text: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }
  return segments;
}

// ── NoteCard ──────────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: ScofieldNote;
  index: number;
  onNavigate?: (bookId: string, chapter: number) => void;
}

function ReferenceText({ text, onNavigate }: { text: string; onNavigate?: (bookId: string, chapter: number) => void }) {
  const segments = parseReferences(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.ref ? (
          <button
            key={i}
            onClick={() => onNavigate?.(seg.ref!.bookId, seg.ref!.chapter)}
            className="inline text-indigo-600 hover:text-indigo-800 underline underline-offset-2 decoration-dotted font-medium transition-colors cursor-pointer"
            title={`Ir para ${seg.text}`}
          >
            {seg.text}
          </button>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

function NoteCard({ note, index, onNavigate }: NoteCardProps) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="border border-sleek-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
          expanded ? "bg-indigo-50 border-b border-indigo-100" : "hover:bg-sleek-hover"
        )}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <BookMarked size={13} className={cn("mt-0.5 shrink-0", expanded ? "text-indigo-500" : "text-sleek-text-muted")} />
          <div className="min-w-0">
            {note.keywordPt ? (
              <span className={cn("text-[13px] font-semibold leading-snug", expanded ? "text-indigo-700" : "text-sleek-text-main")}>
                {note.keywordPt}
              </span>
            ) : null}
            {note.keyword && note.keyword !== note.keywordPt && (
              <span className="text-[10px] text-sleek-text-muted ml-2 italic">({note.keyword})</span>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronUp size={13} className="text-indigo-400 shrink-0" />
          : <ChevronDown size={13} className="text-sleek-text-muted shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 py-4 bg-white space-y-3">
          <p className="text-[13px] sm:text-[14px] leading-relaxed text-sleek-text-main">
            <ReferenceText text={note.textPt} onNavigate={onNavigate} />
          </p>
          {note.text && note.text !== note.textPt && (
            <details className="group">
              <summary className="text-[10px] text-indigo-400 cursor-pointer select-none list-none flex items-center gap-1 hover:text-indigo-600">
                <span className="group-open:hidden">▶ ver original em inglês</span>
                <span className="hidden group-open:inline">▼ original em inglês</span>
              </summary>
              <p className="mt-2 text-[11px] italic leading-relaxed text-sleek-text-muted border-l-2 border-indigo-100 pl-3">
                <ReferenceText text={note.text} onNavigate={onNavigate} />
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

interface ScofieldPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onNavigate?: (bookId: string, chapter: number) => void;
}

export default function ScofieldPanel({
  isOpen, onClose, bookId, bookName, chapter, totalChapters,
  onPrevChapter, onNextChapter, onNavigate,
}: ScofieldPanelProps) {
  const [notes, setNotes] = useState<ScofieldNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    setNotes([]); setError(null);
    let alive = true;
    setLoading(true);
    getScofieldNotes(bookId, chapter)
      .then(data => { if (alive) setNotes(data.notes); })
      .catch(err => { if (alive) setError('Não foi possível carregar as notas.'); console.error('[Scofield]', err); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [bookId, chapter]);

  const handleNavigate = useCallback((targetBookId: string, targetChapter: number) => {
    onNavigate?.(targetBookId, targetChapter);
    onClose();
  }, [onNavigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sleek-bg">
      {/* ── Header ── */}
      <header className="h-12 flex items-center justify-between px-4 sm:px-8 border-b border-sleek-border bg-sleek-bg shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <BookMarked size={15} className="text-indigo-500 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-[13px] sm:text-[14px] font-semibold text-sleek-text-main leading-none">Notas Scofield</h1>
            <p className="text-[10px] text-sleek-text-muted mt-0.5 leading-none truncate">
              Bíblia de Referência Scofield, 1917 · referências clicáveis
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors" aria-label="Fechar">
          <X size={16} />
        </button>
      </header>

      {/* ── Chapter nav ── */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-2 border-b border-sleek-border/60 bg-sleek-sidebar-bg shrink-0">
        <button onClick={onPrevChapter} disabled={chapter <= 1}
          className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-sleek-hover transition-colors">
          <ChevronLeft size={14} /> Anterior
        </button>
        <span className="text-[13px] font-semibold text-sleek-text-main">
          {bookName} {chapter}
          <span className="text-sleek-text-muted font-normal text-[11px] ml-1">/ {totalChapters}</span>
        </span>
        <button onClick={onNextChapter} disabled={chapter >= totalChapters}
          className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-sleek-hover transition-colors">
          Próximo <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <Loader2 size={22} className="text-indigo-400 animate-spin" />
              <p className="text-[12px] text-sleek-text-muted">Carregando e traduzindo notas Scofield…</p>
            </div>
          )}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
              <BookMarked size={28} className="text-sleek-text-muted opacity-30" />
              <p className="text-[13px] text-sleek-text-muted">{error}</p>
            </div>
          )}
          {!loading && !error && notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
              <BookMarked size={28} className="text-sleek-text-muted opacity-30" />
              <p className="text-[13px] text-sleek-text-muted">Sem notas Scofield para {bookName} {chapter}.</p>
              <p className="text-[11px] text-sleek-text-muted opacity-60">Tente outro capítulo ou livro.</p>
            </div>
          )}
          {!loading && !error && notes.length > 0 && (
            <>
              <div className="mb-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sleek-text-muted">
                  {notes.length} nota{notes.length !== 1 ? 's' : ''} · {bookName} {chapter}
                </span>
              </div>
              <div className="space-y-3">
                {notes.map((note, i) => (
                  <NoteCard key={i} note={note} index={i} onNavigate={handleNavigate} />
                ))}
              </div>
            </>
          )}
          <div className="h-16" />
        </div>
      </div>
    </div>
  );
}
