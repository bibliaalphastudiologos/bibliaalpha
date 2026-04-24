import { useState, useEffect, createContext, useContext } from 'react';
import { Book, getBooks } from './services/bibleApi';
import { getChapterFromApiBible, AVAILABLE_TRANSLATIONS } from './services/apiBible';
import Sidebar from './components/Sidebar';
import ReadingArea from './components/ReadingArea';
import CommandPalette from './components/CommandPalette';
import NotepadPanel from './components/NotepadPanel';
import ReadingPlansPanel from './components/ReadingPlansPanel';
import ResearchPanel from './components/ResearchPanel';
import EbooksPanel from './components/EbooksPanel';
import DevotionalPanel from './components/DevotionalPanel';
import ConnectionsDropdown from './components/ConnectionsDropdown';
import ThemeControls from './components/ThemeControls';
import { Menu, Edit3, MoreHorizontal, BookOpen, Globe, X, AlertTriangle } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
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
  const [isMoreMenuOpen, setIsMoreMenuOpen]   = useState(false);
  const [showSplash, setShowSplash]           = useState(true);
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
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="flex h-screen w-full bg-sleek-bg font-sans overflow-hidden text-sleek-text-main">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/10 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        <Sidebar
          isOpen={isSidebarOpen} books={books} activeBook={activeBook} activeChapter={activeChapter}
          onSelectBook={setActiveBook}
          onSelectChapter={(chapter) => { setActiveChapter(chapter); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
          onSearchClick={() => setIsCommandModeOpen(true)}
          onEbooksOpen={() => setIsEbooksOpen(true)}
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
          <header className="h-14 flex items-center justify-between px-6 sm:px-10 border-b border-sleek-border bg-sleek-bg shrink-0 z-10 lg:hidden">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-sleek-hover rounded-md text-sleek-text-muted transition-colors">
                <Menu size={20} />
              </button>
              <h1 className="text-[14px] font-semibold text-sleek-text-main">{activeBook?.name} {activeChapter}</h1>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsPlansOpen(true)} className="p-2 hover:bg-sleek-hover rounded-md text-blue-600 transition-colors"><BookOpen size={18} /></button>
              <button onClick={() => setIsNotepadOpen(true)} className="p-2 hover:bg-sleek-hover rounded-md text-sleek-text-muted transition-colors"><Edit3 size={18} /></button>
              <button onClick={() => setIsResearchOpen(true)} className="p-2 hover:bg-sleek-hover rounded-md text-purple-600 transition-colors" title="Pesquisa Bíblica"><Globe size={18} /></button>
              <div className="relative">
                <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="p-2 hover:bg-sleek-hover rounded-md text-sleek-text-muted transition-colors"><MoreHorizontal size={18} /></button>
                {isMoreMenuOpen && <ConnectionsDropdown onClose={() => setIsMoreMenuOpen(false)} className="right-0 top-12" />}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoadingChapter ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
              </div>
            ) : (
              <ReadingArea
                bookId={activeBook?.id || ''} bookName={activeBook?.name || ''}
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
              />
            )}
          </div>
        </div>
        {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        <NotepadPanel isOpen={isNotepadOpen} onClose={() => setIsNotepadOpen(false)} chapterContext={activeBook?.name + ' ' + activeChapter} />
        <ReadingPlansPanel isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)}
          onSelectChapter={(bookId, chapter) => { const book = books.find(b => b.id === bookId); if (book) { setActiveBook(book); setActiveChapter(chapter); } }}
        />
        <ResearchPanel isOpen={isResearchOpen} onClose={() => setIsResearchOpen(false)} initialQuery={activeBook?.name || ''} />
        <EbooksPanel isOpen={isEbooksOpen} onClose={() => setIsEbooksOpen(false)} />
        <DevotionalPanel
          isOpen={isDevotionalOpen}
          onClose={() => setIsDevotionalOpen(false)}
          audience={activeDevotionalAudience}
          onSelectChapter={(bookId, chapter) => { const book = books.find(b => b.id === bookId); if (book) { setActiveBook(book); setActiveChapter(chapter); } }}
        />
        <CommandPalette isOpen={isCommandModeOpen} onClose={() => setIsCommandModeOpen(false)} books={books}
          onSelectChapter={(book, chapter) => { setActiveBook(book); setActiveChapter(chapter); }}
          onDevotionalOpen={openDevotional}
        />
        <ThemeControls />
      </div>
    </ThemeContext.Provider>
  );
}
