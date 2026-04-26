import { cn } from '../App';
import { X, ArrowLeft, Heart, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { DEVOTIONAL_CATEGORIES, DevotionalAudience, DevotionalCategory, Devotional } from '../data/devotionals';

const AUDIENCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ministerio: { bg: 'rgba(99,102,241,0.10)', text: '#6366F1', border: 'rgba(99,102,241,0.25)' },
  homens:     { bg: 'rgba(59,130,246,0.10)', text: '#3B82F6', border: 'rgba(59,130,246,0.25)' },
  mulheres:   { bg: 'rgba(244,63,94,0.10)',  text: '#F43F5E', border: 'rgba(244,63,94,0.25)' },
  jovens:     { bg: 'rgba(249,115,22,0.10)', text: '#F97316', border: 'rgba(249,115,22,0.25)' },
};

interface DevotionalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  audience: DevotionalAudience | null;
  onSelectChapter: (bookId: string, chapter: number) => void;
}

export default function DevotionalPanel({
  isOpen,
  onClose,
  audience,
  onSelectChapter,
}: DevotionalPanelProps) {
  const [activeDevotionalId, setActiveDevotionalId] = useState<string | null>(null);

  const category: DevotionalCategory | undefined = audience
    ? DEVOTIONAL_CATEGORIES.find(c => c.id === audience)
    : undefined;

  const activeDevotional: Devotional | undefined =
    activeDevotionalId && category
      ? category.devotionals.find(d => d.id === activeDevotionalId)
      : undefined;

  const handleClose = () => {
    setActiveDevotionalId(null);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={handleClose} />
      )}
      <div
        className={cn(
          'fixed inset-y-0 right-0 w-[90vw] sm:w-[450px] bg-sleek-bg shadow-2xl border-l border-sleek-border z-50 transition-transform duration-300 ease-in-out flex flex-col font-sans',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="h-14 shrink-0 border-b border-sleek-border flex items-center justify-between px-4 bg-sleek-bg">
          <div className="flex items-center gap-2 font-semibold text-[13px] text-sleek-text-main">
            {category ? (
              <>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: AUDIENCE_COLORS[category.id]?.text || '#6366F1' }}
                />
                <span>{category.label}</span>
              </>
            ) : (
              <>
                <BookOpen size={15} className="text-sleek-text-muted" />
                <span>Devocionais</span>
              </>
            )}
          </div>
          <button onClick={handleClose} className="panel-close-btn">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col bg-sleek-bg">
          {!activeDevotional ? (
            <div className="space-y-4">
              {category && (
                <p className="text-[12px] text-sleek-text-muted mb-3 leading-relaxed">
                  {category.description}
                </p>
              )}
              {category?.devotionals.map(devotional => (
                <div
                  key={devotional.id}
                  onClick={() => setActiveDevotionalId(devotional.id)}
                  className="border border-sleek-border rounded-xl p-4 cursor-pointer hover:border-sleek-text-main/20 hover:shadow-md transition-all group bg-sleek-surface"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-[14px] text-sleek-text-main group-hover:text-sleek-accent transition-colors leading-snug">
                      {devotional.title}
                    </h4>
                    <span className="text-[10px] font-bold text-sleek-text-muted bg-sleek-hover px-2 py-0.5 rounded-full border border-sleek-border shrink-0">
                      {devotional.reference}
                    </span>
                  </div>
                  <p className="text-[12px] text-sleek-text-muted italic line-clamp-2 leading-relaxed mt-2">
                    {devotional.verse}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <button
                onClick={() => setActiveDevotionalId(null)}
                className="text-[12px] text-blue-600 hover:underline mb-5 flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft size={12} />
                Voltar para {category?.label}
              </button>

              <h3 className="text-[19px] font-bold text-sleek-text-main mb-1 leading-snug">
                {activeDevotional.title}
              </h3>
              <p className="text-[12px] font-semibold text-blue-600 mb-5">
                {activeDevotional.reference}
              </p>

              <div
                className="rounded-xl p-4 mb-6 border-l-4"
                style={{
                  background: 'var(--color-sleek-surface)',
                  borderColor: 'var(--color-sleek-accent)',
                  borderTopWidth: '1px',
                  borderRightWidth: '1px',
                  borderBottomWidth: '1px',
                  borderLeftWidth: '4px',
                  borderStyle: 'solid',
                  borderTopColor: 'var(--color-sleek-border)',
                  borderRightColor: 'var(--color-sleek-border)',
                  borderBottomColor: 'var(--color-sleek-border)',
                }}
              >
                <p className="text-[14px] text-sleek-text-main italic leading-relaxed font-serif">
                  {activeDevotional.verse}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-sleek-text-muted mb-2">
                  Reflexão
                </h4>
                <p className="text-[13px] text-sleek-text-main leading-relaxed">
                  {activeDevotional.reflection}
                </p>
              </div>

              <div className="bg-sleek-hover border border-sleek-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Heart size={11} className="text-blue-500" />
                  </div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-sleek-text-muted">
                    Oração
                  </h4>
                </div>
                <p className="text-[13px] text-sleek-text-main italic leading-relaxed">
                  {activeDevotional.prayer}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectChapter(activeDevotional.bookId, activeDevotional.chapter);
                  if (window.innerWidth < 1024) handleClose();
                }}
                className="w-full py-3 px-4 bg-sleek-text-main text-sleek-bg rounded-xl text-[13px] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <BookOpen size={14} />
                Ler {activeDevotional.reference} na Bíblia
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
