import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

interface Feature {
  symbol: string;
  text: string;
}

const FEATURES: Feature[] = [
  { symbol: '\u2737', text: 'Bíbia completa com mais de 20 versões e paralelo de versículos' },
  { symbol: '\u2742', text: 'Pesquisa avançada com dicionário, concordância e dicionário Strong' },
  { symbol: '\u25C6', text: 'Biblioteca com centenas de eBooks clássicos do Domínio Público' },
  { symbol: '\u2761', text: 'Bloco de notas pessoal sincronizado com suas leituras' },
  { symbol: '\u25B3', text: 'Planos de leitura guiados para toda a Bíbia' },
  { symbol: '\u2736', text: 'Comentários de grandes teólogos integrados por versículo' },
  { symbol: '\u25CB', text: 'Modo escuro, tipografia ajustável e leitura imersiva' },
];

function FeatureIcon({ symbol }: { symbol: string }) {
  return (
    <div style={{
      width: '52px', height: '52px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', marginBottom: '10px',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1px solid rgba(201,169,110,0.3)',
        animation: 'spinRing 8s linear infinite',
      }} />
      <div style={{
        position: 'absolute', inset: '6px', borderRadius: '50%',
        border: '1px solid rgba(201,169,110,0.18)',
        animation: 'spinRing 5s linear infinite reverse',
      }} />
      <div style={{
        position: 'absolute', inset: '12px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.22) 0%, transparent 70%)',
        filter: 'blur(3px)',
      }} />
      <span style={{
        fontSize: '22px', color: '#c9a96e', position: 'relative', zIndex: 1,
        textShadow: '0 0 12px rgba(201,169,110,0.7), 0 0 24px rgba(201,169,110,0.35)',
        lineHeight: '1', fontFamily: 'serif',
      }}>
        {symbol}
      </span>
    </div>
  );
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const [featureIdx, setFeatureIdx] = useState(0);
  const [featureFade, setFeatureFade] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 9500);
    const t3 = setTimeout(() => onFinish(), 10300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  useEffect(() => {
    if (phase === 'enter') return;
    const interval = setInterval(() => {
      setFeatureFade(false);
      setTimeout(() => {
        setFeatureIdx(i => (i + 1) % FEATURES.length);
        setFeatureFade(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, [phase]);

  const feature = FEATURES[featureIdx];

  const bgLayers = [
    'radial-gradient(ellipse at 20% 50%, rgba(139,92,46,0.28) 0%, transparent 50%)',
    'radial-gradient(ellipse at 80% 20%, rgba(180,130,60,0.20) 0%, transparent 45%)',
    'radial-gradient(ellipse at 60% 80%, rgba(120,80,30,0.22) 0%, transparent 50%)',
    'linear-gradient(150deg, #0d1117 0%, #1a1200 35%, #0d1117 65%, #0a0d14 100%)',
  ].join(', ');

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: bgLayers, transition: 'opacity 0.7s ease', opacity: phase === 'exit' ? 0 : 1 }}
    >
      {/* Partículas determinísticas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 55 }).map((_, i) => {
          const sz = i % 3 === 0 ? 2.2 : 1.1;
          const isGold = i % 3 === 0;
          const top = (i * 17 + 13) % 100;
          const left = (i * 31 + 7) % 100;
          const dur = (2 + (i % 4) * 0.7).toFixed(1);
          const delay = ((i % 6) * 0.5).toFixed(1);
          return (
            <div key={i} className="absolute rounded-full" style={{
              width: sz + 'px', height: sz + 'px',
              top: top + '%', left: left + '%',
              background: isGold ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.18)',
              animation: 'twinkleSplash ' + dur + 's ease-in-out ' + delay + 's infinite',
            }} />
          );
        })}
      </div>

      {/* Grade perspectiva futurista */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.045 }}>
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%', right: '-10%', height: '70%',
          backgroundImage: [
            'linear-gradient(rgba(201,169,110,0.9) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(201,169,110,0.9) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '60px 60px',
          transform: 'perspective(400px) rotateX(65deg)',
          transformOrigin: 'bottom center',
        }} />
      </div>

      {/* Halo dourado */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: '440px', height: '440px',
        background: 'radial-gradient(circle, rgba(201,169,110,0.14) 0%, rgba(180,130,60,0.06) 40%, transparent 70%)',
        filter: 'blur(65px)',
        transition: 'opacity 1.6s ease',
        opacity: phase === 'enter' ? 0 : 1,
      }} />

      {/* Badge topo */}
      <div style={{
        transition: 'opacity 1.2s ease 0.8s, transform 1.2s ease 0.8s',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(-8px)' : 'translateY(0)',
        marginBottom: '22px',
      }}>
        <span style={{
          fontSize: '8.5px', letterSpacing: '0.4em', textTransform: 'uppercase',
          color: '#c9a96e', border: '1px solid rgba(201,169,110,0.35)',
          borderRadius: '100px', padding: '5px 18px',
          background: 'rgba(201,169,110,0.06)',
          boxShadow: '0 0 18px rgba(201,169,110,0.1)',
        }}>
          &#9830; &nbsp; Plataforma Bíblica Completa &nbsp; &#9830;
        </span>
      </div>

      {/* Logo com anéis giratórios */}
      <div style={{
        transition: 'opacity 1.2s ease, transform 1.2s ease',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(24px) scale(0.88)' : 'translateY(0) scale(1)',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', width: '110px', height: '110px', borderRadius: '50%',
          border: '1px solid rgba(201,169,110,0.25)',
          animation: 'spinRing 12s linear infinite',
        }} />
        <div style={{
          position: 'absolute', width: '132px', height: '132px', borderRadius: '50%',
          border: '1px solid rgba(201,169,110,0.12)',
          animation: 'spinRing 18s linear infinite reverse',
        }} />
        <img src="/icon.svg" alt="Bíblica Alpha"
          style={{
            width: '76px', height: '76px', objectFit: 'contain', position: 'relative', zIndex: 1,
            filter: 'drop-shadow(0 0 40px rgba(201,169,110,0.65)) drop-shadow(0 0 16px rgba(201,169,110,0.4))',
          }}
          draggable={false}
        />
      </div>

      {/* Divisor */}
      <div style={{
        margin: '22px 0 18px',
        width: phase === 'enter' ? '0px' : '200px', height: '1px',
        background: 'linear-gradient(90deg, transparent, #c9a96e 30%, #f0d878 50%, #c9a96e 70%, transparent)',
        transition: 'width 1.5s ease 0.5s',
        boxShadow: '0 0 8px rgba(201,169,110,0.4)',
      }} />

      {/* Título */}
      <div className="text-center px-6" style={{
        transition: 'opacity 1.4s ease 0.6s, transform 1.4s ease 0.6s',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(12px)' : 'translateY(0)',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(180,180,200,0.65)', marginBottom: '7px' }}>
          Bem-vindo à
        </p>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#c9a96e', fontFamily: 'Georgia, serif', letterSpacing: '0.04em', lineHeight: '1', textShadow: '0 0 40px rgba(201,169,110,0.45), 0 2px 0 rgba(0,0,0,0.5)' }}>
          Bíblica Alpha
        </h1>
        <p style={{ fontSize: '10.5px', color: 'rgba(160,160,180,0.7)', fontWeight: 300, letterSpacing: '0.32em', textTransform: 'uppercase', marginTop: '9px' }}>
          Estudo &nbsp;&#183;&nbsp; Meditação &nbsp;&#183;&nbsp; Crescimento
        </p>
      </div>

      {/* Frase rotativa com ícone 3D */}
      <div style={{
        marginTop: '28px', minHeight: '80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 1.4s ease 1s',
        opacity: phase === 'enter' ? 0 : 1,
        maxWidth: '320px', width: '100%', padding: '0 24px',
      }}>
        <div style={{
          transition: 'opacity 0.3s ease', opacity: featureFade ? 1 : 0,
          textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <FeatureIcon symbol={feature.symbol} />
          <p style={{ fontSize: '13px', color: 'rgba(200,200,220,0.85)', lineHeight: '1.6', fontStyle: 'italic', marginTop: '2px' }}>
            {feature.text}
          </p>
        </div>
      </div>

      {/* Separador secundário */}
      <div style={{
        marginTop: '20px',
        width: phase === 'enter' ? '0px' : '60px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)',
        transition: 'width 1.5s ease 1.2s',
      }} />

      {/* Versículo */}
      <div style={{
        maxWidth: '300px', marginTop: '16px', padding: '0 24px', textAlign: 'center',
        transition: 'opacity 1.4s ease 1.2s',
        opacity: phase === 'enter' ? 0 : 0.78,
      }}>
        <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(160,160,180,0.75)', lineHeight: '1.65', fontFamily: 'Georgia, serif' }}>
          &ldquo;A tua palavra é lâmpada para os meus pés e luz para o meu caminho.&rdquo;
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(130,130,150,0.55)', marginTop: '5px', letterSpacing: '0.14em' }}>
          &#8212; Salmos 119:105
        </p>
      </div>

      {/* Assinatura */}
      <div className="absolute bottom-10 text-center" style={{
        transition: 'opacity 1.6s ease 1.4s',
        opacity: phase === 'enter' ? 0 : 0.78,
      }}>
        <div style={{ fontSize: '15px', fontWeight: 500, color: '#c9a96e', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
          Erick Silva
        </div>
        <div style={{ fontSize: '9.5px', color: 'rgba(150,150,170,0.6)', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: '3px' }}>
          Pr e The, Ldo. Fil.
        </div>
      </div>

      {/* Dots indicadores */}
      <div className="absolute flex gap-1.5" style={{
        bottom: '28px',
        transition: 'opacity 1.4s ease 1.4s',
        opacity: phase === 'enter' ? 0 : 0.6,
      }}>
        {FEATURES.map((_, i) => (
          <div key={i} style={{
            width: i === featureIdx ? '18px' : '4px', height: '2px', borderRadius: '2px',
            background: i === featureIdx ? '#c9a96e' : 'rgba(201,169,110,0.25)',
            transition: 'all 0.35s ease',
            boxShadow: i === featureIdx ? '0 0 6px rgba(201,169,110,0.5)' : 'none',
          }} />
        ))}
      </div>

      {/* Barra de progresso */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(201,169,110,0.06)' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #c9a96e 40%, #f0d878 50%, #c9a96e 60%, transparent)',
          width: phase === 'enter' ? '0%' : '100%',
          transition: 'width 9.5s linear 0.2s',
          boxShadow: '0 0 6px rgba(201,169,110,0.5)',
        }} />
      </div>

      <style>{'@keyframes twinkleSplash { 0%, 100% { opacity: 0.12; transform: scale(1); } 50% { opacity: 0.75; transform: scale(1.4); } } @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}
