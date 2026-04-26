import * as React from 'react';
import { useState, useEffect } from 'react';
import { Sun, Moon, Layers, Minus, Plus, X, Type, ChevronDown } from 'lucide-react';
import { useTheme, Theme, FontSize } from '../App';
import { cn } from '../App';

interface ThemeDef {
  id: Theme;
  label: string;
  desc: string;
  icon: React.ReactNode;
  bg: string;
  sidebar: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
}

const THEMES: ThemeDef[] = [
  {
    id: 'light',
    label: 'Tradicional',
    desc: 'Fundo branco',
    icon: <Sun size={15} />,
    bg: '#FFFFFF',
    sidebar: '#F7F7F5',
    text: '#37352F',
    muted: '#7A7A77',
    border: '#E9E9E7',
    accent: '#D32F2F',
  },
  {
    id: 'dark',
    label: 'Escuro',
    desc: 'Preto profundo',
    icon: <Moon size={15} />,
    bg: '#1C1C1F',
    sidebar: '#161618',
    text: '#E8E8E6',
    muted: '#888886',
    border: '#2E2E33',
    accent: '#FF6B6B',
  },
  {
    id: 'graphite',
    label: 'Grafite',
    desc: 'Cinza escuro',
    icon: <Layers size={15} />,
    bg: '#26272B',
    sidebar: '#1E1F22',
    text: '#C5C6C9',
    muted: '#72737A',
    border: '#313338',
    accent: '#E07B54',
  },
];

const FONT_SIZES: { id: FontSize; label: string; px: string }[] = [
  { id: 'sm', label: 'P',  px: '15px' },
  { id: 'md', label: 'M',  px: '18px' },
  { id: 'lg', label: 'G',  px: '21px' },
  { id: 'xl', label: 'GG', px: '25px' },
];

function ThemeCard({ t, active, onSelect }: { t: ThemeDef; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col gap-2 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] w-full"
      style={{
        backgroundColor: t.bg,
        borderColor: active ? '#c9a96e' : t.border,
        boxShadow: active
          ? '0 0 0 3px rgba(201,169,110,0.25), 0 4px 16px rgba(0,0,0,0.18)'
          : '0 2px 8px rgba(0,0,0,0.1)',
      }}
      title={t.label}
    >
      {/* Miniatura de interface */}
      <div className="w-full rounded-lg overflow-hidden" style={{ border: '1px solid ' + t.border }}>
        {/* Topbar */}
        <div className="h-3 flex items-center gap-1 px-1.5" style={{ backgroundColor: t.sidebar, borderBottom: '1px solid ' + t.border }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accent + 'CC' }} />
          <div className="flex-1 h-1 rounded-full opacity-30" style={{ backgroundColor: t.text }} />
        </div>
        {/* Conteúdo */}
        <div className="p-1.5 space-y-1" style={{ backgroundColor: t.bg }}>
          <div className="h-1.5 rounded-full w-5/6" style={{ backgroundColor: t.text + 'CC' }} />
          <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: t.muted + 'AA' }} />
          <div className="h-1.5 rounded-full w-4/5" style={{ backgroundColor: t.text + '88' }} />
          <div className="h-1.5 rounded-full w-2/3" style={{ backgroundColor: t.muted + '77' }} />
        </div>
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: t.text }}>
          {t.icon} {t.label}
        </div>
        <div className="text-[9px]" style={{ color: t.muted }}>{t.desc}</div>
      </div>

      {/* Indicador ativo */}
      {active && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 8px rgba(201,169,110,0.6)' }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </button>
  );
}

