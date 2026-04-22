import { useState, useEffect, useMemo } from 'react';
import { X, Search, BookOpen, ExternalLink, Info, Sparkles, Library } from 'lucide-react';
import { cn } from '../App';
import { EBOOKS_INICIAIS, EBOOK_CATEGORIAS, Ebook } from '../data/ebooks';
import { expandirEbooks } from '../services/ebooksApi';
import EbookCover from './EbookCover';

interface EbooksPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EbooksPanel({ isOpen, onClose }: EbooksPanelProps) {
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState<string>('Todas');
  const [dinamicos, setDinamicos] = useState<Ebook[]>([]);
  const [carregandoDinamicos, setCarregandoDinamicos] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setCarregandoDinamicos(true);
    expandirEbooks(EBOOKS_INICIAIS)
      .then(items => { if (alive) setDinamicos(items); })
      .catch(() => {})
      .finally(() => { if (alive) setCarregandoDinamicos(false); });
    return () => { alive = false; };
  }, [isOpen]);

  const todos = useMemo<Ebook[]>(() => {
    const seen = new Set<string>();
    const merged: Ebook[] = [];
    for (const e of [...EBOOKS_INICIAIS, ...dinamicos]) {
      const key = e.url || e.slug;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(e);
    }
    return merged;
  }, [dinamicos]);

  const contagemPorCategoria = useMemo(() => {
    const m: Record<string, number> = { Todas: todos.length };
    for (const e of todos) m[e.categoria] = (m[e.categoria] || 0) + 1;
    return m;
  }, [todos]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos.filter(e => {
      if (categoria !== 'Todas' && e.categoria !== categoria) return false;
      if (!q) return true;
      return (
        e.titulo.toLowerCase().includes(q) ||
        e.autor.toLowerCase().includes(q) ||
        e.categoria.toLowerCase().includes(q)
      );
    });
  }, [todos, query, categoria]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sleek-bg flex flex-col">

      {/* ── Header ── */}
      <header className="h-12 flex items-center justify-between px-4 sm:px-8 border-b border-sleek-border bg-sleek-bg shrink-0">
        <div className="flex items-center gap-2">
          <Library size={15} className="text-sleek-text-muted shrink-0" />
          <h1 className="text-[13px] sm:text-[14px] font-semibold text-sleek-text-main tracking-wide leading-none">
            Biblioteca Teológica
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-sleek-text-muted ml-1 border border-sleek-border px-2 py-0.5 rounded-full">
            <Sparkles size={8} /> Domínio Público
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-sleek-hover rounded-lg text-sleek-text-muted transition-colors"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </header>

      {/* ── Corpo rolável ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-4 sm:py-6">

          {/* Título da seção */}
          <div className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-sleek-border/50">
            <h2
              className="text-[20px] sm:text-[24px] font-semibold tracking-wide text-sleek-text-main"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Estante Virtual
            </h2>
            <p className="text-[11px] sm:text-[12px] text-sleek-text-muted mt-0.5 italic">
              Pais da Igreja · Reformadores · Puritanos · Comentaristas
            </p>
          </div>

          {/* ── Sticky: busca + filtros ── */}
          <div className="sticky top-0 z-10 -mx-3 sm:-mx-8 px-3 sm:px-8 pt-2 pb-3 bg-sleek-bg/95 backdrop-blur-sm border-b border-sleek-border/30 mb-4">

            {/* Busca */}
            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sleek-text-muted opacity-60 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar título, autor ou categoria…"
                className="w-full pl-8 pr-4 py-2.5 sm:py-2 rounded-xl border border-sleek-border bg-sleek-bg text-[13px] sm:text-[12px] text-sleek-text-main placeholder:text-sleek-text-muted focus:outline-none focus:border-sleek-text-muted transition-colors"
              />
            </div>

            {/* Pills de categoria — scroll horizontal no mobile */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {['Todas', ...EBOOK_CATEGORIAS].map(cat => {
                const n = contagemPorCategoria[cat] || 0;
                const ativo = categoria === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-full border whitespace-nowrap shrink-0 transition-all font-medium',
                      ativo
                        ? 'bg-sleek-text-main text-white border-sleek-text-main shadow-sm'
                        : 'bg-sleek-bg text-sleek-text-muted border-sleek-border hover:bg-sleek-hover hover:text-sleek-text-main'
                    )}
                  >
                    {cat}
                    <span className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded-full font-semibold leading-none',
                      ativo ? 'bg-white/20 text-white' : 'bg-sleek-hover text-sleek-text-muted'
                    )}>{n}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Grid de ebooks ── */}
          {filtrados.length === 0 ? (
            <div className="text-center py-20 text-sleek-text-muted text-[13px] italic">
              Nenhum ebook encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-8">
              {filtrados.map(ebook => (
                <EbookCard key={ebook.slug} ebook={ebook} />
              ))}
            </div>
          )}

          {carregandoDinamicos && (
            <div className="mt-8 text-center text-[11px] text-sleek-text-muted italic flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-sleek-border border-t-sleek-text-muted animate-spin" />
              Expandindo catálogo…
            </div>
          )}

          <div className="mt-10 pb-6 text-center text-[10px] text-sleek-text-muted tracking-wider uppercase">
            {filtrados.length} {filtrados.length === 1 ? 'título' : 'títulos'} · Bíblia Alpha
          </div>

        </div>
      </div>
    </div>
  );
}

