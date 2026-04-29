import { useState, useEffect } from 'react';
import { BookMarked, ChevronDown, ChevronUp, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../App';
import { getScofieldNotes, ScofieldNote } from '../services/scofieldApi';
import { ReferenceText } from '../utils/bibleRefParser';



interface NoteItemProps {
  note: ScofieldNote;
  index: number;
  onNavigate?: (bookId: string, chapter: number) => void;
  onPopup?: (bookId: string, chapter: number, verse: number, refText: string) => void;
}

function NoteItem({ note, index, onNavigate, onPopup }: NoteItemProps) {
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
            <ReferenceText text={note.textPt} onPopup={onPopup} />
          </p>
          {note.text && note.text !== note.textPt && (
            <details className="group">
              <summary className="text-[10px] text-indigo-400 cursor-pointer select-none list-none flex items-center gap-1 hover:text-indigo-600">
                <span className="group-open:hidden">▶ ver original em inglês</span>
                <span className="hidden group-open:inline">▼ original em inglês</span>
              </summary>
              <p className="mt-2 text-[11px] italic leading-relaxed text-sleek-text-muted border-l-2 border-indigo-100 pl-3">
                <ReferenceText text={note.text} onPopup={onPopup} />
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

interface ScofieldInlineNotesProps {
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  onNavigate?: (bookId: string, chapter: number) => void;
}

export default function ScofieldInlineNotes({
  bookId, bookName, chapter, totalChapters, onPrevChapter, onNextChapter, onNavigate, onPopup,
}: ScofieldInlineNotesProps) {
  const [notes, setNotes] = useState<ScofieldNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    setNotes([]);
    let alive = true;
    setLoading(true);
    getScofieldNotes(bookId, chapter)
      .then(data => { if (alive) setNotes(data.notes); })
      .catch(err => { console.error('[ScofieldInline]', err); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [bookId, chapter]);

  if (!loading && notes.length === 0) return null;

  return (
    <div className="mt-10 mb-4 font-sans">
      <div
        className={cn(
          "border border-indigo-200 rounded-2xl overflow-hidden shadow-sm transition-all",
          expanded ? "border-indigo-300" : ""
        )}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors",
            expanded ? "bg-indigo-50 border-b border-indigo-200" : "bg-sleek-surface hover:bg-indigo-50/60"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <BookMarked size={14} className="text-indigo-600" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-sleek-text-main leading-none">
                Notas de Estudo · Scofield
              </div>
              <div className="text-[10px] text-sleek-text-muted mt-0.5 leading-none">
                Bíblia de Referência Scofield, 1917
                {!loading && notes.length > 0 && (
                  <span className="ml-1.5 text-indigo-400 font-medium">
                    · {notes.length} nota{notes.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 size={14} className="text-indigo-400 animate-spin" />}
            {expanded
              ? <ChevronUp size={14} className="text-indigo-400" />
              : <ChevronDown size={14} className="text-sleek-text-muted" />}
          </div>
        </button>

        {expanded && (
          <div className="bg-sleek-bg">
            <div className="flex items-center justify-between px-5 py-2 border-b border-sleek-border/60 bg-sleek-sidebar-bg">
              <button
                onClick={onPrevChapter}
                disabled={chapter <= 1}
                className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-sleek-hover transition-colors"
              >
                <ChevronLeft size={13} /> Anterior
              </button>
              <span className="text-[12px] font-semibold text-sleek-text-main">
                {bookName} {chapter}
                <span className="text-sleek-text-muted font-normal text-[11px] ml-1">/ {totalChapters}</span>
              </span>
              <button
                onClick={onNextChapter}
                disabled={chapter >= totalChapters}
                className="flex items-center gap-1 text-[12px] text-sleek-text-muted hover:text-sleek-text-main disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-sleek-hover transition-colors"
              >
                Próximo <ChevronRight size={13} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 size={20} className="text-indigo-400 animate-spin" />
                  <p className="text-[12px] text-sleek-text-muted">Carregando e traduzindo notas Scofield…</p>
                </div>
              ) : notes.length > 0 ? (
                notes.map((note, i) => (
                  <NoteItem key={i} note={note} index={i} onPopup={onPopup} />
                ))
              ) : (
                <div className="py-6 text-center text-[13px] text-sleek-text-muted italic">
                  Sem notas Scofield para {bookName} {chapter}.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
