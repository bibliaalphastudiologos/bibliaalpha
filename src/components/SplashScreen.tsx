import { useEffect, useState } from 'react';

    interface SplashScreenProps {
      onFinish: () => void;
    }

    export default function SplashScreen({ onFinish }: SplashScreenProps) {
      const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

      useEffect(() => {
        // Fase 1: entra (fade-in do logo e texto)
        const t1 = setTimeout(() => setPhase('visible'), 100);
        // Fase 2: começa a sair após 19.5 s (tela visível por ~20 s)
        const t2 = setTimeout(() => setPhase('exit'), 19500);
        // Fase 3: desmonta após a animação de saída
        const t3 = setTimeout(() => onFinish(), 20300);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
      }, [onFinish]);

      return (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            transition: 'opacity 0.7s ease',
            opacity: phase === 'exit' ? 0 : 1,
          }}
        >
          {/* Estrelas de fundo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.15,
                  animation: `twinkle ${(Math.random() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
                  animationDelay: (Math.random() * 2).toFixed(1) + 's',
                }}
              />
            ))}
          </div>

          {/* Halo de luz atrás do logo */}
          <div
            className="absolute rounded-full"
            style={{
              width: '340px',
              height: '340px',
              background: 'radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 70%)',
              filter: 'blur(50px)',
              transition: 'opacity 1.4s ease',
              opacity: phase === 'enter' ? 0 : 1,
            }}
          />

          {/* Logo — Estrela de Davi */}
          <div
            style={{
              transition: 'opacity 1.2s ease, transform 1.2s ease',
              opacity: phase === 'enter' ? 0 : 1,
              transform: phase === 'enter' ? 'translateY(28px) scale(0.88)' : 'translateY(0) scale(1)',
              filter: 'drop-shadow(0 0 36px rgba(201,169,110,0.55)) drop-shadow(0 0 16px rgba(201,169,110,0.35))',
            }}
          >
            <img
              src="/icon.svg"
              alt="Bíblia Alpha — Estrela de Davi"
              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
              draggable={false}
            />
          </div>

          {/* Divisor dourado */}
          <div
            className="mt-8 mb-6"
            style={{
              width: phase === 'enter' ? '0px' : '140px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)',
              transition: 'width 1.4s ease 0.4s',
            }}
          />

          {/* Mensagem de boas-vindas */}
          <div
            className="text-center px-8"
            style={{
              transition: 'opacity 1.4s ease 0.6s, transform 1.4s ease 0.6s',
              opacity: phase === 'enter' ? 0 : 1,
              transform: phase === 'enter' ? 'translateY(14px)' : 'translateY(0)',
            }}
          >
            <p className="text-[15px] font-light tracking-[0.18em] uppercase text-slate-300 mb-1">
              Bem-vindo à
            </p>
            <h1
              className="text-[28px] font-semibold tracking-wide mb-1"
              style={{ color: '#c9a96e', fontFamily: 'Georgia, serif' }}
            >
              Bíblia Alpha
            </h1>
            <p className="text-[13px] text-slate-400 font-light tracking-widest uppercase mt-1">
              Estudo · Meditação · Crescimento
            </p>
          </div>

          {/* Versículo */}
          <div
            className="mt-8 px-10 text-center max-w-xs"
            style={{
              transition: 'opacity 1.4s ease 1s',
              opacity: phase === 'enter' ? 0 : 1,
            }}
          >
            <p className="text-[13px] italic text-slate-400 leading-relaxed">
              "A tua palavra é lâmpada para os meus pés e luz para o meu caminho."
            </p>
            <p className="text-[11px] text-slate-500 mt-1 tracking-wider">— Salmos 119:105</p>
          </div>

          {/* Assinatura */}
          <div
            className="absolute bottom-10 text-center"
            style={{
              transition: 'opacity 1.6s ease 1.2s',
              opacity: phase === 'enter' ? 0 : 0.75,
            }}
          >
            <div
              className="text-[17px] font-medium"
              style={{ color: '#c9a96e', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }}
            >
              Erick Silva
            </div>
            <div className="text-[11px] text-slate-400 tracking-widest uppercase mt-0.5">
              Pr e The, Ldo. Fil.
            </div>
          </div>

          {/* Barra de progresso — agora 20 s */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <div
              className="h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)',
                width: phase === 'enter' ? '0%' : '100%',
                transition: 'width 19.5s linear 0.2s',
              }}
            />
          </div>

          <style>{\`
            @keyframes twinkle {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.7; }
            }
          \`}</style>
        </div>
      );
    }
    