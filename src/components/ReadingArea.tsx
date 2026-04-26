import { cn } from '../App';
import * as React from 'react';
import { Palette, Share2, MoreHorizontal, Book as BookIcon, Globe, ChevronDown, MessageSquareText, ChevronLeft, ChevronRight, Menu, Highlighter, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import InlineComments from './InlineComments';
import ConnectionsDropdown from './ConnectionsDropdown';
import { AVAILABLE_TRANSLATIONS } from '../services/apiBible';
import { getChapterCommentMap } from '../services/bibleApi';
import { useAuth } from './AuthProvider';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ReadingAreaProps {
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters?: number;
  content: any[];
  activeTranslation: string;
  onTranslationChange: (id: string) => void;
  onOpenBookList?: () => void;
  onNotepadOpen?: () => void;
  onPlansOpen?: () => void;
  onResearchOpen?: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  onSelectChapter?: (c: number) => void;
  onToggleSidebar?: () => void;
  bookIndex?: number;
}

// ── Highlight color definitions ────────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { key: 'yellow',    label: 'Amarelo',  cls: 'text-highlight-yellow',    dot: '#FACC15' },
  { key: 'green',     label: 'Verde',    cls: 'text-highlight-green',     dot: '#4ADE80' },
  { key: 'blue',      label: 'Azul',     cls: 'text-highlight-blue',      dot: '#60A5FA' },
  { key: 'pink',      label: 'Rosa',     cls: 'text-highlight-pink',      dot: '#F472B6' },
  { key: 'orange',    label: 'Laranja',  cls: 'text-highlight-orange',    dot: '#FB923C' },
  { key: 'underline', label: 'Sublinha', cls: 'text-highlight-underline', dot: null },
] as const;

type HighlightKey = typeof HIGHLIGHT_COLORS[number]['key'];

interface VerseHighlight {
  id: string;
  verseNumber: number;
  start: number;
  end: number;
  colorKey: HighlightKey;
}

interface ToolbarState {
  visible: boolean;
  x: number;
  y: number;
  verseNumber: number | null;
  startOffset: number;
  endOffset: number;
  highlightId?: string;
}

// ── Utility: character offset within a container ───────────────────────────────
function getTextOffset(container: Element, targetNode: Node, offsetInNode: number): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let total = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node === targetNode) return total + offsetInNode;
    total += node.length;
  }
  return total;
}

// ── Render verse content with range-based highlights ──────────────────────────
interface TextChar { char: string; isJesus: boolean; }

function flattenContent(content: any[]): TextChar[] {
  const chars: TextChar[] = [];
  for (const seg of content) {
    const text = typeof seg === 'string' ? seg : (seg?.text || seg?.content || '');
    const isJesus = !!(seg?.type === 'jesus_words' || seg?.jesusWords);
    for (const ch of text) chars.push({ char: ch, isJesus });
  }
  return chars;
}

function renderVerseContent(
  content: any[],
  verseHighlights: VerseHighlight[],
  verseNumber: number
): React.ReactNode {
  const chars = flattenContent(content);
  if (chars.length === 0) return null;

  const hlMap: (VerseHighlight | null)[] = new Array(chars.length).fill(null);
  const sorted = [...verseHighlights].sort((a, b) => a.start - b.start);
  for (const hl of sorted) {
    const end = Math.min(hl.end, chars.length);
    for (let i = Math.max(0, hl.start); i < end; i++) hlMap[i] = hl;
  }

  const groups: { text: string; isJesus: boolean; hl: VerseHighlight | null }[] = [];
  for (let i = 0; i < chars.length; i++) {
    const last = groups[groups.length - 1];
    if (last && last.isJesus === chars[i].isJesus && last.hl === hlMap[i]) {
      last.text += chars[i].char;
    } else {
      groups.push({ text: chars[i].char, isJesus: chars[i].isJesus, hl: hlMap[i] });
    }
  }

  return (
    <span data-verse-content={verseNumber}>
      {groups.map((g, idx) => {
        const hlColor = HIGHLIGHT_COLORS.find(c => c.key === g.hl?.colorKey);
        return (
          <span
            key={idx}
            className={cn(
              g.isJesus ? 'text-sleek-accent' : '',
              g.hl ? (hlColor?.cls ?? '') : ''
            )}
            data-highlight-id={g.hl?.id}
          >
            {g.text}
          </span>
        );
      })}
    </span>
  );
}