function EbookCard({ ebook }: { ebook: Ebook }) {
  return (
    <div className="group flex flex-col">

      {/* ── Capa 3D ── */}
      <a
        href={ebook.url}
        target="_blank"
        rel="noopener noreferrer"
        title={ebook.titulo + ' — ' + ebook.autor}
        className="block"
        style={{ perspective: '800px' }}
      >
        <div
          className="relative w-full transition-transform duration-500 ease-out will-change-transform"
          style={{
            aspectRatio: '2/3',
            transformStyle: 'preserve-3d',
            transform: 'rotateY(-8deg) rotateX(1deg)',
          }}
        >
          {/* Lombada */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[5px] sm:w-[7px]"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)',
              borderTopLeftRadius: 2,
              borderBottomLeftRadius: 2,
            }}
          />
          {/* Páginas */}
          <div
            aria-hidden
            className="absolute inset-y-1 right-0 w-[3px]"
            style={{
              background: 'repeating-linear-gradient(90deg, #f5ecd6 0 1px, #d8c99a 1px 2px)',
              transform: 'translateX(2px)',
              borderRadius: 1,
              boxShadow: '0 0 0 0.5px rgba(0,0,0,0.2)',
            }}
          />
          {/* Face principal */}
          <div
            className="absolute inset-0 rounded-[3px] overflow-hidden transition-all duration-500 group-hover:scale-[1.04]"
            style={{
              boxShadow: '0 8px 24px -8px rgba(0,0,0,0.5), 0 3px 8px -4px rgba(0,0,0,0.3)',
            }}
          >
            <EbookCover ebook={ebook} />
            {/* Reflexo de lombada */}
            <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[10px]"
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, transparent 100%)' }} />
            {/* Brilho hover */}
            <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.13) 50%, transparent 60%)' }} />
          </div>
        </div>
      </a>

      {/* ── Metadados ── */}
      <div className="mt-2.5 sm:mt-3 flex flex-col gap-1 flex-1">

        {/* Título */}
        <a
          href={ebook.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] sm:text-[12px] font-semibold text-sleek-text-main leading-snug line-clamp-2 hover:underline underline-offset-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {ebook.titulo}
        </a>

        {/* Autor */}
        <p className="text-[11px] text-sleek-text-muted line-clamp-1 italic leading-tight">
          {ebook.autor}
        </p>

        {/* Badge categoria */}
        <span className="self-start mt-0.5 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-sleek-hover text-sleek-text-muted font-medium leading-none">
          {ebook.categoria}
        </span>

        {/* Ações */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <a
            href={ebook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] sm:text-[10px] font-semibold text-sleek-text-main hover:underline underline-offset-2"
          >
            Ler <ExternalLink size={9} />
          </a>
          <span className="text-sleek-border text-[10px]">·</span>
          <a
            href={'https://translate.google.com/translate?sl=en&tl=pt&u=' + encodeURIComponent(ebook.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors font-semibold leading-none"
            title="Ler em Português via Google Tradutor"
          >
            PT
          </a>
        </div>
      </div>
    </div>
  );
}
