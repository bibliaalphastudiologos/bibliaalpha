import { cn } from '../App';
import * as React from 'react';
import {
  X, PenLine, Bold, Italic, List, Heading1, Heading2, Heading3, Quote, Link2,
  CheckSquare, Square, Trash2, Plus, BookOpen, Search,
  Download, FileText, RefreshCw, Underline, Hash,
  Clock, Sparkles, BookMarked, Settings2, Save,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ListOrdered, Strikethrough, Printer, Highlighter, Palette,
  ChevronDown, Type, RotateCcw, Minus,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: 'alta' | 'media' | 'baixa';
  createdAt: number;
  tag?: string;
}

interface DictEntry {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string; synonyms?: string[] }[];
  }[];
}

interface WikiResult {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnail?: { source: string };
}

type Tab = 'notas' | 'tarefas' | 'dicionario' | 'enciclopedia';

interface NotepadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chapterContext: string;
}

// ── Termos teológicos para autocomplete ──────────────────────────────────────

const TEOLOGICAL_TERMS: string[] = [
  'Soteriologia','Escatologia','Pneumatologia','Cristologia','Eclesiologia',
  'Hermenêutica','Exegese','Isagógica','Apologética','Teologia Sistemática',
  'Providência divina','Eleição','Predestinação','Justificação','Santificação',
  'Glorificação','Regeneração','Reconciliação','Propiciação','Expiação',
  'Encarnação','Kenose','Hipostática','Trindade','Pericóresis',
  'Inspiração','Inerrância','Infabilidade','Canonicidade','Deuterocanônico',
  'Aliança','Novo Pacto','Antigo Testamento','Novo Testamento','Pentateuco',
  'Profético','Apocalíptico','Evangelhos Sinóticos','Epístola','Salmos',
  'Graça irresistível','Livre-arbítrio','Monergismo','Sinergismo','Arminianismo',
  'Calvinismo','Covenant Theology','Dispensacionalismo','Premilenarismo',
  'Pós-milenarismo','Amilenarismo','Parousia','Rapto','Grande Tribulação',
  'Milênio','Nova Jerusalém','Ressurreição','Juízo Final','Eternidade',
  'Batismo','Ceia do Senhor','Sacramento','Ordenança','Unção',
  'Dons espirituais','Frutificação','Arrependimento','Conversão','Fé salvífica',
  'Discipulado','Mordomia cristã','Koinonia','Ágape','Exorcismo',
  'Intercessão','Adoração','Doxologia','Kerygma','Heresia','Ortodoxia',
  'Cisma','Concílio','Credo','Imago Dei','Pecado original','Depravação total',
  'Queda','Redenção','Messias','Logos','Emanuel','Parákletos',
  'Yahweh','Elohim','Adonai','Shekinah','Tabernáculo','Templo',
  'Sacrifício','Holocausto','Sola Scriptura','Sola Fide','Sola Gratia',
  'Solo Christus','Soli Deo Gloria',
];

// ── Dicionário de Português ──────────────────────────────────────────────────

