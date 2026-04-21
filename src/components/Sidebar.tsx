import { Book } from '../services/bibleApi';
import {
  ChevronDown,
  ChevronRight,
  Book as BookIcon,
  Search,
  Shield,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from '../App';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  isOpen: boolean;
  books: Book[];
  activeBook: Book | null;
  activeChapter: number;
  onSelectBook: (book: Book) => void;
  onSelectChapter: (chapter: number) => void;
  onSearchClick?: () => void;
}

const AUTH_STORAGE_KEYS = [
  'token',
  'authToken',
  'refreshToken',
  'supabase.auth.token',
  'firebase:authUser',
];

export default function Sidebar({
  isOpen,
  books,
  activeBook,
  activeChapter,
  onSelectBook,
  onSelectChapter,
  onSearchClick,
}: SidebarProps) {
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [expandedTestament, setExpandedTestament] = useState<'old' | 'new' | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.email === 'analista.ericksilva@gmail.com';
  const showAdminButton = profile?.isAdmin || isSuperAdmin;

  const oldTestament = useMemo(() => books.slice(0, 39), [books]);
  const newTestament = useMemo(() => books.slice(39), [books]);

  const toggleBook = (book: Book) => {
    if (expandedBookId === book.id) setExpandedBookId(null);
    else setExpandedBookId(book.id);
    onSelectBook(book);
  };

  const toggleTestament = (testament: 'old' | 'new') => {
    setExpandedTestament((current) => (current === testament ? null : testament));
  };

  const clearLocalAuthData = useCallback(() => {
    AUTH_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    Object.keys(localStorage).forEach((key) => {
      if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach((key) => {
      if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
        sessionStorage.removeItem(key);
      }
    });

    document.cookie.split(';').forEach((cookie) => {
      const cookieName = cookie.split('=')[0]?.trim();
      if (!cookieName) return;

      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      clearLocalAuthData();
      navigate('/login', { replace: true });
      setIsLoggingOut(false);
    }
  }, [clearLocalAuthData, isLoggingOut, logout, navigate]);

  const renderBooks = (items: Book[]) => (
    <div className="space-y-1">
      {items.map((book) => {
        const isExpanded = expandedBookId === book.id;
        const isActiveBook = activeBook?.id === book.id;

        return (
          <div key={book.id} className="rounded-lg">
            <button
              type="button"
              onClick={() => toggleBook(book)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                isActiveBook
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
              aria-expanded={isExpanded}
              aria-controls={`chapters-${book.id}`}
            >
              <span className="truncate">{book.name}</span>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isExpanded && (
              <div id={`chapters-${book.id}`} className="mt-1 grid grid-cols-4 gap-1 pl-2">
                {Array.from({ length: book.chapters }, (_, index) => {
                  const chapter = index + 1;
                  const isActiveChapter = isActiveBook && activeChapter === chapter;

                  return (
                    <button
                      key={chapter}
                      type="button"
                      onClick={() => onSelectChapter(chapter)}
                      className={cn(
                        'rounded-md px-2 py-1 text-xs transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                        isActiveChapter
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      )}
                      aria-label={`Selecionar capítulo ${chapter} de ${book.name}`}
                    >
                      {chapter}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full w-[85vw] max-w-[320px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 sm:w-[240px]',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      aria-label="Menu lateral"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
        <BookIcon className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Biblia Alpha</p>
          <p className="text-xs text-slate-500">Estudo e navegação</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-3">
          <button
            type="button"
            onClick={onSearchClick}
            className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            aria-label="Abrir busca"
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>

          <section aria-labelledby="old-testament-heading" className="space-y-2">
            <button
              type="button"
              onClick={() => toggleTestament('old')}
              className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              aria-expanded={expandedTestament === 'old'}
              aria-controls="old-testament-list"
            >
              <span id="old-testament-heading">Antigo Testamento</span>
              {expandedTestament === 'old' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {expandedTestament === 'old' && <div id="old-testament-list">{renderBooks(oldTestament)}</div>}
          </section>

          <section aria-labelledby="new-testament-heading" className="space-y-2">
            <button
              type="button"
              onClick={() => toggleTestament('new')}
              className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              aria-expanded={expandedTestament === 'new'}
              aria-controls="new-testament-list"
            >
              <span id="new-testament-heading">Novo Testamento</span>
              {expandedTestament === 'new' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {expandedTestament === 'new' && <div id="new-testament-list">{renderBooks(newTestament)}</div>}
          </section>

          <section className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3" aria-label="Conexões e ações da conta">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Conexões</span>
            </div>

            {showAdminButton && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                aria-label="Abrir área administrativa"
              >
                <Shield className="h-4 w-4" />
                <span>Administração</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
                isLoggingOut
                  ? 'cursor-not-allowed bg-red-100 text-red-500'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              )}
              aria-label={isLoggingOut ? 'Saindo da conta' : 'Sair da conta'}
              aria-busy={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Saindo...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sair</span>
                </>
              )}
            </button>
          </section>
        </div>
      </div>
    </aside>
  );
}
