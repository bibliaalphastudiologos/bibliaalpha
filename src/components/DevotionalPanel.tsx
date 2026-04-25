import { cn } from '../App';
import { X, ArrowLeft, Heart, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { DEVOTIONAL_CATEGORIES, DevotionalAudience, DevotionalCategory, Devotional } from '../data/devotionals';

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
                <span>{category.label}</span>
              </>
            ) : (
              <>
                <BookOpen size={16} />
                <span>Devocionais</span>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-sleek-hover rounded-md text-sleek-text-muted transition-colors"
          >
            <X size={18} />
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
                  className="border border-sleek-border rounded-lg p-4 cursor-pointer hover:border-sleek-text-main/30 hover:shadow-sm transition-all group bg-sleek-bg"
                >
                  <h4 className="font-semibold text-[14px] text-sleek-text-main group-hover:text-blue-600 transition-colors mb-1">
                    {devotional.title}
                  </h4>
                  <p className="text-[11px] text-blue-600 font-medium mb-2">{devotional.reference}</p>
                  <p className="text-[12px] text-sleek-text-muted italic line-clamp-2 leading-relaxed">
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

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-[13px] text-amber-900 italic leading-relaxed">
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

              <div className="bg-sleek-hover border border-sleek-border rounded-lg p-4 mb-6">
                <div className="flex items-center gap-1.5 mb-2">
                  <Heart size={12} className="text-blue-500" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
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
                className="w-full py-2.5 px-4 bg-sleek-text-main text-white rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity"
              >
                Ler {activeDevotional.reference} na Bíblia
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
