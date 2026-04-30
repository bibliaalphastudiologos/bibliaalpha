import { lazy, Suspense, useState, useEffect } from 'react';
import { cn } from '../App';
import { X, ChevronLeft, ChevronRight, BookOpen, Heart } from 'lucide-react';
import { getWomenChapterNotesApi, WomenNote } from '../services/womenCommentariesApi';
import { hasWomenNotes } from '../data/womenCommentaries';

interface WomenVoicesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
}

const AUTHOR_COLORS: Record<string, string> = {
  "Catherine Booth":        "bg-rose-100 text-rose-700 border-rose-200",
  "Phoebe Palmer":          "bg-purple-100 text-purple-700 border-purple-200",
  "Frances Ridley Havergal":"bg-pink-100 text-pink-700 border-pink-200",
  "Jessie Penn-Lewis":      "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Hannah Whitall Smith":   "bg-amber-100 text-amber-700 border-amber-200",
  "Amy Carmichael":         "bg-teal-100 text-teal-700 border-teal-200",
};

function getAuthorColor(author: string): string {
  return AUTHOR_COLORS[author] || "bg-sleek-hover text-sleek-text-main border-sleek-border";
}

function NoteCard({ verse, note }: { verse: number; note: WomenNote }) {
  const [expanded, setExpanded] = useState(true);
  const colorClass = getAuthorColor(note.author);
  return (
    <div className="border border-sleek-border rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setExpanded(e => !e)}
        className={cn("w-full flex items-start gap-3 px-4 py-3 text-left transition-colors", expanded ? "bg-sleek-hover/40" : "hover:bg-sleek-hover/20")}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-sleek-accent">v. {verse}</span>
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", colorClass)}>
              {note.authorPt}
            </span>
          </div>
          {!expanded && (
            <p className="mt-1 text-[12px] text-sleek-text-muted truncate">{note.text.slice(0, 80)}…</p>
          )}
        </div>
        <span className="text-sleek-text-muted text-[11px] mt-0.5">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-4 pt-2 pb-4 bg-sleek-bg">
          <p className="text-[13px] sm:text-[14px] leading-relaxed text-sleek-text-main">{note.text}</p>
          <p className="mt-2 text-[10px] text-sleek-text-muted italic">— {note.authorPt}, <em>{note.source}</em></p>
        </div>
      )}
    </div>
  );
}

export default function WomenVoicesPanel({
  isOpen, onClose, bookId, bookName, chapter, totalChapters, onPrevChapter, onNextChapter
}: WomenVoicesPanelProps) {
  const [chapterNotes, setChapterNotes] = useState<Record<number, WomenNote[]>>({});
  const hasNotes = hasWomenNotes(bookId, chapter);

  useEffect(() => {
    if (!isOpen) return;
    setChapterNotes(getWomenChapterNotesApi(bookId, chapter));
  }, [isOpen, bookId, chapter]);

  const verseEntries = Object.entries(chapterNotes)
    .map(([v, notes]) => ({ verse: parseInt(v, 10), notes }))
    .sort((a, b) => a.verse - b.verse);

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex flex-col bg-sleek-sidebar-bg border-l border-sleek-border shadow-xl transition-all duration-300",
        isOpen ? "w-full sm:w-[420px] lg:w-[460px]" : "w-0 overflow-hidden"
      )}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-sleek-border shrink-0 bg-sleek-sidebar-bg">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Heart size={14} />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-sleek-text-main leading-tight">Vozes Femininas da Fé Cristã</h2>
                <p className="text-[10px] text-sleek-text-muted leading-tight">Comentários de mulheres teólogas</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors" aria-label="Fechar">
              <X size={16} />
            </button>
          </div>

          {/* Chapter nav */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-sleek-border/60 shrink-0 bg-sleek-hover/20">
            <button
              onClick={onPrevChapter}
              disabled={chapter <= 1}
              className="p-1.5 hover:bg-sleek-hover rounded-lg text-sleek-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[12px] font-semibold text-sleek-text-main">{bookName} {chapter}</span>
            <button
              onClick={onNextChapter}
              disabled={chapter >= totalChapters}
              className="p-1.5 hover:bg-sleek-hover rounded-lg text-sleek-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
            {verseEntries.length > 0 ? (
              <>
                <p className="text-[11px] text-sleek-text-muted mb-3 px-1">
                  {verseEntries.reduce((acc, e) => acc + e.notes.length, 0)} nota(s) para este capítulo
                </p>
                {verseEntries.map(({ verse, notes }) =>
                  notes.map((note, i) => (
                    <NoteCard key={`${verse}-${i}`} verse={verse} note={note} />
                  ))
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                  <BookOpen size={20} className="text-rose-300" />
                </div>
                <p className="text-[13px] font-medium text-sleek-text-main mb-1">Sem notas para este capítulo</p>
                <p className="text-[12px] text-sleek-text-muted max-w-[240px] leading-relaxed">
                  As notas das vozes femininas estão disponíveis para capítulos selecionados do Antigo e Novo Testamento.
                </p>
              </div>
            )}

            {/* Authors info */}
            <div className="mt-6 p-4 bg-sleek-hover/30 rounded-xl border border-sleek-border/60">
              <p className="text-[11px] font-bold text-sleek-text-muted uppercase tracking-wider mb-2">Autoras incluídas</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(AUTHOR_COLORS).map(([author, cls]) => (
                  <span key={author} className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", cls)}>
                    {author}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
