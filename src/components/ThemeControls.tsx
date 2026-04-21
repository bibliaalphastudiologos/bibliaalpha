import * as React from 'react';
import { useState } from 'react';
import { Palette, Sun, Moon, Circle, Minus, Plus, X, Type } from 'lucide-react';
import { useTheme, Theme, FontSize } from '../App';
import { cn } from '../App';

const THEMES: { id: Theme; label: string; icon: React.ReactNode; preview: { bg: string; text: string; border: string } }[] = [
  {
    id: 'light',
    label: 'Claro',
    icon: <Sun size={14} />,
    preview: { bg: '#FFFFFF', text: '#37352F', border: '#E9E9E7' },
  },
  {
    id: 'dark',
    label: 'Noite',
    icon: <Moon size={14} />,
    preview: { bg: '#1C1C1F', text: '#E8E8E6', border: '#2E2E33' },
  },
  {
    id: 'graphite',
    label: 'Grafite',
    icon: <Circle size={14} />,
    preview: { bg: '#313235', text: '#C9CAC6', border: '#3D3E43' },
  },
];

const FONT_SIZES: { id: FontSize; label: string; px: string }[] = [
  { id: 'sm', label: 'P',  px: '15px' },
  { id: 'md', label: 'M',  px: '18px' },
  { id: 'lg', label: 'G',  px: '21px' },
  { id: 'xl', label: 'GG', px: '25px' },
];

export default function ThemeControls() {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const [open, setOpen] = useState(false);

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  const currentFontIdx = FONT_SIZES.findIndex(f => f.id === fontSize);

  const decreaseFont = () => {
    if (currentFontIdx > 0) setFontSize(FONT_SIZES[currentFontIdx - 1].id);
  };
  const increaseFont = () => {
    if (currentFontIdx < FONT_SIZES.length - 1) setFontSize(FONT_SIZES[currentFontIdx + 1].id);
  };

  return (
    <>
      {/* Trigger button — canto inferior direito */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: currentTheme.preview.bg,
          border: `2px solid ${currentTheme.preview.border}`,
          color: currentTheme.preview.text,
        }}
        title="Aparência"
        aria-label="Abrir painel de aparência"
      >
        <Palette size={18} />
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="fixed bottom-20 right-6 z-50 w-72 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: currentTheme.preview.bg,
              border: `1px solid ${currentTheme.preview.border}`,
              color: currentTheme.preview.text,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: currentTheme.preview.border }}
            >
              <div className="flex items-center gap-2 font-semibold text-[13px]">
                <Palette size={15} style={{ color: currentTheme.preview.text }} />
                Aparência
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:opacity-70 transition-opacity"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Tema */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3 opacity-60">Tema</p>
                <div className="flex gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className="flex-1 flex flex-col items-center gap-2 py-2.5 px-1 rounded-xl border-2 transition-all"
                      style={{
                        backgroundColor: t.preview.bg,
                        borderColor: theme === t.id ? '#3B82F6' : t.preview.border,
                        color: t.preview.text,
                        boxShadow: theme === t.id ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                      }}
                      title={t.label}
                    >
                      {/* Miniatura */}
                      <div
                        className="w-full h-10 rounded-lg flex flex-col gap-1 justify-center px-2"
                        style={{ backgroundColor: t.preview.bg, border: `1px solid ${t.preview.border}` }}
                      >
                        <div className="w-3/4 h-1.5 rounded-full opacity-80" style={{ backgroundColor: t.preview.text }} />
                        <div className="w-1/2 h-1.5 rounded-full opacity-40" style={{ backgroundColor: t.preview.text }} />
                        <div className="w-2/3 h-1.5 rounded-full opacity-60" style={{ backgroundColor: t.preview.text }} />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium">
                        {t.icon} {t.label}
                      </div>
                      {theme === t.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divisor */}
              <div className="w-full h-px" style={{ backgroundColor: currentTheme.preview.border }} />

              {/* Fonte */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3 opacity-60 flex items-center gap-1.5">
                  <Type size={11} /> Tamanho da fonte
                </p>

                {/* Controle de zoom */}
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ borderColor: currentTheme.preview.border }}
                >
                  <button
                    onClick={decreaseFont}
                    disabled={currentFontIdx === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30"
                    style={{ borderColor: currentTheme.preview.border }}
                  >
                    <Minus size={14} />
                  </button>

                  <div className="flex-1 flex justify-center gap-1.5">
                    {FONT_SIZES.map((f, i) => (
                      <button
                        key={f.id}
                        onClick={() => setFontSize(f.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold border-2 transition-all"
                        style={{
                          borderColor: fontSize === f.id ? '#3B82F6' : currentTheme.preview.border,
                          backgroundColor: fontSize === f.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                          color: fontSize === f.id ? '#3B82F6' : currentTheme.preview.text,
                        }}
                        title={`${f.px}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={increaseFont}
                    disabled={currentFontIdx === FONT_SIZES.length - 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30"
                    style={{ borderColor: currentTheme.preview.border }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Preview da fonte */}
                <div
                  className="mt-3 p-3 rounded-xl border text-center font-serif leading-snug"
                  style={{
                    borderColor: currentTheme.preview.border,
                    fontSize: FONT_SIZES[currentFontIdx]?.px || '18px',
                    color: currentTheme.preview.text,
                  }}
                >
                  "Porque Deus amou o mundo..."
                </div>
              </div>

              {/* Divisor */}
              <div className="w-full h-px" style={{ backgroundColor: currentTheme.preview.border }} />

              {/* Info */}
              <p className="text-[10px] text-center opacity-40">
                As preferências são salvas automaticamente.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
