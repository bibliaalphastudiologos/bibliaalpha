import { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import { Book, getBooks } from './services/bibleApi';
import { getChapterFromApiBible, AVAILABLE_TRANSLATIONS } from './services/apiBible';
import Sidebar from './components/Sidebar';
import ReadingArea from './components/ReadingArea';
import CommandPalette from './components/CommandPalette';
import ConnectionsDropdown from './components/ConnectionsDropdown';
import { Menu, Edit3, MoreHorizontal, BookOpen, Globe, X, AlertTriangle, Search, Palette } from 'lucide-react';

// Lazy-loaded panels — only bundled when first opened
const NotepadPanel      = lazy(() => import('./components/NotepadPanel'));
const ReadingPlansPanel = lazy(() => import('./components/ReadingPlansPanel'));
const ResearchPanel     = lazy(() => import('./components/ResearchPanel'));
const EbooksPanel       = lazy(() => import('./components/EbooksPanel'));
const ABSimpsonPanel    = lazy(() => import('./components/ABSimpsonPanel'));
const BensonPanel       = lazy(() => import('./components/BensonPanel'));
const JohnGillPanel     = lazy(() => import('./components/JohnGillPanel'));
const AdamClarkePanel   = lazy(() => import('./components/AdamClarkePanel'));
const MatthewHenryPanel = lazy(() => import('./components/MatthewHenryPanel'));
const DevotionalPanel   = lazy(() => import('./components/DevotionalPanel'));
const ThemeControls     = lazy(() => import('./components/ThemeControls'));
const SplashScreen      = lazy(() => import('./components/SplashScreen'));
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DevotionalAudience } from './data/devotionals';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme Context
export type Theme    = 'light' | 'dark' | 'graphite';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface ThemeContextValue {
  theme:        Theme;
  fontSize:     FontSize;
  setTheme:     (t: Theme)    => void;
  setFontSize:  (f: FontSize) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light', fontSize: 'md',
  setTheme: () => {}, setFontSize: () => {},
});

export function useTheme() { return useContext(ThemeContext); }

// Constants
const LAST_BOOK_KEY        = 'bibliaalpha_last_book_id';
const LAST_CHAPTER_KEY     = 'bibliaalpha_last_chapter';
const LAST_TRANSLATION_KEY = 'bibliaalpha_last_translation';
const THEME_KEY            = 'bibliaalpha_theme';
const FONTSIZE_KEY         = 'bibliaalpha_fontsize';
const DEFAULT_TRANSLATION  = 'arc';