export default function ThemeControls() {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  const current = THEMES.find(t => t.id === theme) || THEMES[0];
  const fontIdx  = FONT_SIZES.findIndex(f => f.id === fontSize);

  // Pulsar suavemente na 1a visita
  useEffect(() => {
    const seen = localStorage.getItem('theme_ctrl_seen');
    if (!seen) { setPulse(true); setTimeout(() => { setPulse(false); localStorage.setItem('theme_ctrl_seen', '1'); }, 4000); }
  }, []);

  const decreaseFont = () => { if (fontIdx > 0) setFontSize(FONT_SIZES[fontIdx - 1].id); };
  const increaseFont = () => { if (fontIdx < FONT_SIZES.length - 1) setFontSize(FONT_SIZES[fontIdx + 1].id); };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed right-6 z-50 flex items-center gap-2 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 select-none lg:bottom-8"
        style={{ bottom: 'max(calc(56px + 1rem), env(safe-area-inset-bottom, 0px) + 4.5rem)' }}
        style={{
          backgroundColor: current.sidebar,
          border: '1.5px solid ' + (open ? '#c9a96e' : current.border),
          color: current.text,
          padding: '8px 14px 8px 11px',
          boxShadow: open
            ? '0 0 0 3px rgba(201,169,110,0.2), 0 8px 32px rgba(0,0,0,0.35)'
            : pulse
              ? '0 0 0 5px rgba(201,169,110,0.25), 0 4px 20px rgba(0,0,0,0.25)'
              : '0 4px 20px rgba(0,0,0,0.25)',
          transition: 'all 0.2s ease, box-shadow ' + (pulse ? '0.8s ease-in-out' : '0.2s ease'),
        }}
        title="Aparência"
        aria-label="Abrir painel de aparência"
      >
        <span style={{ color: '#c9a96e', display: 'flex', alignItems: 'center' }}>{current.icon}</span>
        <span className="text-[12px] font-semibold tracking-wide">{current.label}</span>
        <ChevronDown size={12} className="opacity-50" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>

      {/* Painel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="fixed right-6 z-50 rounded-2xl shadow-2xl overflow-hidden lg:bottom-[8.5rem]"
            style={{ bottom: 'max(calc(56px + 5.5rem), env(safe-area-inset-bottom, 0px) + 8rem)' }}
            style={{
              width: '308px',
              backgroundColor: current.bg,
              border: '1px solid ' + current.border,
              color: current.text,
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ' + current.border,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid ' + current.border, backgroundColor: current.sidebar }}>
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <span style={{ color: '#c9a96e' }}>✷</span>
                Aparência
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:opacity-70 transition-opacity">
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-5">

              {/* Seletor de Tema */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5" style={{ color: '#c9a96e' }}>
                  ◆ Tema de cor
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map(t => (
                    <ThemeCard key={t.id} t={t} active={theme === t.id} onSelect={() => setTheme(t.id)} />
                  ))}
                </div>
              </div>

              {/* Divisor */}
              <div className="h-px w-full" style={{ backgroundColor: current.border }} />

              {/* Tamanho de fonte */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5" style={{ color: '#c9a96e' }}>
                  <Type size={10} /> Tamanho da fonte
                </p>

                <div className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: current.sidebar, border: '1px solid ' + current.border }}>
                  <button
                    onClick={decreaseFont}
                    disabled={fontIdx === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-25 hover:opacity-80"
                    style={{ borderColor: current.border, backgroundColor: current.bg }}
                  >
                    <Minus size={13} />
                  </button>

                  <div className="flex-1 flex justify-center gap-1.5">
                    {FONT_SIZES.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFontSize(f.id)}
                        className="w-9 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold border-2 transition-all"
                        style={{
                          borderColor: fontSize === f.id ? '#c9a96e' : current.border,
                          backgroundColor: fontSize === f.id ? 'rgba(201,169,110,0.12)' : current.bg,
                          color: fontSize === f.id ? '#c9a96e' : current.text,
                          boxShadow: fontSize === f.id ? '0 0 0 2px rgba(201,169,110,0.2)' : 'none',
                        }}
                        title={f.px}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={increaseFont}
                    disabled={fontIdx === FONT_SIZES.length - 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-25 hover:opacity-80"
                    style={{ borderColor: current.border, backgroundColor: current.bg }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Preview de versículo */}
                <div
                  className="mt-3 p-3 rounded-xl border text-center leading-relaxed"
                  style={{
                    borderColor: current.border,
                    backgroundColor: current.sidebar,
                    fontSize: FONT_SIZES[fontIdx]?.px || '18px',
                    color: current.text,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  &ldquo;Porque Deus amou o mundo...&rdquo;
                </div>
              </div>

              {/* Rodapé */}
              <div className="h-px w-full" style={{ backgroundColor: current.border }} />
              <p className="text-[9.5px] text-center" style={{ color: current.muted }}>
                Preferências salvas automaticamente — Bíblia Alpha
              </p>

            </div>
          </div>
        </>
      )}
    </>
  );
}
