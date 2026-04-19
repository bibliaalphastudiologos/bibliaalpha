import { useState, useEffect } from 'react';
import { Book, getBooks } from './services/bibleApi';
import { getChapterFromApiBible, AVAILABLE_TRANSLATIONS } from './services/apiBible';
import Sidebar from './components/Sidebar';
import ReadingArea from './components/ReadingArea';
import { AuthProvider, useAuth } from './components/AuthProvider';
import AdminPanel from './components/AdminPanel';
import CommandPalette from './components/CommandPalette';
import { ResearchPanel } from './components/ResearchPanel';
import NotepadPanel from './components/NotepadPanel';
import ReadingPlansPanel from './components/ReadingPlansPanel';
import { geminiService } from './services/geminiService';

type Panel = 'research' | 'notepad' | 'plans' | null;

function AppContent() {
  const { user, profile, loading, profileError, login, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [translation, setTranslation] = useState<string>('nvi');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [geminiReady, setGeminiReady] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (profileError) setErrorBanner(profileError);
  }, [profileError]);

  useEffect(() => {
    const ready = geminiService.isReady();
    setGeminiReady(ready);
    if (!ready) console.warn('Gemini API key nao configurada.');
  }, []);

  useEffect(() => {
    getBooks().then(setBooks).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBook) return;
    setLoadingVerses(true);
    getChapterFromApiBible(translation, selectedBook.abbrev?.pt || selectedBook.name, selectedChapter)
      .then(setVerses)
      .catch(console.error)
      .finally(() => setLoadingVerses(false));
  }, [selectedBook, selectedChapter, translation]);

  // ── Tela de Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando Biblia Alpha...</p>
        </div>
      </div>
    );
  }

  // ── Tela de Login ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-sm w-full px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-amber-400 mb-2">📖 Biblia Alpha</h1>
            <p className="text-gray-400 text-sm">Seu estudo biblico inteligente</p>
          </div>
          {errorBanner && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-200 text-sm">
              {errorBanner}
              <button onClick={() => setErrorBanner(null)} className="ml-2 text-red-400 hover:text-red-200">✕</button>
            </div>
          )}
          <button
            onClick={login}
            className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-xl transition-colors"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  // ── Aguardando aprovacao ─────────────────────────────────────────────────
  if (profile?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-sm w-full px-6">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">⏳ Aguardando aprovacao</h2>
          <p className="text-gray-400 mb-6">Seu cadastro esta em analise. Em breve voce tera acesso.</p>
          {errorBanner && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-200 text-sm">
              {errorBanner}
              <button onClick={() => setErrorBanner(null)} className="ml-2 text-red-400 hover:text-red-200">✕</button>
            </div>
          )}
          <button
            onClick={logout}
            className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  // ── Acesso bloqueado ─────────────────────────────────────────────────────
  if (profile?.status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-sm w-full px-6">
          <h2 className="text-2xl font-bold text-red-400 mb-4">🚫 Acesso bloqueado</h2>
          <p className="text-gray-400 mb-6">Sua conta foi suspensa. Entre em contato com o administrador.</p>
          <button
            onClick={logout}
            className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  // ── App Principal ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {errorBanner && (
        <div className="bg-red-900/80 border-b border-red-700 px-4 py-2 text-red-200 text-sm flex items-center justify-between">
          <span>⚠️ {errorBanner}</span>
          <button onClick={() => setErrorBanner(null)} className="ml-4 text-red-400 hover:text-red-200">✕</button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          books={books}
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          onSelectBook={(book) => { setSelectedBook(book); setSelectedChapter(1); }}
          onSelectChapter={setSelectedChapter}
          translation={translation}
          translations={AVAILABLE_TRANSLATIONS}
          onSelectTranslation={setTranslation}
          profile={profile}
          onShowAdmin={() => setShowAdmin(true)}
          onLogout={logout}
          onShowCommandPalette={() => setShowCommandPalette(true)}
          activePanel={activePanel}
          onTogglePanel={(panel) => setActivePanel(prev => prev === panel ? null : panel)}
        />
        <main className="flex-1 overflow-hidden flex">
          <ReadingArea
            book={selectedBook}
            chapter={selectedChapter}
            verses={verses}
            loading={loadingVerses}
            geminiReady={geminiReady}
          />
          {activePanel === 'research' && <ResearchPanel />}
          {activePanel === 'notepad' && <NotepadPanel book={selectedBook} chapter={selectedChapter} />}
          {activePanel === 'plans' && <ReadingPlansPanel />}
        </main>
      </div>
      {showAdmin && profile?.isAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
      {showCommandPalette && (
        <CommandPalette
          books={books}
          onSelectBook={(book) => { setSelectedBook(book); setSelectedChapter(1); setShowCommandPalette(false); }}
          onSelectChapter={(ch) => { setSelectedChapter(ch); setShowCommandPalette(false); }}
          onClose={() => setShowCommandPalette(false)}
          selectedBook={selectedBook}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