export default function ReadingArea({ bookId, bookName, chapter, totalChapters = 1, content, activeTranslation, onTranslationChange, onOpenBookList, onNotepadOpen, onPlansOpen, onResearchOpen, onPrevChapter, onNextChapter, onSelectChapter, onToggleSidebar, bookIndex = -1 }: ReadingAreaProps) {

  const { user } = useAuth();
  const highlightKey = `hl2_${bookId}_${chapter}`;
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [expandedVerses, setExpandedVerses] = useState<Set<number>>(new Set());
  const [versesWithComments, setVersesWithComments] = useState<Set<number>>(new Set());
  const [toolbar, setToolbar] = useState<ToolbarState>({
    visible: false, x: 0, y: 0, verseNumber: null, startOffset: 0, endOffset: 0, highlightId: undefined,
  });
  const readingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHighlights() {
      // Tenta carregar do Firestore se usuário autenticado
      if (user?.uid) {
        try {
          const ref = doc(db, 'users', user.uid, 'highlights', `${bookId}_${chapter}`);
          const snap = await getDoc(ref);
          if (!isMounted) return;
          if (snap.exists()) {
            const data = snap.data();
            setHighlights(data.highlights || []);
            localStorage.setItem(highlightKey, JSON.stringify(data.highlights || []));
            return;
          }
        } catch (e) {
          console.warn('[Highlights] Falha ao ler Firestore, usando cache local:', e);
        }
      }
      // Fallback: localStorage
      try {
        setHighlights(JSON.parse(localStorage.getItem(highlightKey) || '[]'));
      } catch { setHighlights([]); }
    }
    loadHighlights();
    setExpandedVerses(new Set());
    if (bookId && chapter) {
      getChapterCommentMap(bookId, chapter).then((map) => {
        if (isMounted) setVersesWithComments(map);
      });
    }
    return () => { isMounted = false; };
  }, [highlightKey, bookId, chapter, user]);

  // Keyboard navigation: ArrowLeft/ArrowRight for prev/next chapter
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); onPrevChapter?.(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNextChapter?.(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPrevChapter, onNextChapter]);

  // ── Selection → toolbar ──────────────────────────────────────────────────
  const handleHighlightClick = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const highlightId = target.getAttribute('data-highlight-id');
    if (!highlightId) return;
    const verseContentEl = target.closest('[data-verse-content]');
    if (!verseContentEl) return;
    const verseNumber = parseInt(verseContentEl.getAttribute('data-verse-content') || '0', 10);
    const rect = target.getBoundingClientRect();
    setToolbar({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      verseNumber,
      startOffset: -1,
      endOffset: -1,
      highlightId,
    });
    e.preventDefault();
    e.stopPropagation();
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setToolbar(t => ({ ...t, visible: false }));
      return;
    }
    const range = sel.getRangeAt(0);
    if (!readingRef.current?.contains(range.commonAncestorContainer)) {
      setToolbar(t => ({ ...t, visible: false }));
      return;
    }

    const startNode = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer as Element
      : range.startContainer.parentElement;
    const verseContentEl = startNode?.closest('[data-verse-content]');
    if (!verseContentEl) { setToolbar(t => ({ ...t, visible: false })); return; }

    const verseNumber = parseInt(verseContentEl.getAttribute('data-verse-content') || '0', 10);

    // Clamp end container to same verse-content element
    const endNode = range.endContainer.nodeType === Node.ELEMENT_NODE
      ? range.endContainer as Element
      : range.endContainer.parentElement;
    const endVerseEl = endNode?.closest('[data-verse-content]');
    const sameVerse = endVerseEl === verseContentEl;

    const startOffset = getTextOffset(verseContentEl, range.startContainer, range.startOffset);
    const endOffset = sameVerse
      ? getTextOffset(verseContentEl, range.endContainer, range.endOffset)
      : (verseContentEl.textContent || '').length;

    if (endOffset <= startOffset) { setToolbar(t => ({ ...t, visible: false })); return; }

    const rect = range.getBoundingClientRect();
    setToolbar({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      verseNumber,
      startOffset,
      endOffset,
    });
  }, []);

  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.getAttribute('data-highlight-id')) {
        handleHighlightClick(e);
        return;
      }
      setTimeout(handleSelectionChange, 10);
    };
    const onTouchEnd = () => setTimeout(handleSelectionChange, 50);
    document.addEventListener('mouseup',   onMouseUp);
    document.addEventListener('touchend',  onTouchEnd);
    return () => {
      document.removeEventListener('mouseup',   onMouseUp);
      document.removeEventListener('touchend',  onTouchEnd);
    };
  }, [handleSelectionChange, handleHighlightClick]);

  const saveHighlights = (list: VerseHighlight[]) => {
    setHighlights(list);
    localStorage.setItem(highlightKey, JSON.stringify(list));
    // Persiste no Firestore de forma assíncrona (não bloqueia UI)
    if (user?.uid) {
      const ref = doc(db, 'users', user.uid, 'highlights', `${bookId}_${chapter}`);
      setDoc(ref, { highlights: list, updatedAt: new Date().toISOString() }, { merge: true })
        .catch(e => console.warn('[Highlights] Erro ao salvar no Firestore:', e));
    }
  };

  const applyHighlight = (colorKey: HighlightKey) => {
    const { verseNumber, startOffset, endOffset } = toolbar;
    if (!verseNumber || endOffset <= startOffset) return;
    const entry: VerseHighlight = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      verseNumber,
      start: startOffset,
      end: endOffset,
      colorKey,
    };
    // Remove overlapping highlights in this verse/range before adding new one
    const filtered = highlights.filter(h =>
      h.verseNumber !== verseNumber ||
      h.end <= startOffset ||
      h.start >= endOffset
    );
    saveHighlights([...filtered, entry]);
    window.getSelection()?.removeAllRanges();
    setToolbar(t => ({ ...t, visible: false }));
  };

  const removeSelectedHighlight = () => {
    const { verseNumber, startOffset, endOffset, highlightId } = toolbar;
    if (!verseNumber) return;
    let filtered: VerseHighlight[];
    if (highlightId) {
      // Remove by specific highlight ID (clicked on highlight)
      filtered = highlights.filter(h => h.id !== highlightId);
    } else {
      // Remove by range overlap (text selection)
      filtered = highlights.filter(h =>
        h.verseNumber !== verseNumber ||
        h.end <= startOffset ||
        h.start >= endOffset
      );
    }
    saveHighlights(filtered);
    window.getSelection()?.removeAllRanges();
    setToolbar(t => ({ ...t, visible: false, highlightId: undefined }));
  };

  const toggleComments = (verseNumber: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSet = new Set(expandedVerses);
    if (newSet.has(verseNumber)) newSet.delete(verseNumber);
    else newSet.add(verseNumber);
    setExpandedVerses(newSet);
  };

  const renderItem = (item: any, idx: number) => {
    if (item.type === 'line_break') return <br key={`br-${idx}`} />;

    if (item.type === 'verse') {
      const isExpanded   = expandedVerses.has(item.number);
      const verseHls     = highlights.filter(h => h.verseNumber === item.number);
      const hasHighlight = verseHls.length > 0;
      const hasComments  = versesWithComments.has(item.number);

      return (
        <div key={`v-${item.number}`} data-verse={item.number} style={{ display: 'block', marginBottom: '4px' }}>
          <span style={{ display: 'inline' }}>
            <sup style={{ fontSize: '11px', color: 'var(--color-sleek-text-muted)', marginRight: '4px', userSelect: 'none', position: 'relative' }}>
              {item.number}
              {hasHighlight && !isExpanded && (
                <span
                  style={{
                    position: 'absolute', top: '-3px', right: '-8px',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: HIGHLIGHT_COLORS.find(c => c.key === verseHls[verseHls.length - 1].colorKey)?.dot
                      || 'var(--color-sleek-accent)',
                    display: 'inline-block',
                  }}
                />
              )}
            </sup>
            {renderVerseContent(item.content, isExpanded ? [] : verseHls, item.number)}
            {' '}
            {hasComments && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleComments(item.number, e); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '11px', fontFamily: 'sans-serif', fontWeight: 500,
                  padding: '1px 6px', borderRadius: '9999px',
                  backgroundColor: isExpanded ? 'var(--color-sleek-text-main)' : 'var(--color-sleek-hover)',
                  color: isExpanded ? 'var(--color-sleek-bg)' : 'var(--color-sleek-text-muted)',
                  cursor: 'pointer', border: 'none', verticalAlign: 'middle',
                  marginLeft: '4px', opacity: isExpanded ? 1 : 0.6,
                }}
                title={isExpanded ? 'Ocultar comentários' : 'Ver comentários teológicos'}
              >
                <MessageSquareText size={10} />
                {!isExpanded && 'Estudo'}
              </button>
            )}
          </span>
          {isExpanded && (
            <div key={`ic-${item.number}`} style={{ display: 'block', width: '100%', marginTop: '8px' }}>
              <InlineComments
                bookId={bookId}
                chapter={chapter}
                verseNumber={item.number}
                onClose={(e) => toggleComments(item.number, e)}
              />
            </div>
          )}
        </div>
      );
    }

    if (item.type === 'paragraph_break' || item.type === 'stanza_break') {
      return <div key={`pb-${idx}`} style={{ height: '12px' }} />;
    }

    if (item.type === 'heading') {
      return (
        <h3 key={`h-${idx}`} className="font-sans text-[16px] sm:text-[18px] font-semibold text-sleek-text-main mt-5 mb-3">
          {item.content.map((c: any) => typeof c === 'string' ? c : (c.text || '')).join('')}
        </h3>
      );
    }

    return null;
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-full relative font-serif">

      {/* ── Floating Highlight Toolbar ──────────────────────────────────────── */}
      {toolbar.visible && (
        <div
          className="highlight-toolbar"
          style={{ left: toolbar.x, top: toolbar.y - 48 }}
          onMouseDown={e => e.preventDefault()}
        >
          <Highlighter size={13} style={{ color: 'var(--color-sleek-text-muted)', marginRight: 2, flexShrink: 0 }} />
          <div className="highlight-divider" />
          {HIGHLIGHT_COLORS.map(color =>
            color.key === 'underline' ? (
              <button
                key={color.key}
                className={cn('highlight-color-btn', toolbar.verseNumber && highlights.some(h => h.verseNumber === toolbar.verseNumber && h.colorKey === 'underline' && h.start <= toolbar.startOffset && h.end >= toolbar.endOffset) ? 'active' : '')}
                style={{
                  background: 'transparent', borderRadius: '4px', width: '26px',
                  borderBottom: '3px solid var(--color-sleek-accent)',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  fontSize: '11px', fontWeight: 700,
                  color: 'var(--color-sleek-accent)', fontFamily: 'serif',
                }}
                title="Sublinhar"
                onClick={() => applyHighlight('underline')}
              >
                S
              </button>
            ) : (
              <button
                key={color.key}
                className="highlight-color-btn"
                style={{ background: color.dot! }}
                title={color.label}
                onClick={() => applyHighlight(color.key)}
              />
            )
          )}
          <div className="highlight-divider" />
          <button
            className="highlight-erase-btn"
            title="Remover marcação (ou clique na palavra marcada)"
            onClick={removeSelectedHighlight}
            style={{ width: 'auto', padding: '0 8px', gap: '4px', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}
          >
            <X size={11} /> Apagar
          </button>
        </div>
      )}

      {/* Desktop reading progress bar */}
      <div className="hidden lg:block h-[2px] bg-sleek-border/50 sticky top-0 z-30">
        <div
          className="h-full bg-sleek-accent transition-all duration-500 ease-out"
          style={{ width: totalChapters > 1 ? `${(chapter / totalChapters) * 100}%` : '100%' }}
        />
      </div>

      <header className="hidden lg:flex px-8 py-3 justify-between items-center bg-sleek-bg sticky top-[2px] z-20 border-b border-sleek-border/50" style={{backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-sleek-hover rounded-lg text-sleek-text-muted hover:text-sleek-text-main transition-colors"
            title="Alternar Menu Lateral"
          >
            <Menu size={16} />
          </button>
          <div className="reading-breadcrumb">
            <span className="reading-breadcrumb-sep">/</span>
            <span>{bookIndex >= 39 ? "NT" : "AT"}</span>
            <span className="reading-breadcrumb-sep">/</span>
            <span>{bookName}</span>
            <span className="reading-breadcrumb-sep">/</span>
            <span className="reading-breadcrumb-current">Cap. {chapter}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPlansOpen}
            title="Planos de Leitura"
            className="p-2 text-blue-600 bg-blue-50/60 hover:bg-blue-100/60 rounded-lg transition-colors border border-blue-100/80"
          >
            <BookIcon size={16} />
          </button>
          <button
            onClick={onNotepadOpen}
            title="Bloco de Notas"
            className="p-2 text-sleek-text-muted hover:text-sleek-text-main hover:bg-sleek-hover rounded-lg transition-colors border border-sleek-border/60"
          >
            <MessageSquareText size={16} />
          </button>
          <button
            onClick={onResearchOpen}
            title="Pesquisa Bíblica"
            className="p-2 text-purple-600 bg-purple-50/60 hover:bg-purple-100/60 rounded-lg transition-colors border border-purple-100/80"
          >
            <Globe size={16} />
          </button>
          <div className="w-px h-4 bg-sleek-border mx-1" />
          <button
            onClick={() => {
              const text = bookName + ' ' + chapter + ' — Bíblia Alpha | https://bibliaalpha.org';
              navigator.clipboard.writeText(text).then(() => {
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              });
            }}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors', shareCopied ? 'text-green-600 bg-green-50' : 'text-sleek-text-muted hover:bg-sleek-hover')}
            title="Copiar referência"
          >
            <Share2 size={13} /> {shareCopied ? 'Copiado!' : 'Compartilhar'}
          </button>
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-1.5 text-sleek-text-muted hover:bg-sleek-hover rounded-lg transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>
            {isMoreMenuOpen && (
              <ConnectionsDropdown
                onClose={() => setIsMoreMenuOpen(false)}
                className="right-0 top-10"
              />
            )}
          </div>
        </div>
      </header>

      <div
        ref={readingRef}
        className="px-6 sm:px-16 lg:px-24 py-8 sm:py-12 max-w-4xl mx-auto w-full text-left reading-text text-sleek-reading-text relative animate-fade-in"
      >
        <div className="pb-8 border-b border-sleek-border mb-8">
          <h1
            onClick={onOpenBookList}
            className="font-sans text-[36px] sm:text-[52px] font-bold text-sleek-text-main tracking-[-0.02em] leading-tight mb-6 cursor-pointer hover:opacity-80 transition-opacity"
            title="Selecionar outro livro"
          >
            {bookName} {chapter}
          </h1>

          {totalChapters > 1 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto custom-scrollbar pb-2">
              {Array.from({ length: totalChapters }, (_, i) => i + 1).map(chapNum => (
                <button
                  key={chapNum}
                  onClick={() => onSelectChapter?.(chapNum)}
                  className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-full font-sans text-[13px] flex items-center justify-center transition-colors cursor-pointer border font-medium",
                    chapNum === chapter
                      ? "bg-sleek-text-main border-sleek-text-main text-sleek-bg font-bold"
                      : "bg-sleek-input-bg border-sleek-border hover:bg-sleek-hover text-sleek-chapter-num hover:text-sleek-text-main"
                  )}
                >
                  {chapNum}
                </button>
              ))}
            </div>
          )}

          {/* Translation selector — compact pill */}
          <div className="relative inline-block font-sans">
            <button
              onClick={() => setIsTranslationMenuOpen(!isTranslationMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-sleek-border bg-sleek-input-bg text-sleek-text-muted hover:border-sleek-text-muted hover:text-sleek-text-main transition-all"
            >
              <Globe size={12} className="opacity-60" />
              <span>{AVAILABLE_TRANSLATIONS.find(t => t.id === activeTranslation)?.name?.split(' ')[0] || 'Tradução'}</span>
              <ChevronDown size={12} className="opacity-50" />
            </button>
            {isTranslationMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsTranslationMenuOpen(false)} />
                <div className="absolute top-9 left-0 z-40 bg-sleek-bg border border-sleek-border rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.14)] py-1.5 min-w-[220px] font-sans max-h-[320px] overflow-y-auto custom-scrollbar">
                  {AVAILABLE_TRANSLATIONS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { onTranslationChange(t.id); setIsTranslationMenuOpen(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-[13px] hover:bg-sleek-hover transition-colors flex items-center justify-between gap-2",
                        activeTranslation === t.id ? "font-semibold text-sleek-accent" : "text-sleek-text-main"
                      )}
                    >
                      <span>{t.name}</span>
                      {activeTranslation === t.id && <span className="w-1.5 h-1.5 rounded-full bg-sleek-accent shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pb-32 lg:pb-20">
          {content.map(renderItem)}

          <div className="mt-16 flex items-center justify-between border-t border-sleek-border pt-8 font-sans">
            <div>
              {chapter > 1 && (
                <button onClick={onPrevChapter} className="nav-chapter-btn">
                  <ChevronLeft size={16} />
                  <span>Cap. {chapter - 1}</span>
                </button>
              )}
            </div>
            <span className="text-[12px] text-sleek-text-muted font-sans">
              {chapter} / {totalChapters}
            </span>
            <div>
              {chapter < totalChapters && (
                <button onClick={onNextChapter} className="nav-chapter-btn">
                  <span>Cap. {chapter + 1}</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
