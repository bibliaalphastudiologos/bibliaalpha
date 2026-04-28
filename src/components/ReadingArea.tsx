import { cn } from '../App';
import * as React from 'react';
import { Palette, Share2, MoreHorizontal, Book as BookIcon, Globe, ChevronDown, MessageSquareText, ChevronLeft, ChevronRight, Menu, Highlighter, X, Check } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import InlineComments from './InlineComments';
import ConnectionsDropdown from './ConnectionsDropdown';
import { AVAILABLE_TRANSLATIONS } from '../services/apiBible';
import { getChapterCommentMap } from '../services/bibleApi';
import { useAuth } from './AuthProvider';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', flexShrink: 0 }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);


function extractVerseText(content: any[]): string {
  return content.map(seg => typeof seg === 'string' ? seg : (seg?.text || seg?.content || '')).join('');
}

function buildWhatsAppMessage(verses: { number: number; text: string }[], bookName: string, chapter: number): string {
  const sep = '─'.repeat(20);
  const footer = '\n\n🔗 *https://bibliaalpha.org*\n_Bíblia Alpha · Leia, estude e anote a Palavra_ ✨';
  if (verses.length === 1) {
    const v = verses[0];
    return '📖 *Bíblia Alpha*\n' + sep + '\n\n*' + bookName + ' ' + chapter + ':' + v.number + '*\n"' + v.text + '"' + footer;
  }
  const nums = verses.map(v => v.number).join(', ');
  const lines = verses.map(v => '*' + v.number + '* — ' + v.text).join('\n\n');
  return '📖 *Bíblia Alpha*\n' + sep + '\n\n*' + bookName + ' ' + chapter + ' — versículos ' + nums + '*\n\n' + lines + footer;
}

