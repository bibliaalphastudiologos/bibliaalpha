import { cn } from '../App';
import * as React from 'react';
import {
  X, PenLine, Bold, Italic, List, Heading1, Quote, Link2,
  CheckSquare, Square, Trash2, Plus, BookOpen, Search,
  Download, FileText, RefreshCw, Underline, Hash,
  ChevronDown, ChevronUp, Star, Clock, Sparkles,
  BookMarked, FlaskConical, Settings2, Save,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

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
  'Dons espirituais','Frutificação','Arrepndimento','Conversão','Fé salvífica',
  'Arrependimento','Discipulado','Mordomia cristã','Koinonia','Ágape',
  'Exorcismo','Intercessão','Adoração','Doxologia','Kerygma',
  'Heresia','Ortodoxia','Cisma','Concílio','Credo',
  'Imago Dei','Pecado original','Depravação total','Queda','Redenção',
  'Messias','Logos','Emanuel','Parákletos','Yahweh','Elohim','Adonai',
  'Shekinah','Tabernáculo','Templo','Sacrifício','Holocausto','Levítico',
  'Sola Scriptura','Sola Fide','Sola Gratia','Solo Christus','Soli Deo Gloria',
];

function getAutocompleteSuggestions(word: string): string[] {
  if (!word || word.length < 3) return [];
  const lower = word.toLowerCase();
  return TEOLOGICAL_TERMS.filter(t =>
    t.toLowerCase().startsWith(lower) || t.toLowerCase().includes(lower)
  ).slice(0, 6);
}

// ── Dicionário de Português (Wiktionary PT primary + fallback estruturado) ──

