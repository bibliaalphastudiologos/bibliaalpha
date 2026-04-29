import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, ChevronDown, BookOpen, ExternalLink, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { getChapterFromApiBible } from '../services/apiBible';
import { cn } from '../App';

export interface BibleRefPopupState {
  bookId: string;
  chapter: number;
  verse: number;
  refText: string;
  anchorX?: number;
  anchorY?: number;
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
  const [copied, setCopied]       = useState(false);
  const [pos, setPos]             = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef   = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const panelRef  = useRef<HTMLDivElement>(null);
  const verseRef  = useRef<HTMLDivElement>(null);

  // Reset position and fetch when popup changes
  useEffect(() => {
    if (!popup) return;
    setVerses([]);
    setLoading(true);
    setMinimized(false);
    // Position near anchor point if provided, otherwise bottom-right
    if (popup.anchorX !== undefined && popup.anchorY !== undefined) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Calculate offset from bottom-right corner
      const panelW = 400;
      const panelH = 460;
      let x = vw - popup.anchorX - panelW / 2;
      let y = vh - popup.anchorY - panelH / 2;
      // Clamp to viewport
      x = Math.max(8, Math.min(x, vw - panelW - 8));
      y = Math.max(8, Math.min(y, vh - panelH - 8));
      // Convert to offset from bottom-right (since we use bottom/right positioning)
      setPos({ x: -(vw - popup.anchorX - panelW / 2 - 24), y: -(vh - popup.anchorY - panelH / 2 - 24) });
    } else {
      setPos({ x: 0, y: 0 });
    }
    getChapterFromApiBible('arc', popup.bookId, popup.chapter)
      .then(data => setVerses(data || []))
      .catch(() => setVerses([]))
      .finally(() => setLoading(false));
  }, [popup?.bookId, popup?.chapter, popup?.refText]);

  // Scroll to target verse after load
  useEffect(() => {
    if (!loading && verseRef.current) {
      setTimeout(() => verseRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
    }
  }, [loading]);

  // Drag handlers — use state for isDragging so cursor style updates correctly
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPos: { ...pos } };
    setIsDragging(true);
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.startPos.x + (ev.clientX - dragRef.current.startX),
        y: dragRef.current.startPos.y + (ev.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  }, [pos]);

  // Touch drag support
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const t = e.touches[0];
    dragRef.current = { startX: t.clientX, startY: t.clientY, startPos: { ...pos } };
    const onMove = (ev: TouchEvent) => {
      if (!dragRef.current) return;
      const touch = ev.touches[0];
      setPos({
        x: dragRef.current.startPos.x + (touch.clientX - dragRef.current.startX),
        y: dragRef.current.startPos.y + (touch.clientY - dragRef.current.startY),
      });
      ev.preventDefault();
    };
    const onEnd = () => {
      dragRef.current = null;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }, [pos]);

  // Copy verse to clipboard
  const copyVerse = useCallback(() => {
    if (!popup || verses.length === 0) return;
    const target = verses.find((v: any) => {
      const vNum = v.number ?? v.verseNumber ?? v.verse ?? v.num;
      return vNum === popup.verse;
    });
    if (target) {
      const text = `${popup.refText} — ${target.text ?? target.content ?? ''}`;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [popup, verses]);

  if (!popup) return null;

  const clampedRight = Math.max(8, 24 - pos.x);
  const clampedBottom = Math.max(8, 24 - pos.y);

  return (
    <div
      ref={panelRef}
      className="fixed z-[60] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-gray-200"
      style={{
        bottom: `${clampedBottom}px`,
        right: `${clampedRight}px`,
        width: '400px',
        maxHeight: minimized ? 'auto' : '65vh',
        minHeight: minimized ? 'auto' : '200px',
        userSelect: isDragging ? 'none' : 'auto',
        background: 'linear-gradient(to bottom, #ffffff, #f8faff)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(56,116,220,0.12)',
      }}
    >
      {/* ── Header (drag handle) ──────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center gap-2 px-3.5 py-2.5 select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6, #6366f1)' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <BookOpen size={14} className="text-white/80 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-white font-bold text-[13px] truncate block drop-shadow-sm">
            {popup.refText}
          </span>
          {!minimized && (
            <span className="text-white/60 text-[10px]">ARC · Arraste para mover · Clique para navegar</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Copy verse */}
          <button
            onClick={copyVerse}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Copiar versículo"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          {/* Navigate */}
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
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-400/70 text-white transition-colors"
            title="Fechar (Esc)"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {!minimized && (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 text-sm leading-relaxed">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-xs">Carregando passagem…</span>
            </div>
          )}

          {!loading && verses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-xs italic">Passagem não encontrada.</p>
            </div>
          )}

          {!loading && verses.length > 0 && (
            <div className="space-y-0.5">
              {verses.map((v: any) => {
                const vNum = v.number ?? v.verseNumber ?? v.verse ?? v.num;
                const vText = v.text ?? v.content ?? v.value ?? '';
                const isTarget = vNum === popup.verse;
                return (
                  <div
                    key={vNum}
                    ref={isTarget ? verseRef : undefined}
                    className={cn(
                      'flex gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-150',
                      isTarget
                        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-sm my-1'
                        : 'hover:bg-blue-50/60'
                    )}
                  >
                    <span className={cn(
                      'text-[11px] font-bold flex-shrink-0 w-5 text-right mt-0.5 leading-5',
                      isTarget ? 'text-amber-600' : 'text-gray-300'
                    )}>
                      {vNum}
                    </span>
                    <span className={cn(
                      'flex-1 text-[13px]',
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
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {popup.bookId} {popup.chapter} · Almeida Revista e Corrigida
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onNavigate(popup.bookId, popup.chapter); onClose(); }}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline underline-offset-2 transition-colors"
            >
              Ir para o capítulo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