function buildPlainMessage(verses: { number: number; text: string }[], bookName: string, chapter: number): string {
  const sep = '─'.repeat(20);
  const footer = '\n\nhttps://bibliaalpha.org\nBíblia Alpha · Leia, estude e anote a Palavra';
  if (verses.length === 1) {
    const v = verses[0];
    return 'Bíblia Alpha\n' + sep + '\n\n' + bookName + ' ' + chapter + ':' + v.number + '\n"' + v.text + '"' + footer;
  }
  const nums = verses.map(v => v.number).join(', ');
  const lines = verses.map(v => v.number + ' — ' + v.text).join('\n\n');
  return 'Bíblia Alpha\n' + sep + '\n\n' + bookName + ' ' + chapter + ' — versículos ' + nums + '\n\n' + lines + footer;
}


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
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);
  const [shareToast, setShareToast] = useState<{ msg: string; platform: 'facebook' } | null>(null);
  const [expandedVerses, setExpandedVerses] = useState<Set<number>>(new Set());
  const [versesWithComments, setVersesWithComments] = useState<Set<number>>(new Set());
  const [toolbar, setToolbar] = useState<ToolbarState>({
    visible: false, x: 0, y: 0, verseNumber: null, startOffset: 0, endOffset: 0, highlightId: undefined,
  });
  const readingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHighlights() {
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
      try {
        setHighlights(JSON.parse(localStorage.getItem(highlightKey) || '[]'));
      } catch { setHighlights([]); }
    }
    loadHighlights();
    setExpandedVerses(new Set());
    setSelectedVerses(new Set());
    setIsSelectMode(false);
    if (bookId && chapter) {
      getChapterCommentMap(bookId, chapter).then((map) => {
        if (isMounted) setVersesWithComments(map);
      });
    }
    return () => { isMounted = false; };
  }, [highlightKey, bookId, chapter, user]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); onPrevChapter?.(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNextChapter?.(); }
      if (e.key === 'Escape' && isSelectMode) { setIsSelectMode(false); setSelectedVerses(new Set()); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPrevChapter, onNextChapter, isSelectMode]);

  const shareVerseOnWhatsApp = useCallback((item: any) => {
    const text = extractVerseText(item.content);
    const message = buildWhatsAppMessage([{ number: item.number, text }], bookName, chapter);
    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank');
  }, [bookName, chapter]);

  const shareSelectedOnWhatsApp = useCallback(() => {
    const verses = content
      .filter((item: any) => item.type === 'verse' && selectedVerses.has(item.number))
      .map((item: any) => ({ number: item.number, text: extractVerseText(item.content) }));
    if (!verses.length) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(buildWhatsAppMessage(verses, bookName, chapter)), '_blank');
  }, [content, selectedVerses, bookName, chapter]);

  const shareChapterOnWhatsApp = useCallback(() => {
    const verses = content
      .filter((item: any) => item.type === 'verse')
      .map((item: any) => ({ number: item.number, text: extractVerseText(item.content) }));
    if (!verses.length) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(buildWhatsAppMessage(verses, bookName, chapter)), '_blank');
  }, [content, bookName, chapter]);

  const shareOnFacebook = useCallback((verses: { number: number; text: string }[]) => {
    const text = buildPlainMessage(verses, bookName, chapter);
    window.open('https://www.facebook.com/', '_blank');
    navigator.clipboard.writeText(text).catch(() => {});
  }, [bookName, chapter]);


  const shareSelectedOnFacebook = useCallback(() => {
    const verses = content
      .filter((item: any) => item.type === 'verse' && selectedVerses.has(item.number))
      .map((item: any) => ({ number: item.number, text: extractVerseText(item.content) }));
    if (!verses.length) return;
    shareOnFacebook(verses);
  }, [content, selectedVerses, shareOnFacebook]);


  const shareChapterOnFacebook = useCallback(() => {
    const verses = content
      .filter((item: any) => item.type === 'verse')
      .map((item: any) => ({ number: item.number, text: extractVerseText(item.content) }));
    if (!verses.length) return;
    shareOnFacebook(verses);
  }, [content, shareOnFacebook]);


  const toggleVerseSelection = useCallback((num: number) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVerses(new Set());
    setIsSelectMode(false);
  }, []);

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
      filtered = highlights.filter(h => h.id !== highlightId);
    } else {
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
      const isSelected   = selectedVerses.has(item.number);
      const isHovered    = hoveredVerse === item.number;

      return (
        <div
          key={`v-${item.number}`}
          data-verse={item.number}
          onMouseEnter={() => setHoveredVerse(item.number)}
          onMouseLeave={() => setHoveredVerse(null)}
          onClick={isSelectMode ? () => toggleVerseSelection(item.number) : undefined}
          style={{
            display: 'block', marginBottom: '4px', borderRadius: '6px',
            padding: '2px 4px', transition: 'background 0.15s',
            background: isSelected ? 'rgba(37,211,102,0.08)' : 'transparent',
            cursor: isSelectMode ? 'pointer' : 'auto',
          }}
        >
          <span style={{ display: 'inline' }}>
            {isSelectMode && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '16px', height: '16px', borderRadius: '4px',
                border: isSelected ? '2px solid #25D366' : '2px solid var(--color-sleek-border)',
                background: isSelected ? '#25D366' : 'var(--color-sleek-bg)',
                marginRight: '6px', verticalAlign: 'middle', flexShrink: 0, transition: 'all 0.15s',
              }}>
                {isSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
            )}
            <sup
              onClick={!isSelectMode ? (e) => { e.stopPropagation(); setIsSelectMode(true); setSelectedVerses(new Set([item.number])); } : (e) => { e.stopPropagation(); toggleVerseSelection(item.number); }}
              style={{ fontSize: '11px', color: isSelectMode ? (isSelected ? '#25D366' : 'var(--color-sleek-text-muted)') : 'var(--color-sleek-text-muted)', marginRight: '4px', userSelect: 'none', position: 'relative', cursor: 'pointer', transition: 'color 0.15s' }}
              title={isSelectMode ? (isSelected ? 'Remover da seleção' : 'Adicionar à seleção') : 'Selecionar versículo'}
            >
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
            {hasComments && !isSelectMode && (
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
            {!isSelectMode && (
              <span className="verse-share-icons" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', verticalAlign: 'middle', marginLeft: '4px', opacity: 0.35, transition: 'opacity 0.15s' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); shareVerseOnWhatsApp(item); }}
                  title="Compartilhar no WhatsApp"
                  style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 5px', borderRadius: '9999px', backgroundColor: 'rgba(37,211,102,0.12)', color: '#25D366', border: 'none', cursor: 'pointer', fontSize: '10px' }}
                >
                  <WhatsAppIcon size={10} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); shareOnFacebook([{ number: item.number, text: extractVerseText(item.content) }]); }}
                  title="Compartilhar no Facebook"
                  style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 5px', borderRadius: '9999px', backgroundColor: 'rgba(24,119,242,0.12)', color: '#1877F2', border: 'none', cursor: 'pointer', fontSize: '10px' }}
                >
                  <FacebookIcon size={10} />
                </button>
              </span>
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
            aria-label="Alternar Menu Lateral"
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
          <div className="relative">
            <button
              onClick={() => setIsShareMenuOpen(v => !v)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors', shareCopied ? 'text-green-600 bg-green-50' : 'text-sleek-text-muted hover:bg-sleek-hover')}
              title="Compartilhar"
            >
              <Share2 size={13} /> {shareCopied ? 'Copiado!' : 'Compartilhar'} <ChevronDown size={11} className='opacity-40 ml-0.5' />
            </button>
            {isShareMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsShareMenuOpen(false)} />
                <div className="absolute right-0 top-10 z-40 bg-sleek-bg border border-sleek-border rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.14)] py-1.5 min-w-[250px] font-sans">
                  <button onClick={() => { navigator.clipboard.writeText(bookName + ' ' + chapter + ' — Bíblia Alpha | https://bibliaalpha.org').then(() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }); setIsShareMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover transition-colors flex items-center gap-3 text-sleek-text-main">
                    <Share2 size={14} className="text-sleek-text-muted flex-shrink-0" />
                    <div><div className="font-medium">Copiar referência</div><div className="text-[11px] text-sleek-text-muted">{bookName} {chapter}</div></div>
                  </button>
                  <div className="h-px bg-sleek-border my-1 mx-3" />
                  <button onClick={() => { shareChapterOnWhatsApp(); setIsShareMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover transition-colors flex items-center gap-3 text-sleek-text-main">
                    <span className="flex-shrink-0"><WhatsAppIcon size={14} /></span>
                    <div><div className="font-medium" style={{color:'#128C7E'}}>WhatsApp — capítulo inteiro</div><div className="text-[11px] text-sleek-text-muted">Compartilhar {bookName} {chapter}</div></div>
                  </button>
                  <button onClick={() => { shareChapterOnFacebook(); setIsShareMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover transition-colors flex items-center gap-3 text-sleek-text-main">
                    <span className="flex-shrink-0"><FacebookIcon size={14} /></span>
                    <div><div className="font-medium" style={{color:'#1877F2'}}>Facebook — capítulo inteiro</div><div className="text-[11px] text-sleek-text-muted">Compartilhar {bookName} {chapter}</div></div>
                  </button>
                  <div className="h-px bg-sleek-border my-1 mx-3" />
                  <button onClick={() => { setIsSelectMode(true); setSelectedVerses(new Set()); setIsShareMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sleek-hover transition-colors flex items-center gap-3 text-sleek-text-main">
                    <span className="flex-shrink-0" style={{width:14,display:'inline-flex',justifyContent:'center'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 7l2.5 2.5L10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <div><div className="font-medium">Selecionar versículos</div><div className="text-[11px] text-sleek-text-muted">Escolher versículos específicos</div></div>
                  </button>
                </div>
              </>
            )}
          </div>
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

          {/* Translation + mobile share buttons */}
          <div className="flex items-center gap-2 flex-wrap font-sans">
          <div className="relative inline-block">
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

          {/* Mobile: share platform buttons */}
          <button onClick={shareChapterOnWhatsApp}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
            style={{borderColor:'#25D366',color:'#25D366',background:'rgba(37,211,102,0.07)'}}
            title="Compartilhar no WhatsApp">
            <WhatsAppIcon size={12} />
          </button>
          <button onClick={shareChapterOnFacebook}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
            style={{borderColor:'#1877F2',color:'#1877F2',background:'rgba(24,119,242,0.07)'}}
            title="Compartilhar no Facebook">
            <FacebookIcon size={12} />
          </button>
          {/* Mobile: select verses */}
          <button
            onClick={() => { setIsSelectMode(v => !v); if (isSelectMode) setSelectedVerses(new Set()); }}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-sleek-border bg-sleek-input-bg text-sleek-text-muted hover:border-sleek-text-muted transition-all">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="0.75" y="0.75" width="10.5" height="10.5" rx="2.25" stroke="currentColor" strokeWidth="1.2"/><path d="M3 6l2 2 4-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>{isSelectMode ? 'Cancelar' : 'Selecionar'}</span>
          </button>
        </div>
        {/* Selection mode banner */}
        {isSelectMode && (
          <div style={{marginTop:'12px',padding:'10px 14px',borderRadius:'10px',background:'var(--color-sleek-hover)',border:'1px solid var(--color-sleek-border)',display:'flex',alignItems:'center',gap:'10px',fontFamily:'sans-serif',fontSize:'13px',color:'var(--color-sleek-text-muted)'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 7l2.5 2.5L10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{flex:1,color:'var(--color-sleek-text-main)'}}>
              {selectedVerses.size === 0 ? 'Toque nos versículos para selecioná-los' : selectedVerses.size + ' versículo' + (selectedVerses.size > 1 ? 's' : '') + ' selecionado' + (selectedVerses.size > 1 ? 's' : '')}
            </span>
            {selectedVerses.size > 0 && (
              <span style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <button onClick={shareSelectedOnWhatsApp} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',background:'rgba(37,211,102,0.15)',color:'#25D366',border:'1px solid rgba(37,211,102,0.3)',cursor:'pointer',fontSize:'11px',fontWeight:700}}>
                  <WhatsAppIcon size={11} />
                </button>
                <button onClick={shareSelectedOnFacebook} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',background:'rgba(24,119,242,0.15)',color:'#1877F2',border:'1px solid rgba(24,119,242,0.3)',cursor:'pointer',fontSize:'11px',fontWeight:700}}>
                  <FacebookIcon size={11} />
                </button>
              </span>
            )}
            <button onClick={clearSelection} style={{padding:'4px 8px',borderRadius:'6px',background:'transparent',color:'var(--color-sleek-text-muted)',border:'none',cursor:'pointer',fontSize:'12px'}}>Cancelar</button>
          </div>
        )}

        <div className="pb-32 lg:pb-20">
          {content.map(renderItem)}

          <div className="mt-16 flex items-center justify-between border-t border-sleek-border pt-8 font-sans">
            <div>
              {chapter > 1 && (
                <button onClick={onPrevChapter} className="nav-chapter-btn" aria-label={`Capítulo anterior: ${chapter - 1}`}>
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
                <button onClick={onNextChapter} className="nav-chapter-btn" aria-label={`Próximo capítulo: ${chapter + 1}`}>
                  <span>Cap. {chapter + 1}</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating selection bar — desktop */}
      {isSelectMode && (
        <div className="hidden lg:flex" style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:50,alignItems:'center',gap:'12px',padding:'12px 20px',borderRadius:'20px',background:'#1a1a1a',color:'white',fontFamily:'sans-serif',fontSize:'13px',boxShadow:'0 8px 32px rgba(0,0,0,0.35)',minWidth:'340px',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/><path d="M4 8l3 3 5-5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{color:'rgba(255,255,255,0.8)'}}>
              {selectedVerses.size === 0 ? 'Clique nos versículos para selecionar' : selectedVerses.size + ' versículo' + (selectedVerses.size > 1 ? 's' : '') + ' selecionado' + (selectedVerses.size > 1 ? 's' : '')}
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            {selectedVerses.size > 0 && (
              <>
                <button onClick={shareSelectedOnWhatsApp} style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'12px',background:'#25D366',color:'white',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700}}>
                  <WhatsAppIcon size={13} />WhatsApp
                </button>
                <button onClick={shareSelectedOnFacebook} style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'12px',background:'#1877F2',color:'white',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700}}>
                  <FacebookIcon size={13} />Facebook
                </button>
              </>
            )}
            <button onClick={clearSelection} title="Cancelar (Esc)" style={{padding:'6px',borderRadius:'8px',background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center'}}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Share clipboard toast (WhatsApp copy feedback) */}
      {shareToast && (
        <div style={{position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',zIndex:60,padding:'10px 20px',borderRadius:'12px',background:'#1a1a1a',color:'white',fontFamily:'sans-serif',fontSize:'13px',fontWeight:500,boxShadow:'0 4px 16px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',gap:'8px',pointerEvents:'none',whiteSpace:'nowrap'}}>
          <FacebookIcon size={14} />
          {shareToast.msg}
        </div>
      )}

    <style>{`
      .verse-share-icons:hover { opacity: 1 !important; }
      @media (hover: none) { .verse-share-icons { opacity: 1 !important; } }
    `}</style>
    </div>
  </div>
  );
}