// App
export default function App() {
  // Theme state
  const [theme, setThemeState]       = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'light');
  const [fontSize, setFontSizeState] = useState<FontSize>(() => (localStorage.getItem(FONTSIZE_KEY) as FontSize) || 'md');

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute('data-theme', t === 'light' ? '' : t);
  };
  const setFontSize = (f: FontSize) => {
    setFontSizeState(f);
    localStorage.setItem(FONTSIZE_KEY, f);
    document.documentElement.setAttribute('data-fontsize', f);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
    document.documentElement.setAttribute('data-fontsize', fontSize);
  }, []);

  // Bible state
  const [books, setBooks]                     = useState<Book[]>([]);
  const [activeBook, setActiveBook]           = useState<Book | null>(null);
  const [activeChapter, setActiveChapter]     = useState<number>(1);
  const [activeTranslation, setActiveTranslation] = useState<string>(DEFAULT_TRANSLATION);
  const [chapterContent, setChapterContent]   = useState<any[]>([]);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen]     = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isCommandModeOpen, setIsCommandModeOpen] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen]     = useState(false);
  const [isPlansOpen, setIsPlansOpen]         = useState(false);
  const [isResearchOpen, setIsResearchOpen]   = useState(false);
  const [isEbooksOpen, setIsEbooksOpen]       = useState(false);
  const [isSimpsonOpen, setIsSimpsonOpen]       = useState(false);
  const [isBensonOpen, setIsBensonOpen]         = useState(false);
  const [isGillOpen, setIsGillOpen]             = useState(false);
  const [isClarkeOpen, setIsClarkeOpen]         = useState(false);
  const [isMHOpen, setIsMHOpen]               = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen]   = useState(false);
  const [isThemeOpen, setIsThemeOpen]         = useState(false);
  // Splash apenas na primeira visita — nunca em reloads de usuário já logado
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('ba_splash_v3_seen'));
  const [apiErrorBanner, setApiErrorBanner]   = useState<string | null>(null);

  // Devotional state
  const [isDevotionalOpen, setIsDevotionalOpen]                 = useState(false);
  const [activeDevotionalAudience, setActiveDevotionalAudience] = useState<DevotionalAudience | null>(null);

  const openDevotional = (audience: DevotionalAudience) => {
    setActiveDevotionalAudience(audience);
    setIsDevotionalOpen(true);
  };

  // Load books
  useEffect(() => {
    async function init() {
      try {
        const fetchedBooks = await getBooks();
        setBooks(fetchedBooks);
        if (fetchedBooks.length > 0) {
          const savedBookId      = localStorage.getItem(LAST_BOOK_KEY);
          const savedChapterRaw  = localStorage.getItem(LAST_CHAPTER_KEY);
          const savedTranslation = localStorage.getItem(LAST_TRANSLATION_KEY);
          const savedChapter     = savedChapterRaw ? parseInt(savedChapterRaw, 10) : 1;
          const savedBook        = savedBookId ? fetchedBooks.find(b => b.id === savedBookId) : null;
          if (savedTranslation && AVAILABLE_TRANSLATIONS.find(t => t.id === savedTranslation)) {
            setActiveTranslation(savedTranslation);
          }
          setActiveBook(savedBook ?? fetchedBooks[0]);
          setActiveChapter((savedBook && !isNaN(savedChapter)) ? savedChapter : 1);
        }
      } catch (error) { console.error('Failed to load books', error); }
    }
    init();
  }, []);

  // Persist position
  useEffect(() => {
    if (activeBook) {
      localStorage.setItem(LAST_BOOK_KEY,        activeBook.id);
      localStorage.setItem(LAST_CHAPTER_KEY,     String(activeChapter));
      localStorage.setItem(LAST_TRANSLATION_KEY, activeTranslation);
    }
  }, [activeBook, activeChapter, activeTranslation]);

  // Dynamic SEO — update title + meta on book/chapter change
  useEffect(() => {
    if (!activeBook) return;
    const title = `${activeBook.name} ${activeChapter} — Bíblia Alpha`;
    document.title = title;
    // Update meta description
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content',
      `Leia ${activeBook.name} capítulo ${activeChapter} com comentários clássicos, destaques e notas. Bíblia Alpha.`);
    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content',
      `${activeBook.name} ${activeChapter} — leia com comentários clássicos e faça anotações. Bíblia Alpha.`);
  }, [activeBook, activeChapter]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandModeOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load chapter
  useEffect(() => {
    if (!activeBook) return;
    let isMounted = true;
    async function loadChapter() {
      setIsLoadingChapter(true);
      setApiErrorBanner(null);
      try {
        const ptContent = await getChapterFromApiBible(activeTranslation, activeBook!.id, activeChapter);
        if (isMounted) setChapterContent(ptContent);
      } catch (e: any) {
        console.error('[App] Erro ao carregar capítulo:', e);
        if (isMounted) {
          setApiErrorBanner(`Erro na tradução "${activeTranslation}": ${e.message}. Tentando Almeida…`);
          if (activeTranslation !== DEFAULT_TRANSLATION) setActiveTranslation(DEFAULT_TRANSLATION);
          else setChapterContent([{ type: 'verse', number: 1, content: ['Erro ao carregar. Verifique sua conexão.'] }]);
        }
      } finally { if (isMounted) setIsLoadingChapter(false); }
    }
    loadChapter();
    return () => { isMounted = false; };
  }, [activeBook, activeChapter, activeTranslation]);

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
      {showSplash && <Suspense fallback={null}><SplashScreen onFinish={() => { localStorage.setItem('ba_splash_v3_seen', '1'); setShowSplash(false); }} /></Suspense>}
      <div className="flex h-screen w-full bg-sleek-bg font-sans overflow-hidden text-sleek-text-main">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/10 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        <Sidebar
          isOpen={isSidebarOpen} books={books} activeBook={activeBook} activeChapter={activeChapter}
          onSelectBook={setActiveBook}
          onSelectChapter={(chapter) => { setActiveChapter(chapter); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
          onSearchClick={() => setIsCommandModeOpen(true)}
          onEbooksOpen={() => setIsEbooksOpen(true)}
          onSimpsonOpen={() => setIsSimpsonOpen(true)}
          onBensonOpen={() => setIsBensonOpen(true)}
          onGillOpen={() => setIsGillOpen(true)}
          onClarkeOpen={() => setIsClarkeOpen(true)}
          onMHOpen={() => setIsMHOpen(true)}
          onDevotionalOpen={openDevotional}
        />
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">
          {apiErrorBanner && (
            <div className="flex items-center justify-between gap-2 px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm z-20">
              <span className="flex items-center gap-1.5"><AlertTriangle size={14} />{apiErrorBanner}</span>
              <button onClick={() => setApiErrorBanner(null)} className="p-1 hover:bg-red-100 rounded" aria-label="Fechar">
                <X size={14} />
              </button>
            </div>
          )}
          <header className="h-12 flex items-center justify-between px-4 border-b border-sleek-border bg-sleek-bg shrink-0 z-10 lg:hidden" style={{backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors" title="Menu">
              <Menu size={18} />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-[13px] font-semibold text-sleek-text-main leading-tight">{activeBook?.name} {activeChapter}</h1>
              <span className="text-[10px] text-sleek-text-muted">{activeBook && activeChapter ? `${activeChapter} / ${activeBook.numberOfChapters}` : ''}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setIsThemeOpen(true)} className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors" title="Aparência" aria-label="Aparência">
                <Palette size={17} />
              </button>
              <button onClick={() => setIsCommandModeOpen(true)} className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors" title="Buscar (⌘K)" aria-label="Buscar">
                <Search size={18} />
              </button>
            </div>
          </header>
          {/* Reading progress bar — mobile */}
          <div className="lg:hidden h-[2px] bg-sleek-border shrink-0">
            <div
              className="h-full bg-sleek-accent transition-all duration-500"
              style={{ width: activeBook ? `${(activeChapter / activeBook.numberOfChapters) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoadingChapter ? (
              <div className="px-6 sm:px-16 lg:px-24 py-8 sm:py-12 max-w-4xl mx-auto w-full animate-pulse">
                <div className="pb-8 border-b border-sleek-border mb-8">
                  <div className="skeleton skeleton-title w-3/4 mb-6" />
                  <div className="flex gap-2 mb-8">
                    {Array.from({length: 8}).map((_,i) => (
                      <div key={i} className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton skeleton-text w-48" />
                    <div className="skeleton skeleton-text w-32" />
                    <div className="skeleton skeleton-text w-40" />
                  </div>
                </div>
                <div className="space-y-3">
                  {Array.from({length: 14}).map((_,i) => (
                    <div key={i} className="skeleton skeleton-verse" style={{width: `${70 + (i % 5) * 6}%`}} />
                  ))}
                </div>
              </div>
            ) : (
              <ReadingArea
                bookId={activeBook?.id || ''} bookName={activeBook?.name || ''}
                bookIndex={books.indexOf(activeBook!)}
                chapter={activeChapter} totalChapters={activeBook?.numberOfChapters || 1}
                content={chapterContent} activeTranslation={activeTranslation}
                onTranslationChange={setActiveTranslation}
                onOpenBookList={() => { if (window.innerWidth < 1024) setIsSidebarOpen(true); else setIsCommandModeOpen(true); }}
                onNotepadOpen={() => setIsNotepadOpen(true)}
                onPlansOpen={() => setIsPlansOpen(true)}
                onResearchOpen={() => setIsResearchOpen(true)}
                onPrevChapter={() => setActiveChapter(Math.max(1, activeChapter - 1))}
                onNextChapter={() => setActiveChapter(Math.min(activeBook?.numberOfChapters || 1, activeChapter + 1))}
                onSelectChapter={setActiveChapter}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onScofieldNavigate={(bookId, chapter) => {
                  const book = books.find(b => b.id === bookId);
                  if (book) { setActiveBook(book); setActiveChapter(chapter); }
                }}
              />
            )}
          </div>

          {/* ── Mobile Bottom Navigation Bar ── */}
          <nav className="lg:hidden shrink-0 border-t border-sleek-border bg-sleek-bg" style={{backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}>
            <div className="flex items-stretch h-[56px]">
              <button
                onClick={() => setIsPlansOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-blue-600 hover:bg-sleek-hover transition-colors"
              >
                <BookOpen size={18} />
                <span className="text-[9px] font-medium">Planos</span>
              </button>
              <button
                onClick={() => setIsNotepadOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-sleek-text-muted hover:bg-sleek-hover hover:text-sleek-text-main transition-colors"
              >
                <Edit3 size={18} />
                <span className="text-[9px] font-medium">Notas</span>
              </button>
              <button
                onClick={() => {
                  const book = activeBook; const ch = activeChapter;
                  if (!book) return;
                  const text = '📖 *Bíblia Alpha*\n' + '─'.repeat(20) + '\n\n*' + book.name + ' ' + ch + '*\n\n🔗 *https://bibliaalpha.org*\n_Leia e estude a Palavra_ ✨';
                  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
                }}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 hover:bg-sleek-hover transition-colors"
                style={{color:'#25D366'}}
                title="Compartilhar no WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="text-[9px] font-medium">WhatsApp</span>
              </button>
              <button
                onClick={() => setIsResearchOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-purple-600 hover:bg-sleek-hover transition-colors"
              >
                <Globe size={18} />
                <span className="text-[9px] font-medium">Pesquisa</span>
              </button>
              <div className="relative flex-1">
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="w-full h-full flex flex-col items-center justify-center gap-0.5 text-sleek-text-muted hover:bg-sleek-hover hover:text-sleek-text-main transition-colors"
                >
                  <MoreHorizontal size={18} />
                  <span className="text-[9px] font-medium">Mais</span>
                </button>
                {isMoreMenuOpen && <ConnectionsDropdown onClose={() => setIsMoreMenuOpen(false)} className="right-0 bottom-14" />}
              </div>
            </div>
          </nav>
        </div>
        {/* overlay handled above */}
        <Suspense fallback={null}>
          <NotepadPanel isOpen={isNotepadOpen} onClose={() => setIsNotepadOpen(false)} chapterContext={activeBook?.name + ' ' + activeChapter} />
          <ReadingPlansPanel isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)}
            onSelectChapter={(bookId, chapter) => { const book = books.find(b => b.id === bookId); if (book) { setActiveBook(book); setActiveChapter(chapter); } }}
          />
          <ResearchPanel isOpen={isResearchOpen} onClose={() => setIsResearchOpen(false)} initialQuery={activeBook?.name ?? ''} />
          <EbooksPanel isOpen={isEbooksOpen} onClose={() => setIsEbooksOpen(false)} />

          <ABSimpsonPanel
            isOpen={isSimpsonOpen}
            onClose={() => setIsSimpsonOpen(false)}
            bookId={activeBook?.id || ''}
            bookName={activeBook?.name || ''}
            chapter={activeChapter}
            totalChapters={activeBook?.numberOfChapters || 1}
            onPrevChapter={() => setActiveChapter(Math.max(1, activeChapter - 1))}
            onNextChapter={() => setActiveChapter(Math.min(activeBook?.numberOfChapters || 1, activeChapter + 1))}
            onNavigate={(bookId, chapter) => {
              const book = books.find(b => b.id === bookId);
              if (book) { setActiveBook(book); setActiveChapter(chapter); }
              setIsSimpsonOpen(false);
            }}
          />
          <BensonPanel
            isOpen={isBensonOpen}
            onClose={() => setIsBensonOpen(false)}
            bookId={activeBook?.id || ''}
            bookName={activeBook?.name || ''}
            chapter={activeChapter}
            totalChapters={activeBook?.numberOfChapters || 1}
            onPrevChapter={() => setActiveChapter(Math.max(1, activeChapter - 1))}
            onNextChapter={() => setActiveChapter(Math.min(activeBook?.numberOfChapters || 1, activeChapter + 1))}
            onNavigate={(bookId, chapter) => {
              const book = books.find(b => b.id === bookId);
              if (book) { setActiveBook(book); setActiveChapter(chapter); }
              setIsBensonOpen(false);
            }}
          />
          <MatthewHenryPanel
            isOpen={isMHOpen}
            onClose={() => setIsMHOpen(false)}
            bookId={activeBook?.id || ''}
            bookName={activeBook?.name || ''}
            chapter={activeChapter}
            totalChapters={activeBook?.numberOfChapters || 1}
            onPrevChapter={() => setActiveChapter(Math.max(1, activeChapter - 1))}
            onNextChapter={() => setActiveChapter(Math.min(activeBook?.numberOfChapters || 1, activeChapter + 1))}
          />
          <DevotionalPanel
            isOpen={isDevotionalOpen}
            onClose={() => setIsDevotionalOpen(false)}
            audience={activeDevotionalAudience}
            onSelectChapter={(bookId, chapter) => { const book = books.find(b => b.id === bookId); if (book) { setActiveBook(book); setActiveChapter(chapter); } }}
          />
          <JohnGillPanel
            isOpen={isGillOpen}
            onClose={() => setIsGillOpen(false)}
            bookId={activeBook?.id || ''}
            bookName={activeBook?.name || ''}
            chapter={activeChapter}
            totalChapters={activeBook?.numberOfChapters || 1}
            onPrevChapter={() => setActiveChapter(Math.max(1, activeChapter - 1))}
            onNextChapter={() => setActiveChapter(Math.min(activeBook?.numberOfChapters || 1, activeChapter + 1))}
            onNavigate={(bookId, chapter) => {
              const book = books.find(b => b.id === bookId);
              if (book) { setActiveBook(book); setActiveChapter(chapter); }
              setIsGillOpen(false);
            }}
          />
          <AdamClarkePanel
            isOpen={isClarkeOpen}
            onClose={() => setIsClarkeOpen(false)}
            bookId={activeBook?.id || ''}
            bookName={activeBook?.name || ''}
            chapter={activeChapter}
            totalChapters={activeBook?.numberOfChapters || 1}
            onPrevChapter={() => setActiveChapter(Math.max(1, activeChapter - 1))}
            onNextChapter={() => setActiveChapter(Math.min(activeBook?.numberOfChapters || 1, activeChapter + 1))}
            onNavigate={(bookId, chapter) => {
              const book = books.find(b => b.id === bookId);
              if (book) { setActiveBook(book); setActiveChapter(chapter); }
              setIsClarkeOpen(false);
            }}
          />
          <CommandPalette isOpen={isCommandModeOpen} onClose={() => setIsCommandModeOpen(false)} books={books}
            onSelectChapter={(book, chapter) => { setActiveBook(book); setActiveChapter(chapter); }}
            onDevotionalOpen={openDevotional}
          />
          <ThemeControls open={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
        </Suspense>
      </div>
    </ThemeContext.Provider>
  );
}


