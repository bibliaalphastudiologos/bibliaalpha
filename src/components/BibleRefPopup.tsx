import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, ChevronDown, BookOpen, ExternalLink } from 'lucide-react';
import { getChapterFromApiBible } from '../services/apiBible';
import { cn } from '../App';

export interface BibleRefPopupState {
  bookId: string;
  chapter: number;
  verse: number;
  refText: string;
}

interface Props {
  popup: BibleRefPopupState | null;
  onClose: () => void;
  onNavigate: (bookId: string, chapter: number) => void;
}

export default function BibleRefPopup({ popup, onClose, onNavigate }: Props) {
  const [verses, setVerses]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos]             = useState({ x: 0, y: 0 }); // offset from default position
  const dragRef   = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const panelRef  = useRef<HTMLDivElement>(null);
  const verseRef  = useRef<HTMLDivElement>(null);

  // Fetch verses when popup changes
  useEffect(() => {
    if (!popup) return;
    setVerses([]);
    setLoading(true);
    setMinimized(false);
    setPos({ x: 0, y: 0 });
    getChapterFromApiBible('arc', popup.bookId, popup.chapter)
      .then(data => setVerses(data || []))
      .catch(() => setVerses([]))
      .finally(() => setLoading(false));
  }, [popup?.bookId, popup?.chapter, popup?.refText]);

  // Scroll to target verse after load
  useEffect(() => {
    if (!loading && verseRef.current) {
      setTimeout(() => verseRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
    }
  }, [loading]);

  // Dragging
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPos: { ...pos } };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.startPos.x + (ev.clientX - dragRef.current.startX),
        y: dragRef.current.startPos.y + (ev.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  }, [pos]);

  if (!popup) return null;

  // Find book name from verse data
  const bookName = verses[0]?.bookId ? popup.bookId : popup.refText.split(' ')[0];

  return (
    <div
      ref={panelRef}
      className="fixed z-[60] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-gray-200 bg-white"
      style={{
        bottom: `${24 - pos.y}px`,
        right:  `${24 - pos.x}px`,
        width:  '380px',
        maxHeight: minimized ? 'auto' : '65vh',
        minHeight: minimized ? 'auto' : '200px',
        userSelect: dragRef.current ? 'none' : 'auto',
      }}
    >
      {/* ── Header (drag handle) ──────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
      >
        <BookOpen size={14} className="text-white/80 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-white font-semibold text-sm truncate block">
            {popup.refText}
          </span>
          {!minimized && (
            <span className="text-white/60 text-[10px]">ARC · Clique na referência para navegar</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Navigate away button */}
          <button
            onClick={() => { onNavigate(popup.bookId, popup.chapter); onClose(); }}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Abrir no texto principal"
          >
            <ExternalLink size={11} />
          </button>
          {/* Minimize */}
          <button
            onClick={() => setMinimized(m => !m)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title={minimized ? 'Expandir' : 'Minimizar'}
          >
            {minimized ? <ChevronDown size={12} /> : <Minus size={12} />}
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Fechar"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {!minimized && (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 text-sm leading-relaxed">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2">
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-xs">Carregando…</span>
            </div>
          )}

          {!loading && verses.length === 0 && (
            <p className="text-center text-gray-400 text-xs py-6 italic">
              Passagem não encontrada.
            </p>
          )}

          {!loading && verses.length > 0 && (
            <div className="space-y-1">
              {verses.map((v: any) => {
                const vNum = v.number ?? v.verseNumber ?? v.verse ?? v.num;
                const vText = v.text ?? v.content ?? v.value ?? '';
                const isTarget = vNum === popup.verse;
                return (
                  <div
                    key={vNum}
                    ref={isTarget ? verseRef : undefined}
                    className={cn(
                      'flex gap-2 px-2 py-1.5 rounded-lg transition-colors',
                      isTarget
                        ? 'bg-yellow-50 border border-yellow-200 shadow-sm'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <span className={cn(
                      'text-[11px] font-bold flex-shrink-0 w-5 text-right mt-0.5',
                      isTarget ? 'text-yellow-600' : 'text-gray-300'
                    )}>
                      {vNum}
                    </span>
                    <span className={cn(
                      'flex-1',
                      isTarget ? 'text-gray-900 font-medium' : 'text-gray-600'
                    )}>
                      {vText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      {!minimized && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {popup.bookId} {popup.chapter} — Almeida Revista e Corrigida
          </span>
          <button
            onClick={() => { onNavigate(popup.bookId, popup.chapter); onClose(); }}
            className="text-[10px] text-sky-600 hover:text-sky-800 font-medium underline underline-offset-2"
          >
            Ir para o texto
          </button>
        </div>
      )}
    </div>
  );
}