async function lookupPortugueseWord(word: string): Promise<DictEntry | null> {
  const clean = word.trim().toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ\-]/gi, '');
  if (!clean) return null;

  // 1. Wiktionary PT REST API — retorna conteúdo estruturado
  try {
    const enc = encodeURIComponent(clean);
    const res = await fetch(
      `https://pt.wiktionary.org/api/rest_v1/page/summary/${enc}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (res.ok) {
      const d = await res.json();
      if (d.extract && d.extract.length > 20 && !d.type?.includes('disambiguation')) {
        // Parse extract: linhas sem cabeçalho são as definições
        const lines = d.extract
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 15 && !l.match(/^(==|\*\*|Língua|Pronúncia|Forma)/));
        if (lines.length > 0) {
          return {
            word: d.titles?.normalized || clean,
            phonetic: undefined,
            meanings: [{
              partOfSpeech: 'definição',
              definitions: lines.slice(0, 5).map((l: string) => ({ definition: l })),
            }],
          };
        }
      }
    }
  } catch {}

  // 2. Wiktionary PT action=parse — extrai seções detalhadas
  try {
    const params = new URLSearchParams({
      action: 'parse', page: clean, prop: 'sections|wikitext',
      format: 'json', origin: '*',
    });
    const res2 = await fetch(`https://pt.wiktionary.org/w/api.php?${params}`);
    if (res2.ok) {
      const d2 = await res2.json();
      const wikitext: string = d2.parse?.wikitext?.['*'] || '';
      if (wikitext.length > 50) {
        // Extrai definições após "# " (estilo wikitext)
        const defs = wikitext
          .split('\n')
          .filter((l: string) => l.startsWith('# ') && !l.startsWith('## '))
          .map((l: string) => l.replace(/^# /, '').replace(/\[\[([^|\]]+)[^\]]*\]\]/g, '$1').replace(/\{\{[^}]+\}\}/g, '').trim())
          .filter((l: string) => l.length > 10)
          .slice(0, 6);

        // Tenta detectar classe gramatical
        const posMatch = wikitext.match(/==+\s*(Substantivo|Verbo|Adjetivo|Advérbio|Pronome|Preposição|Conjunção|Interjeição)\s*==+/i);
        const pos = posMatch ? posMatch[1].toLowerCase() : 'palavra';

        if (defs.length > 0) {
          return {
            word: clean,
            meanings: [{ partOfSpeech: pos, definitions: defs.map(d => ({ definition: d })) }],
          };
        }
      }
    }
  } catch {}

  // 3. Wiktionary PT opensearch — sugestões de palavras similares
  try {
    const params3 = new URLSearchParams({
      action: 'query', titles: clean, prop: 'extracts',
      exintro: '1', explaintext: '1', format: 'json', origin: '*',
    });
    const res3 = await fetch(`https://pt.wiktionary.org/w/api.php?${params3}`);
    if (res3.ok) {
      const d3 = await res3.json();
      const pages = Object.values(d3.query?.pages || {}) as any[];
      const page = pages[0];
      if (page && page.extract && !page.missing) {
        const lines = page.extract
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 20)
          .slice(0, 5);
        if (lines.length > 0) {
          return {
            word: page.title || clean,
            meanings: [{ partOfSpeech: 'verbete', definitions: lines.map((l: string) => ({ definition: l })) }],
          };
        }
      }
    }
  } catch {}

  return null;
}

// ── Enciclopédia (Wikipedia PT) ──────────────────────────────────────────────

async function searchEncyclopedia(query: string): Promise<WikiResult[]> {
  try {
    const params = new URLSearchParams({
      action: 'opensearch', search: query, limit: '8', format: 'json', origin: '*',
    });
    const res = await fetch(`https://pt.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const titles: string[] = data[1] || [];
    const descs: string[] = data[2] || [];
    const urls: string[] = data[3] || [];
    return titles.map((t, i) => ({ title: t, extract: descs[i] || '', pageUrl: urls[i] || '', thumbnail: undefined }));
  } catch { return []; }
}

async function getEncyclopediaArticle(title: string): Promise<WikiResult | null> {
  try {
    const enc = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${enc}`);
    if (!res.ok) return null;
    const d = await res.json();
    return {
      title: d.title,
      extract: d.extract || '',
      pageUrl: d.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${enc}`,
      thumbnail: d.thumbnail,
    };
  } catch { return null; }
}

// ── Utilitários ──────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

function exportFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

const PRIORITY_COLOR: Record<string, string> = {
  alta: 'text-red-500', media: 'text-yellow-500', baixa: 'text-green-500',
};
const PRIORITY_LABEL: Record<string, string> = {
  alta: 'Alta', media: 'Média', baixa: 'Baixa',
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function NotepadPanel({ isOpen, onClose, chapterContext }: NotepadPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('notas');

  // ── Notas ──
  const [noteContent, setNoteContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [autoSaved, setAutoSaved] = useState<Date | null>(null);
  const [autocompleteOn, setAutocompleteOn] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteKey = `nota_${chapterContext}`;

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

  // Load nota do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(noteKey);
    if (saved !== null) setNoteContent(saved);
    else setNoteContent('');
  }, [chapterContext]);

  // Load tarefas do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('notepad_tasks');
      if (saved) setTasks(JSON.parse(saved));
    } catch {}
  }, []);

  // Auto-save notas
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(noteKey, noteContent);
      setAutoSaved(new Date());
      const words = noteContent.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    }, 800);
    return () => clearTimeout(timer);
  }, [noteContent, noteKey]);

  // Auto-save tarefas
  useEffect(() => {
    localStorage.setItem('notepad_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Autocomplete teológico
  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    if (!autocompleteOn) { setShowSuggestions(false); return; }
    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const lastWord = before.split(/[\s\n,.:;!?'"()\[\]]/).pop() || '';
    const sugs = getAutocompleteSuggestions(lastWord);
    setSuggestions(sugs);
    setSuggestionIdx(0);
    setShowSuggestions(sugs.length > 0 && lastWord.length >= 3);
  }, [autocompleteOn]);

  const applySuggestion = (term: string) => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const pos = ta.selectionStart;
    const val = ta.value;
    const before = val.slice(0, pos);
    const lastWordMatch = before.match(/[\w\u00C0-\u017F]+$/);
    if (!lastWordMatch) return;
    const start = pos - lastWordMatch[0].length;
    const newVal = val.slice(0, start) + term + val.slice(pos);
    setNoteContent(newVal);
    setShowSuggestions(false);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + term.length;
      ta.focus();
    }, 0);
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestionIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Tab' || e.key === 'Enter') {
      if (suggestions[suggestionIdx]) { e.preventDefault(); applySuggestion(suggestions[suggestionIdx]); }
    }
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  // Inserir formatação no cursor
  const insertFormat = (before: string, after = '', placeholder = 'texto') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = noteContent.slice(start, end) || placeholder;
    const newVal = noteContent.slice(0, start) + before + selected + after + noteContent.slice(end);
    setNoteContent(newVal);
    setTimeout(() => {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
      ta.focus();
    }, 0);
  };

  // Tarefas
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: uid(), text: newTask.trim(), done: false, priority: taskPriority, createdAt: Date.now() }]);
    setNewTask('');
  };
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const filteredTasks = tasks.filter(t =>
    taskFilter === 'todas' ? true : taskFilter === 'pendentes' ? !t.done : t.done
  ).sort((a, b) => {
    const order = { alta: 0, media: 1, baixa: 2 };
    return order[a.priority] - order[b.priority];
  });

  // Dicionário
  const handleDictSearch = async () => {
    if (!dictQuery.trim()) return;
    setDictLoading(true); setDictError(''); setDictResult(null);
    const res = await lookupPortugueseWord(dictQuery);
    setDictLoading(false);
    if (res) setDictResult(res);
    else setDictError('Palavra não encontrada. Tente outra grafia.');
  };

  // Enciclopédia
  const handleEncSearch = async () => {
    if (!encQuery.trim()) return;
    setEncLoading(true); setEncArticle(null);
    const results = await searchEncyclopedia(encQuery);
    setEncResults(results);
    setEncLoading(false);
  };
  const handleEncArticle = async (title: string) => {
    setEncLoading(true);
    const art = await getEncyclopediaArticle(title);
    setEncArticle(art); setEncLoading(false);
  };

  // Export
  const handleExportTxt = () => {
    exportFile(`Notas — ${chapterContext}\n${'='.repeat(40)}\n\n${noteContent}`, `Notas_${chapterContext.replace(/\s/g,'_')}.txt`);
  };
  const handleExportMd = () => {
    exportFile(`# Notas — ${chapterContext}\n\n${noteContent}`, `Notas_${chapterContext.replace(/\s/g,'_')}.md`, 'text/markdown');
  };
  const handleExportTasks = () => {
    const lines = tasks.map(t => `[${t.done ? 'x' : ' '}] (${t.priority.toUpperCase()}) ${t.text}`).join('\n');
    exportFile(`Tarefas — BíbliaAlpha\n${'='.repeat(40)}\n\n${lines}`, 'Tarefas_BíbliaAlpha.txt');
  };

  const tabClass = (t: Tab) => cn(
    'flex-1 py-2 text-[11px] font-semibold flex flex-col items-center gap-0.5 transition-colors rounded-md',
    activeTab === t ? 'bg-sleek-bg text-blue-600 shadow-sm' : 'text-sleek-text-muted hover:text-sleek-text-main'
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={onClose} />}
      <div className={cn(
        'fixed inset-y-0 right-0 w-[90vw] sm:w-[480px] bg-sleek-bg shadow-2xl border-l border-sleek-border z-50 transition-transform duration-300 ease-in-out flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}>
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-sleek-border flex items-center justify-between px-4 bg-sleek-bg">
          <div className="flex items-center gap-2 font-semibold text-[13px] text-sleek-text-main">
            <PenLine size={16} className="text-blue-600" />
            <span>Bloco de Estudos</span>
            <span className="text-[11px] text-sleek-text-muted font-normal">— {chapterContext}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(s => !s)} className="p-1.5 hover:bg-sleek-hover rounded-md text-sleek-text-muted">
              <Settings2 size={15} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-sleek-hover rounded-md text-sleek-text-muted">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Settings dropdown */}
        {showSettings && (
          <div className="shrink-0 border-b border-sleek-border bg-blue-50 px-4 py-3 flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Configurações</p>
            <label className="flex items-center gap-2 text-[12px] text-sleek-text-main cursor-pointer">
              <input type="checkbox" checked={autocompleteOn} onChange={e => setAutocompleteOn(e.target.checked)} className="accent-blue-600" />
              <Sparkles size={13} className="text-blue-500" />
              Autocomplete teológico (sugestões ao digitar)
            </label>
          </div>
        )}

        {/* Tabs */}
        <div className="shrink-0 flex gap-1 px-3 py-2 bg-sleek-hover border-b border-sleek-border">
          <button className={tabClass('notas')} onClick={() => setActiveTab('notas')}>
            <PenLine size={14} /> Notas
          </button>
          <button className={tabClass('tarefas')} onClick={() => setActiveTab('tarefas')}>
            <CheckSquare size={14} /> Tarefas
          </button>
          <button className={tabClass('dicionario')} onClick={() => setActiveTab('dicionario')}>
            <BookOpen size={14} /> Dicionário
          </button>
          <button className={tabClass('enciclopedia')} onClick={() => setActiveTab('enciclopedia')}>
            <BookMarked size={14} /> Enciclopédia
          </button>
        </div>

        {/* ── ABA NOTAS ── */}
        {activeTab === 'notas' && (
          <>
            {/* Toolbar de formatação */}
            <div className="shrink-0 flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-sleek-border bg-sleek-hover">
              <button title="Negrito" onClick={() => insertFormat('**', '**')} className="p-1.5 hover:bg-sleek-hover rounded text-sleek-text-main"><Bold size={13} /></button>
              <button title="Itálico" onClick={() => insertFormat('*', '*')} className="p-1.5 hover:bg-sleek-hover rounded text-sleek-text-main"><Italic size={13} /></button>
              <button title="Sublinhado" onClick={() => insertFormat('__', '__')} className="p-1.5 hover:bg-sleek-hover rounded text-sleek-text-main"><Underline size={13} /></button>
              <div className="w-px h-4 bg-sleek-border mx-1" />
              <button title="Título" onClick={() => insertFormat('\n## ', '', 'Título')} className="p-1.5 hover:bg-sleek-hover rounded text-sleek-text-main"><Heading1 size={13} /></button>
              <button title="Lista" onClick={() => insertFormat('\n- ', '', 'item')} className="p-1.5 hover:bg-sleek-hover rounded text-sleek-text-main"><List size={13} /></button>
              <button title="Citação" onClick={() => insertFormat('\n> ', '', 'versículo')} className="p-1.5 hover:bg-sleek-hover rounded text-sleek-text-main"><Quote size={13} /></button>
              <button title="Hashtag" onClick={() => insertFormat('#', '', 'tema')} className="p-1.5 hover:bg-sleek-hover rounded text-sleek-text-main"><Hash size={13} /></button>
              <div className="w-px h-4 bg-sleek-border mx-1" />
              <button title="Inserir contexto do capítulo" onClick={() => insertFormat('', '', `\n📖 ${chapterContext}\n`)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500 text-[10px] font-medium flex items-center gap-0.5">
                <Link2 size={12} /> Cap.
              </button>
              {autocompleteOn && (
                <span className="ml-auto flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                  <Sparkles size={11} /> Teológico ON
                </span>
              )}
            </div>

            {/* Textarea + autocomplete */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-sleek-bg">
              <textarea
                ref={textareaRef}
                value={noteContent}
                onChange={handleNoteChange}
                onKeyDown={handleNoteKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={`Escreva seus insights, versículos e rascunhos de pregação sobre ${chapterContext}…\n\nDica: comece a digitar um termo teológico para ver sugestões.`}
                className="flex-1 w-full h-full outline-none resize-none text-[14px] leading-relaxed text-sleek-text-main placeholder:text-sleek-text-muted/40 bg-transparent p-5 custom-scrollbar"
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-5 bg-sleek-bg border border-sleek-border shadow-lg rounded-md z-10 w-72 overflow-hidden"
                  style={{ bottom: 8 }}>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border-b border-sleek-border">
                    <Sparkles size={11} className="text-blue-500" />
                    <span className="text-[10px] text-blue-600 font-semibold">Termos Teológicos — Tab para aceitar</span>
                  </div>
                  {suggestions.map((s, i) => (
                    <button key={s} onMouseDown={() => applySuggestion(s)}
                      className={cn('w-full text-left px-3 py-1.5 text-[12px] transition-colors', i === suggestionIdx ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-sleek-hover text-sleek-text-main')}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer notas */}
            <footer className="shrink-0 px-4 py-2.5 border-t border-sleek-border bg-sleek-bg flex items-center justify-between gap-2">
              <div className="text-[10px] text-sleek-text-muted flex items-center gap-3">
                <span className="flex items-center gap-1"><Save size={11} />
                  {autoSaved ? `Salvo ${autoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Auto-salvo'}
                </span>
                <span>{wordCount} palavra{wordCount !== 1 ? 's' : ''}</span>
                <span>{noteContent.length} car.</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleExportTxt} title="Exportar .txt"
                  className="flex items-center gap-1 text-[11px] font-medium text-sleek-text-muted hover:text-sleek-text-main border border-sleek-border px-2 py-1 rounded transition-colors">
                  <Download size={11} /> .txt
                </button>
                <button onClick={handleExportMd} title="Exportar Markdown"
                  className="flex items-center gap-1 text-[11px] font-medium text-sleek-text-muted hover:text-sleek-text-main border border-sleek-border px-2 py-1 rounded transition-colors">
                  <FileText size={11} /> .md
                </button>
              </div>
            </footer>
          </>
        )}

        {/* ── ABA TAREFAS ── */}
        {activeTab === 'tarefas' && (
          <>
            <div className="shrink-0 p-3 border-b border-sleek-border bg-sleek-hover space-y-2">
              <div className="flex gap-2">
                <input
                  value={newTask} onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Nova tarefa… (Enter para adicionar)"
                  className="flex-1 border border-sleek-border rounded-md px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-blue-400 bg-sleek-input-bg"
                />
                <button onClick={addTask} className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-sleek-text-muted">Prioridade:</span>
                {(['alta','media','baixa'] as Task['priority'][]).map(p => (
                  <button key={p} onClick={() => setTaskPriority(p)}
                    className={cn('text-[11px] px-2 py-0.5 rounded-full border transition-colors',
                      taskPriority === p ? 'border-current font-semibold' : 'border-sleek-border text-sleek-text-muted',
                      PRIORITY_COLOR[p])}>
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
                <div className="ml-auto flex gap-1">
                  {(['todas','pendentes','concluidas'] as const).map(f => (
                    <button key={f} onClick={() => setTaskFilter(f)}
                      className={cn('text-[10px] px-2 py-0.5 rounded capitalize transition-colors',
                        taskFilter === f ? 'bg-blue-600 text-white' : 'bg-sleek-bg border border-sleek-border text-sleek-text-muted hover:text-sleek-text-main')}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
              {filteredTasks.length === 0 && (
                <div className="text-center text-[13px] text-sleek-text-muted py-10">
                  <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
                  {taskFilter === 'todas' ? 'Nenhuma tarefa ainda.' : `Nenhuma tarefa ${taskFilter}.`}
                </div>
              )}
              {filteredTasks.map(task => (
                <div key={task.id} className={cn('flex items-start gap-2 p-2.5 rounded-lg border transition-colors',
                  task.done ? 'bg-sleek-hover border-green-100' : 'bg-sleek-bg border-sleek-border hover:border-blue-200')}>
                  <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                    {task.done
                      ? <CheckSquare size={16} className="text-green-500" />
                      : <Square size={16} className="text-sleek-text-muted" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] break-words', task.done && 'line-through text-sleek-text-muted')}>
                      {task.text}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[10px] font-medium', PRIORITY_COLOR[task.priority])}>
                        ● {PRIORITY_LABEL[task.priority]}
                      </span>
                      <span className="text-[10px] text-sleek-text-muted flex items-center gap-0.5">
                        <Clock size={9} /> {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="shrink-0 p-1 hover:bg-red-50 rounded text-sleek-text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <footer className="shrink-0 px-4 py-2.5 border-t border-sleek-border bg-sleek-bg flex items-center justify-between">
              <span className="text-[11px] text-sleek-text-muted">
                {tasks.filter(t => !t.done).length} pendente(s) · {tasks.filter(t => t.done).length} concluída(s)
              </span>
              <button onClick={handleExportTasks}
                className="flex items-center gap-1 text-[11px] font-medium text-sleek-text-muted hover:text-sleek-text-main border border-sleek-border px-2 py-1 rounded transition-colors">
                <Download size={11} /> Exportar
              </button>
            </footer>
          </>
        )}

        {/* ── ABA DICIONÁRIO ── */}
        {activeTab === 'dicionario' && (
          <>
            <div className="shrink-0 p-3 border-b border-sleek-border bg-sleek-hover">
              <div className="flex gap-2">
                <input
                  value={dictQuery} onChange={e => setDictQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDictSearch()}
                  placeholder="Digite uma palavra em português…"
                  className="flex-1 border border-sleek-border rounded-md px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-blue-400 bg-sleek-input-bg"
                />
                <button onClick={handleDictSearch} disabled={dictLoading}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {dictLoading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                </button>
              </div>
              <p className="text-[10px] text-sleek-text-muted mt-1.5">
                Dicionário de Português · fonte: Wikcionário PT
              </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {!dictResult && !dictError && !dictLoading && (
                <div className="text-center text-[13px] text-sleek-text-muted py-10">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                  Busque qualquer palavra em português.
                </div>
              )}
              {dictError && <p className="text-[13px] text-red-500 text-center py-6">{dictError}</p>}
              {dictResult && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-[22px] font-bold text-sleek-text-main">{dictResult.word}</h2>
                    {dictResult.phonetic && (
                      <p className="text-[13px] text-blue-600 font-mono">{dictResult.phonetic}</p>
                    )}
                  </div>
                  {dictResult.meanings.map((m, mi) => (
                    <div key={mi}>
                      <span className="inline-block bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded mb-2">
                        {m.partOfSpeech}
                      </span>
                      <ol className="space-y-2">
                        {m.definitions.map((d, di) => (
                          <li key={di} className="text-[13px]">
                            <span className="font-medium text-sleek-text-muted mr-1">{di + 1}.</span>
                            <span className="text-sleek-text-main">{d.definition}</span>
                            {d.example && (
                              <p className="text-[12px] text-sleek-text-muted italic mt-0.5 pl-3 border-l-2 border-sleek-border">
                                "{d.example}"
                              </p>
                            )}
                            {d.synonyms && d.synonyms.length > 0 && (
                              <p className="text-[11px] text-green-700 mt-0.5">
                                Sinônimos: {d.synonyms.join(', ')}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-sleek-border flex gap-2">
                    <button
                      onClick={() => {
                        const txt = `${dictResult.word}\n\n${dictResult.meanings.map(m => `[${m.partOfSpeech}]\n${m.definitions.map((d,i) => `${i+1}. ${d.definition}${d.example ? `\n   Ex: "${d.example}"` : ''}`).join('\n')}`).join('\n\n')}`;
                        const nota = noteContent + `\n\n📖 Dicionário: ${txt}`;
                        setNoteContent(nota);
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
            <div className="shrink-0 p-3 border-b border-sleek-border bg-sleek-hover">
              <div className="flex gap-2">
                <input
                  value={encQuery} onChange={e => setEncQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEncSearch()}
                  placeholder="Buscar na Wikipedia PT… ex: Calvário"
                  className="flex-1 border border-sleek-border rounded-md px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-blue-400 bg-sleek-input-bg"
                />
                <button onClick={handleEncSearch} disabled={encLoading}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {encLoading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                </button>
              </div>
              <p className="text-[10px] text-sleek-text-muted mt-1.5">Wikipedia em Português · enciclopédia livre</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {/* Artigo aberto */}
              {encArticle && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {encArticle.thumbnail && (
                      <img src={encArticle.thumbnail.source} alt={encArticle.title}
                        className="w-20 h-20 object-cover rounded-lg border border-sleek-border shrink-0" />
                    )}
                    <div>
                      <h2 className="text-[16px] font-bold text-sleek-text-main">{encArticle.title}</h2>
                      <p className="text-[12px] text-sleek-text-muted leading-relaxed mt-1">{encArticle.extract}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-sleek-border">
                    <a href={encArticle.pageUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                      <Link2 size={11} /> Artigo completo
                    </a>
                    <button onClick={() => {
                        const txt = `\n\n📚 Enciclopédia — ${encArticle.title}\n${encArticle.extract}\nFonte: ${encArticle.pageUrl}\n`;
                        setNoteContent(n => n + txt);
                        setActiveTab('notas');
                      }}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                      <Plus size={11} /> Inserir nas Notas
                    </button>
                    <button onClick={() => { setEncArticle(null); }}
                      className="text-[11px] text-sleek-text-muted hover:underline flex items-center gap-1 ml-auto">
                      ← Voltar aos resultados
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de resultados */}
              {!encArticle && encResults.length > 0 && (
                <div className="space-y-1.5">
                  {encResults.map((r, i) => (
                    <button key={i} onClick={() => handleEncArticle(r.title)}
                      className="w-full text-left p-2.5 rounded-lg border border-sleek-border hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <p className="text-[13px] font-medium text-sleek-text-main">{r.title}</p>
                      {r.extract && <p className="text-[11px] text-sleek-text-muted mt-0.5 line-clamp-2">{r.extract}</p>}
                    </button>
                  ))}
                </div>
              )}

              {!encArticle && encResults.length === 0 && !encLoading && (
                <div className="text-center text-[13px] text-sleek-text-muted py-10">
                  <BookMarked size={32} className="mx-auto mb-2 opacity-30" />
                  Busque qualquer tema bíblico, histórico ou teológico.
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {['Calvário','Apóstolo Paulo','Salomão','Êxodo','Trindade','Pentecostes'].map(s => (
                      <button key={s} onClick={() => { setEncQuery(s); }}
                        className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                        {s}
                      </button>
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