async function lookupPortugueseWord(word: string): Promise<DictEntry | null> {
  const clean = word.trim().toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ\-]/gi, '');
  if (!clean) return null;
  try {
    const enc = encodeURIComponent(clean);
    const res = await fetch(`https://pt.wiktionary.org/api/rest_v1/page/summary/${enc}`, { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const d = await res.json();
      if (d.extract && d.extract.length > 20 && !d.type?.includes('disambiguation')) {
        const lines = d.extract.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 15 && !l.match(/^(==|\*\*|Língua|Pronúncia|Forma)/));
        if (lines.length > 0) return { word: d.titles?.normalized || clean, meanings: [{ partOfSpeech: 'definição', definitions: lines.slice(0, 5).map((l: string) => ({ definition: l })) }] };
      }
    }
  } catch {}
  try {
    const params = new URLSearchParams({ action: 'parse', page: clean, prop: 'sections|wikitext', format: 'json', origin: '*' });
    const res2 = await fetch(`https://pt.wiktionary.org/w/api.php?${params}`);
    if (res2.ok) {
      const d2 = await res2.json();
      const wikitext: string = d2.parse?.wikitext?.['*'] || '';
      if (wikitext.length > 50) {
        const defs = wikitext.split('\n').filter((l: string) => l.startsWith('# ') && !l.startsWith('## ')).map((l: string) => l.replace(/^# /, '').replace(/\[\[([^|\]]+)[^\]]*\]\]/g, '$1').replace(/\{\{[^}]+\}\}/g, '').trim()).filter((l: string) => l.length > 10).slice(0, 6);
        const posMatch = wikitext.match(/==+\s*(Substantivo|Verbo|Adjetivo|Advérbio|Pronome|Preposição|Conjunção|Interjeição)\s*==+/i);
        if (defs.length > 0) return { word: clean, meanings: [{ partOfSpeech: posMatch ? posMatch[1].toLowerCase() : 'palavra', definitions: defs.map(d => ({ definition: d })) }] };
      }
    }
  } catch {}
  return null;
}

async function searchEncyclopedia(query: string): Promise<WikiResult[]> {
  try {
    const params = new URLSearchParams({ action: 'opensearch', search: query, limit: '8', format: 'json', origin: '*' });
    const res = await fetch(`https://pt.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const titles: string[] = data[1] || [];
    const descs: string[] = data[2] || [];
    const urls: string[] = data[3] || [];
    return titles.map((t, i) => ({ title: t, extract: descs[i] || '', pageUrl: urls[i] || '' }));
  } catch { return []; }
}

async function getEncyclopediaArticle(title: string): Promise<WikiResult | null> {
  try {
    const enc = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${enc}`);
    if (!res.ok) return null;
    const d = await res.json();
    return { title: d.title, extract: d.extract || '', pageUrl: d.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${enc}`, thumbnail: d.thumbnail };
  } catch { return null; }
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function exportFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function htmlToText(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const PRIORITY_COLOR: Record<string, string> = { alta: 'text-red-500', media: 'text-yellow-500', baixa: 'text-green-500' };
const PRIORITY_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

// ── Toolbar Button ────────────────────────────────────────────────────────────

interface ToolbarBtnProps {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}
function ToolbarBtn({ title, onClick, active, children, className }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        'p-1.5 rounded transition-colors text-[13px] select-none',
        active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700',
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function NotepadPanel({ isOpen, onClose, chapterContext }: NotepadPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('notas');

  // ── Notas (Rich Text) ──
  const [noteHTML, setNoteHTML] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [autoSaved, setAutoSaved] = useState<Date | null>(null);
  const [autocompleteOn, setAutocompleteOn] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fontSize, setFontSize] = useState('14');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const noteKey = `nota_html_${chapterContext}`;

  // ── Tarefas ──
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('media');
  const [taskFilter, setTaskFilter] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');

  // ── Dicionário ──
  const [dictQuery, setDictQuery] = useState('');
  const [dictResult, setDictResult] = useState<DictEntry | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState('');

  // ── Enciclopédia ──
  const [encQuery, setEncQuery] = useState('');
  const [encResults, setEncResults] = useState<WikiResult[]>([]);
  const [encArticle, setEncArticle] = useState<WikiResult | null>(null);
  const [encLoading, setEncLoading] = useState(false);

  // ── Configurações ──
  const [showSettings, setShowSettings] = useState(false);

  // Load nota — Firestore primeiro, fallback localStorage
  useEffect(() => {
    let isMounted = true;
    async function loadNote() {
      if (user?.uid) {
        try {
          const safeKey = chapterContext.replace(/[^a-zA-Z0-9_]/g, '_');
          const ref = doc(db, 'users', user.uid, 'notes', safeKey);
          const snap = await getDoc(ref);
          if (!isMounted) return;
          if (snap.exists()) {
            const saved = snap.data().htmlContent ?? snap.data().content ?? '';
            setNoteHTML(saved);
            if (editorRef.current) editorRef.current.innerHTML = saved;
            localStorage.setItem(noteKey, saved);
            return;
          }
        } catch (e) { console.warn('[Notes] Falha ao ler Firestore:', e); }
      }
      const saved = localStorage.getItem(noteKey) || localStorage.getItem(`nota_${chapterContext}`) || '';
      if (isMounted) {
        setNoteHTML(saved);
        if (editorRef.current) editorRef.current.innerHTML = saved;
      }
    }
    loadNote();
    return () => { isMounted = false; };
  }, [chapterContext, user]);

  // Load tarefas
  useEffect(() => {
    let isMounted = true;
    async function loadTasks() {
      if (user?.uid) {
        try {
          const ref = doc(db, 'users', user.uid, 'tasks', 'notepad');
          const snap = await getDoc(ref);
          if (!isMounted) return;
          if (snap.exists()) {
            const saved = snap.data().tasks ?? [];
            setTasks(saved);
            localStorage.setItem('notepad_tasks', JSON.stringify(saved));
            return;
          }
        } catch (e) { console.warn('[Tasks] Falha ao ler Firestore:', e); }
      }
      try {
        const saved = localStorage.getItem('notepad_tasks');
        if (saved && isMounted) setTasks(JSON.parse(saved));
      } catch {}
    }
    loadTasks();
    return () => { isMounted = false; };
  }, [user]);

  // Auto-save notas
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(noteKey, noteHTML);
      setAutoSaved(new Date());
      const plainText = htmlToText(noteHTML);
      setWordCount(plainText.trim().split(/\s+/).filter(Boolean).length);
      setCharCount(plainText.length);
      if (user?.uid) {
        const safeKey = chapterContext.replace(/[^a-zA-Z0-9_]/g, '_');
        const ref = doc(db, 'users', user.uid, 'notes', safeKey);
        setDoc(ref, { htmlContent: noteHTML, content: plainText, updatedAt: new Date().toISOString() }, { merge: true })
          .catch(e => console.warn('[Notes] Erro ao salvar no Firestore:', e));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [noteHTML, noteKey, user, chapterContext]);

  // Auto-save tarefas
  useEffect(() => {
    localStorage.setItem('notepad_tasks', JSON.stringify(tasks));
    if (user?.uid) {
      const ref = doc(db, 'users', user.uid, 'tasks', 'notepad');
      setDoc(ref, { tasks, updatedAt: new Date().toISOString() }, { merge: true })
        .catch(e => console.warn('[Tasks] Erro ao salvar no Firestore:', e));
    }
  }, [tasks, user]);

  // Editor input handler
  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setNoteHTML(html);

    if (!autocompleteOn) { setShowSuggestions(false); return; }
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const textBefore = range.startContainer.textContent?.slice(0, range.startOffset) || '';
    const lastWord = textBefore.split(/[\s\n,.:;!?'"()\[\]]/).pop() || '';
    if (lastWord.length >= 3) {
      const lower = lastWord.toLowerCase();
      const sugs = TEOLOGICAL_TERMS.filter(t => t.toLowerCase().startsWith(lower) || t.toLowerCase().includes(lower)).slice(0, 6);
      setSuggestions(sugs);
      setSuggestionIdx(0);
      setShowSuggestions(sugs.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [autocompleteOn]);

  // Apply autocomplete suggestion
  const applySuggestion = useCallback((term: string) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;
    const textBefore = node.textContent?.slice(0, offset) || '';
    const lastWordMatch = textBefore.match(/[\w\u00C0-\u017F]+$/);
    if (!lastWordMatch) return;
    const start = offset - lastWordMatch[0].length;
    range.setStart(node, start);
    range.setEnd(node, offset);
    range.deleteContents();
    range.insertNode(document.createTextNode(term));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    setShowSuggestions(false);
    setNoteHTML(editorRef.current.innerHTML);
  }, []);

  // execCommand wrapper
  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    if (editorRef.current) setNoteHTML(editorRef.current.innerHTML);
  }, []);

  // Keyboard shortcuts
  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestionIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (suggestions[suggestionIdx]) { e.preventDefault(); applySuggestion(suggestions[suggestionIdx]); return; }
      }
      if (e.key === 'Escape') { setShowSuggestions(false); return; }
    }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); exec('bold'); break;
        case 'i': e.preventDefault(); exec('italic'); break;
        case 'u': e.preventDefault(); exec('underline'); break;
        case 'z': break; // allow native undo
        case 'y': break; // allow native redo
      }
    }
  }, [showSuggestions, suggestions, suggestionIdx, applySuggestion, exec]);

  // Insert content at cursor
  const insertAtCursor = (html: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement('div');
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let lastNode: Node | null = null;
      while (el.firstChild) { lastNode = el.firstChild; frag.appendChild(el.firstChild); }
      range.insertNode(frag);
      if (lastNode) { range.setStartAfter(lastNode); range.collapse(true); sel.removeAllRanges(); sel.addRange(range); }
    } else {
      document.execCommand('insertHTML', false, html);
    }
    if (editorRef.current) setNoteHTML(editorRef.current.innerHTML);
  };

  // Print note
  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Notas — ${chapterContext}</title><style>
      body { font-family: 'Georgia', serif; font-size: 14px; line-height: 1.8; max-width: 700px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
      h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 8px; }
      h2 { font-size: 18px; color: #1e40af; }
      h3 { font-size: 15px; color: #374151; }
      blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; color: #4b5563; font-style: italic; margin: 16px 0; }
      @media print { body { margin: 20px; } }
    </style></head><body>
      <h1>Notas — ${chapterContext}</h1>
      ${editorRef.current?.innerHTML || ''}
      <hr style="margin-top:40px;border-color:#eee" />
      <p style="font-size:11px;color:#999">Bíblia Alpha de Estudos · ${new Date().toLocaleDateString('pt-BR')}</p>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleExportHtml = () => {
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Notas — ${chapterContext}</title></head><body>${editorRef.current?.innerHTML || ''}</body></html>`;
    exportFile(html, `Notas_${chapterContext.replace(/\s/g,'_')}.html`, 'text/html');
  };
  const handleExportTxt = () => {
    exportFile(`Notas — ${chapterContext}\n${'='.repeat(40)}\n\n${htmlToText(noteHTML)}`, `Notas_${chapterContext.replace(/\s/g,'_')}.txt`);
  };
  const handleExportTasks = () => {
    const lines = tasks.map(t => `[${t.done ? 'x' : ' '}] (${t.priority.toUpperCase()}) ${t.text}`).join('\n');
    exportFile(`Tarefas — BíbliaAlpha\n${'='.repeat(40)}\n\n${lines}`, 'Tarefas_BíbliaAlpha.txt');
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: uid(), text: newTask.trim(), done: false, priority: taskPriority, createdAt: Date.now() }]);
    setNewTask('');
  };
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const filteredTasks = tasks.filter(t => taskFilter === 'todas' ? true : taskFilter === 'pendentes' ? !t.done : t.done)
    .sort((a, b) => ({ alta: 0, media: 1, baixa: 2 }[a.priority] - { alta: 0, media: 1, baixa: 2 }[b.priority]));

  const handleDictSearch = async () => {
    if (!dictQuery.trim()) return;
    setDictLoading(true); setDictError(''); setDictResult(null);
    const res = await lookupPortugueseWord(dictQuery);
    setDictLoading(false);
    if (res) setDictResult(res); else setDictError('Palavra não encontrada. Tente outra grafia.');
  };
  const handleEncSearch = async () => {
    if (!encQuery.trim()) return;
    setEncLoading(true); setEncArticle(null);
    const results = await searchEncyclopedia(encQuery);
    setEncResults(results); setEncLoading(false);
  };
  const handleEncArticle = async (title: string) => {
    setEncLoading(true);
    const art = await getEncyclopediaArticle(title);
    setEncArticle(art); setEncLoading(false);
  };

  const tabClass = (t: Tab) => cn('notepad-tab', activeTab === t ? 'active' : '');

  const TEXT_COLORS = ['#000000','#1e40af','#dc2626','#16a34a','#7c3aed','#c2410c','#0891b2','#be185d','#6b7280'];
  const HIGHLIGHT_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#fecdd3','#e9d5ff','#fed7aa','transparent'];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={onClose} />}
      <div className={cn(
        'fixed inset-y-0 right-0 w-[90vw] sm:w-[500px] bg-white shadow-2xl border-l border-gray-200 z-50 transition-transform duration-300 ease-in-out flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}>
        {/* Header */}
        <header className="h-12 shrink-0 border-b border-gray-200 flex items-center justify-between px-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2 font-semibold text-[13px] text-gray-800">
            <PenLine size={15} className="text-blue-600" />
            <span>Bloco de Estudos</span>
            <span className="text-[11px] text-gray-400 font-normal truncate max-w-[120px]">— {chapterContext}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(s => !s)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500" title="Configurações">
              <Settings2 size={15} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-red-50 rounded-md text-gray-500 hover:text-red-500 transition-colors">
              <X size={15} />
            </button>
          </div>
        </header>

        {/* Settings dropdown */}
        {showSettings && (
          <div className="shrink-0 border-b border-gray-200 bg-slate-50 px-4 py-3 flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Configurações</p>
            <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={autocompleteOn} onChange={e => setAutocompleteOn(e.target.checked)} className="accent-blue-600" />
              <Sparkles size={13} className="text-blue-500" />
              Autocomplete teológico (sugestões ao digitar)
            </label>
          </div>
        )}

        {/* Tabs */}
        <div className="shrink-0 px-3 py-2 border-b border-gray-200 bg-white">
          <div className="notepad-tab-bar">
            <button className={tabClass('notas')} onClick={() => setActiveTab('notas')}><PenLine size={13} /> Notas</button>
            <button className={tabClass('tarefas')} onClick={() => setActiveTab('tarefas')}><CheckSquare size={13} /> Tarefas</button>
            <button className={tabClass('dicionario')} onClick={() => setActiveTab('dicionario')}><BookOpen size={13} /> Dicionário</button>
            <button className={tabClass('enciclopedia')} onClick={() => setActiveTab('enciclopedia')}><BookMarked size={13} /> Enciclopédia</button>
          </div>
        </div>

        {/* ── ABA NOTAS — Rich Text Editor ── */}
        {activeTab === 'notas' && (
          <>
            {/* ── Toolbar Row 1: Text formatting ── */}
            <div className="shrink-0 border-b border-gray-200 bg-gray-50">
              {/* Row 1 */}
              <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-gray-100">
                {/* History */}
                <ToolbarBtn title="Desfazer (Ctrl+Z)" onClick={() => exec('undo')}><RotateCcw size={13} /></ToolbarBtn>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />

                {/* Font size */}
                <select
                  value={fontSize}
                  onChange={e => { setFontSize(e.target.value); exec('fontSize', '3'); /* placeholder */ }}
                  onMouseDown={e => e.stopPropagation()}
                  className="text-[11px] border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-700 outline-none focus:ring-1 focus:ring-blue-400"
                  title="Tamanho da fonte"
                  style={{ width: '52px' }}
                >
                  {['10','11','12','13','14','16','18','20','24','28','32','36'].map(s => <option key={s} value={s}>{s}px</option>)}
                </select>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />

                {/* Style buttons */}
                <ToolbarBtn title="Negrito (Ctrl+B)" onClick={() => exec('bold')}><Bold size={13} /></ToolbarBtn>
                <ToolbarBtn title="Itálico (Ctrl+I)" onClick={() => exec('italic')}><Italic size={13} /></ToolbarBtn>
                <ToolbarBtn title="Sublinhado (Ctrl+U)" onClick={() => exec('underline')}><Underline size={13} /></ToolbarBtn>
                <ToolbarBtn title="Tachado" onClick={() => exec('strikeThrough')}><Strikethrough size={13} /></ToolbarBtn>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />

                {/* Colors */}
                <div className="relative">
                  <ToolbarBtn title="Cor do texto" onClick={() => { setShowHighlightPicker(false); setShowColorPicker(c => !c); }}>
                    <div className="flex flex-col items-center gap-0.5">
                      <Palette size={12} />
                      <div className="w-4 h-1 rounded" style={{ background: '#1e40af' }} />
                    </div>
                  </ToolbarBtn>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 flex flex-wrap gap-1" style={{ width: '118px' }}>
                      {TEXT_COLORS.map(c => (
                        <button key={c} onMouseDown={e => { e.preventDefault(); exec('foreColor', c); setShowColorPicker(false); }}
                          className="w-7 h-7 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ background: c }} title={c} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <ToolbarBtn title="Destacar texto" onClick={() => { setShowColorPicker(false); setShowHighlightPicker(c => !c); }}>
                    <div className="flex flex-col items-center gap-0.5">
                      <Highlighter size={12} />
                      <div className="w-4 h-1 rounded" style={{ background: '#fef08a' }} />
                    </div>
                  </ToolbarBtn>
                  {showHighlightPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 flex flex-wrap gap-1" style={{ width: '118px' }}>
                      {HIGHLIGHT_COLORS.map(c => (
                        <button key={c} onMouseDown={e => {
                            e.preventDefault();
                            if (c === 'transparent') exec('removeFormat');
                            else exec('hiliteColor', c);
                            setShowHighlightPicker(false);
                          }}
                          className={cn('w-7 h-7 rounded border hover:scale-110 transition-transform', c === 'transparent' ? 'border-gray-300' : 'border-gray-200')}
                          style={{ background: c === 'transparent' ? 'white' : c }}
                          title={c === 'transparent' ? 'Remover destaque' : c}
                        >
                          {c === 'transparent' && <Minus size={12} className="text-gray-400 mx-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Headings, Lists, Alignment, Insert */}
              <div className="flex flex-wrap items-center gap-0.5 px-2 py-1">
                <ToolbarBtn title="Título 1" onClick={() => exec('formatBlock', 'h1')}><Heading1 size={13} /></ToolbarBtn>
                <ToolbarBtn title="Título 2" onClick={() => exec('formatBlock', 'h2')}><Heading2 size={13} /></ToolbarBtn>
                <ToolbarBtn title="Título 3" onClick={() => exec('formatBlock', 'h3')}><Heading3 size={13} /></ToolbarBtn>
                <ToolbarBtn title="Parágrafo normal" onClick={() => exec('formatBlock', 'p')}><Type size={13} /></ToolbarBtn>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <ToolbarBtn title="Lista com marcadores" onClick={() => exec('insertUnorderedList')}><List size={13} /></ToolbarBtn>
                <ToolbarBtn title="Lista numerada" onClick={() => exec('insertOrderedList')}><ListOrdered size={13} /></ToolbarBtn>
                <ToolbarBtn title="Citação / Versículo" onClick={() => exec('formatBlock', 'blockquote')}><Quote size={13} /></ToolbarBtn>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <ToolbarBtn title="Alinhar à esquerda" onClick={() => exec('justifyLeft')}><AlignLeft size={13} /></ToolbarBtn>
                <ToolbarBtn title="Centralizar" onClick={() => exec('justifyCenter')}><AlignCenter size={13} /></ToolbarBtn>
                <ToolbarBtn title="Alinhar à direita" onClick={() => exec('justifyRight')}><AlignRight size={13} /></ToolbarBtn>
                <ToolbarBtn title="Justificar" onClick={() => exec('justifyFull')}><AlignJustify size={13} /></ToolbarBtn>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <ToolbarBtn title="Inserir capítulo atual" onClick={() => insertAtCursor(`<p><strong>📖 ${chapterContext}</strong></p>`)}>
                  <Link2 size={13} />
                </ToolbarBtn>
                <ToolbarBtn title="Inserir data atual" onClick={() => insertAtCursor(`<span style="color:#6b7280;font-size:12px"> [${new Date().toLocaleDateString('pt-BR')}] </span>`)}>
                  <Clock size={13} />
                </ToolbarBtn>
                <ToolbarBtn title="Inserir divisor" onClick={() => insertAtCursor('<hr style="border:none;border-top:2px solid #e5e7eb;margin:12px 0" />')}>
                  <Minus size={13} />
                </ToolbarBtn>
              </div>
            </div>

            {/* ── Editor area — Word-like page ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-100 p-4 relative">
              {/* Autocomplete suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-6 top-2 bg-white border border-gray-200 shadow-xl rounded-lg z-20 w-72 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border-b border-gray-100">
                    <Sparkles size={11} className="text-blue-500" />
                    <span className="text-[10px] text-blue-700 font-semibold">Termos Teológicos — Tab para aceitar</span>
                  </div>
                  {suggestions.map((s, i) => (
                    <button key={s} onMouseDown={e => { e.preventDefault(); applySuggestion(s); }}
                      className={cn('w-full text-left px-3 py-1.5 text-[12px] transition-colors', i === suggestionIdx ? 'bg-blue-50 text-blue-800 font-medium' : 'hover:bg-gray-50 text-gray-700')}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Page */}
              <div className="min-h-[600px] bg-white rounded-lg shadow-md mx-auto" style={{ maxWidth: '440px', padding: '32px 36px' }}>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onKeyDown={handleEditorKeyDown}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onClick={() => { setShowColorPicker(false); setShowHighlightPicker(false); }}
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.8', minHeight: '540px', outline: 'none', fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  className="word-editor text-gray-900 focus:outline-none"
                  data-placeholder={`Escreva seus insights, notas de estudo e rascunhos sobre ${chapterContext}…\n\nDica: use a barra de ferramentas acima para formatar o texto.`}
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="shrink-0 px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
              <div className="text-[10px] text-gray-400 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Save size={10} />
                  {autoSaved ? `Salvo ${autoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : <span className="opacity-40">Não salvo</span>}
                </span>
                <span>{wordCount} palavras</span>
                <span>{charCount} caracteres</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handlePrint} title="Imprimir"
                  className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded hover:bg-white transition-colors">
                  <Printer size={11} />
                </button>
                <button onClick={handleExportHtml} title="Exportar .html"
                  className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded hover:bg-white transition-colors">
                  <FileText size={11} /> .html
                </button>
                <button onClick={handleExportTxt} title="Exportar .txt"
                  className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded hover:bg-white transition-colors">
                  <Download size={11} /> .txt
                </button>
              </div>
            </footer>
          </>
        )}

        {/* ── ABA TAREFAS ── */}
        {activeTab === 'tarefas' && (
          <>
            <div className="shrink-0 p-3 border-b border-gray-200 bg-gray-50 space-y-2">
              <div className="flex gap-2">
                <input
                  value={newTask} onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Nova tarefa de estudo…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
                <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as Task['priority'])}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none text-gray-700">
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Média</option>
                  <option value="baixa">🟢 Baixa</option>
                </select>
                <button onClick={addTask} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex gap-1">
                {(['todas','pendentes','concluidas'] as const).map(f => (
                  <button key={f} onClick={() => setTaskFilter(f)}
                    className={cn('text-[10px] px-2 py-0.5 rounded capitalize transition-colors',
                      taskFilter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700')}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5 bg-white">
              {filteredTasks.length === 0 && (
                <div className="text-center text-[13px] text-gray-400 py-10">
                  <CheckSquare size={32} className="mx-auto mb-2 opacity-20" />
                  {taskFilter === 'todas' ? 'Nenhuma tarefa ainda.' : `Nenhuma tarefa ${taskFilter}.`}
                </div>
              )}
              {filteredTasks.map(task => (
                <div key={task.id} className={cn('flex items-start gap-2 p-2.5 rounded-lg border transition-colors',
                  task.done ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200 hover:border-blue-200')}>
                  <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                    {task.done ? <CheckSquare size={16} className="text-green-500" /> : <Square size={16} className="text-gray-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] break-words', task.done && 'line-through text-gray-400')}>{task.text}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[10px] font-medium', PRIORITY_COLOR[task.priority])}>● {PRIORITY_LABEL[task.priority]}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={9} /> {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="shrink-0 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <footer className="shrink-0 px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">{tasks.filter(t => !t.done).length} pendente(s) · {tasks.filter(t => t.done).length} concluída(s)</span>
              <button onClick={handleExportTasks} className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded transition-colors">
                <Download size={11} /> Exportar
              </button>
            </footer>
          </>
        )}

        {/* ── ABA DICIONÁRIO ── */}
        {activeTab === 'dicionario' && (
          <>
            <div className="shrink-0 p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <input value={dictQuery} onChange={e => setDictQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDictSearch()}
                  placeholder="Digite uma palavra em português…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-blue-400 bg-white" />
                <button onClick={handleDictSearch} disabled={dictLoading}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {dictLoading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Dicionário de Português · fonte: Wikcionário PT</p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-white">
              {!dictResult && !dictError && !dictLoading && (
                <div className="text-center text-[13px] text-gray-400 py-10"><BookOpen size={32} className="mx-auto mb-2 opacity-20" />Busque qualquer palavra em português.</div>
              )}
              {dictError && <p className="text-[13px] text-red-500 text-center py-6">{dictError}</p>}
              {dictResult && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-[22px] font-bold text-gray-900">{dictResult.word}</h2>
                    {dictResult.phonetic && <p className="text-[13px] text-blue-600 font-mono">{dictResult.phonetic}</p>}
                  </div>
                  {dictResult.meanings.map((m, mi) => (
                    <div key={mi}>
                      <span className="inline-block bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded mb-2">{m.partOfSpeech}</span>
                      <ol className="space-y-2">
                        {m.definitions.map((d, di) => (
                          <li key={di} className="text-[13px]">
                            <span className="font-medium text-gray-400 mr-1">{di + 1}.</span>
                            <span className="text-gray-800">{d.definition}</span>
                            {d.example && <p className="text-[12px] text-gray-500 italic mt-0.5 pl-3 border-l-2 border-gray-200">"{d.example}"</p>}
                            {d.synonyms && d.synonyms.length > 0 && <p className="text-[11px] text-green-700 mt-0.5">Sinônimos: {d.synonyms.join(', ')}</p>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                    <button onClick={() => {
                        const txt = `<p><strong>📖 Dicionário: ${dictResult.word}</strong></p><p>${dictResult.meanings.map(m => `[${m.partOfSpeech}] ${m.definitions.map((d,i) => `${i+1}. ${d.definition}`).join('; ')}`).join('<br/>')}</p>`;
                        if (editorRef.current) { editorRef.current.focus(); document.execCommand('insertHTML', false, txt); setNoteHTML(editorRef.current.innerHTML); }
                        setActiveTab('notas');
                      }}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                      <Plus size={11} /> Inserir nas Notas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── ABA ENCICLOPÉDIA ── */}
        {activeTab === 'enciclopedia' && (
          <>
            <div className="shrink-0 p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <input value={encQuery} onChange={e => setEncQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEncSearch()}
                  placeholder="Buscar na Wikipedia PT… ex: Calvário"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-blue-400 bg-white" />
                <button onClick={handleEncSearch} disabled={encLoading}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {encLoading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Wikipedia em Português · enciclopédia livre</p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-white">
              {encArticle && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {encArticle.thumbnail && <img src={encArticle.thumbnail.source} alt={encArticle.title} className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0" />}
                    <div>
                      <h2 className="text-[16px] font-bold text-gray-900">{encArticle.title}</h2>
                      <p className="text-[12px] text-gray-600 leading-relaxed mt-1">{encArticle.extract}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <a href={encArticle.pageUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                      <Link2 size={11} /> Artigo completo
                    </a>
                    <button onClick={() => {
                        const txt = `<p><strong>📚 ${encArticle.title}</strong></p><p>${encArticle.extract}</p><p style="font-size:11px;color:#9ca3af">Fonte: ${encArticle.pageUrl}</p>`;
                        if (editorRef.current) { editorRef.current.focus(); document.execCommand('insertHTML', false, txt); setNoteHTML(editorRef.current.innerHTML); }
                        setActiveTab('notas');
                      }}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"><Plus size={11} /> Inserir nas Notas
                    </button>
                    <button onClick={() => { setEncArticle(null); }} className="text-[11px] text-gray-400 hover:underline flex items-center gap-1 ml-auto">← Voltar</button>
                  </div>
                </div>
              )}
              {!encArticle && encResults.length > 0 && (
                <div className="space-y-1.5">
                  {encResults.map((r, i) => (
                    <button key={i} onClick={() => handleEncArticle(r.title)}
                      className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
                      <p className="text-[13px] font-medium text-gray-800">{r.title}</p>
                      {r.extract && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{r.extract}</p>}
                    </button>
                  ))}
                </div>
              )}
              {!encArticle && encResults.length === 0 && !encLoading && (
                <div className="text-center text-[13px] text-gray-400 py-10">
                  <BookMarked size={32} className="mx-auto mb-2 opacity-20" />
                  Busque qualquer tema bíblico, histórico ou teológico.
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {['Calvário','Apóstolo Paulo','Salomão','Êxodo','Trindade','Pentecostes'].map(s => (
                      <button key={s} onClick={() => { setEncQuery(s); }}
                        className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
