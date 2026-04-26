import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import AdminPanel from './AdminPanel';

const WHATSAPP_GROUP = 'https://chat.whatsapp.com/Gt78A68duMBADzzuwnGmbb?mode=gi_t';

export default function LoginGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileError, login, logout } = useAuth();
  const [showAdmin, setShowAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === '1';
    }
    return false;
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const handleOpenAdmin = () => setShowAdmin(true);
    window.addEventListener('open-admin', handleOpenAdmin);
    return () => window.removeEventListener('open-admin', handleOpenAdmin);
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login();
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code === 'auth/unauthorized-domain') {
        setLoginError('Domínio não autorizado no Firebase. Contate o administrador.');
      } else if (code === 'auth/network-request-failed') {
        setLoginError('Sem conexão com a internet. Tente novamente.');
      } else {
        setLoginError(`Erro ao fazer login: ${code || e?.message || 'desconhecido'}`);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-sleek-bg">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center relative overflow-hidden">
        {/* Fundo decorativo tech */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-indigo-500/5 to-transparent rounded-full blur-3xl" />
          {/* Grid de fundo sutil */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(var(--color-sleek-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-sleek-border) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Badge de plataforma */}
        <div className="relative mb-8">
          <span className="text-[9px] font-semibold tracking-[0.35em] uppercase text-sleek-text-muted border border-sleek-border rounded-full px-4 py-1.5 bg-sleek-hover">
            Plataforma de Estudo Bíblico
          </span>
        </div>

        {/* Logo */}
        <div className="relative mb-5">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 ring-1 ring-white/10">
            <span className="text-white text-4xl font-serif font-bold" style={{ textShadow: '0 0 30px rgba(201,169,110,0.6)' }}>α</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-transparent blur-xl pointer-events-none" />
        </div>

        <h1 className="text-3xl font-bold text-sleek-text-main mb-1 tracking-tight">Bíblia Alpha</h1>
        <p className="text-sleek-text-muted mb-8 max-w-xs text-sm leading-relaxed">
          Leia, estude e anote com comentários clássicos, devocionais e planos de leitura.
        </p>

        {loginError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl max-w-sm w-full">
            <p className="text-xs text-red-500 font-mono">{loginError}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-sleek-border rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
          >
            {loginLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            {loginLoading ? 'Entrando...' : 'Entrar com Google'}
          </button>

          {/* WhatsApp grupo */}
          <a
            href={WHATSAPP_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-6 py-3 border border-green-200 rounded-xl hover:bg-green-50 transition-all text-sm text-green-700 font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Entrar no grupo do WhatsApp
          </a>
        </div>

        <p className="mt-6 text-xs text-sleek-text-muted max-w-xs leading-relaxed">
          Acesso restrito a assinantes aprovados. Já é assinante? Faça login com o Google cadastrado.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center">
        {profileError ? (
          <>
            <div className="mb-4 text-red-500">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-sm text-sleek-text-main font-semibold mb-2">Erro ao carregar perfil</span>
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl max-w-sm">
              <p className="text-xs text-red-500 font-mono">{profileError}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                Tentar Novamente
              </button>
              <button onClick={handleLogout} className="px-4 py-2 text-sm text-blue-600 hover:underline">
                Sair
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin mb-4" />
            <span className="text-sm text-sleek-text-main font-semibold mb-2">Acessando perfil...</span>
            <button onClick={handleLogout} className="text-sm text-blue-600 hover:underline mt-4">
              Cancelar / Sair
            </button>
          </>
        )}
      </div>
    );
  }

  const isSuperAdmin = user.email === 'analista.ericksilva@gmail.com';
  const status = isSuperAdmin ? 'approved' : profile.status;
  const isAdminUser = profile.isAdmin || isSuperAdmin;

  if (status === 'pending') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gradient-to-b from-orange-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="mb-5 w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-sleek-text-main mb-2">Acesso Pendente</h1>
        <p className="text-sleek-text-muted mb-8 max-w-sm text-sm leading-relaxed">
          Seu cadastro está em análise. Aguarde a aprovação do administrador. <br />
          Enquanto isso, entre no nosso grupo do WhatsApp para ficar por dentro das novidades e receber suporte.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a
            href={WHATSAPP_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] text-white rounded-xl hover:bg-[#20c45e] transition-all font-semibold shadow-md shadow-green-500/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Entrar no grupo do WhatsApp
          </a>
          <button onClick={handleLogout} className="text-sm text-sleek-text-muted hover:text-sleek-text-main transition-colors">
            Sair / Trocar conta
          </button>
        </div>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center relative overflow-hidden">
        <div className="mb-5 w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-sleek-text-main mb-2">Acesso Bloqueado</h1>
        <p className="text-sleek-text-muted mb-6 max-w-sm text-sm leading-relaxed">
          Sua conta foi bloqueada. Entre no grupo do WhatsApp para falar diretamente com o suporte.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a
            href={WHATSAPP_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 border border-green-200 rounded-xl hover:bg-green-50 transition-all text-sm text-green-700 font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar com suporte
          </a>
          <button onClick={handleLogout} className="text-sm text-sleek-text-muted hover:underline">Sair</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {isAdminUser && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-4 right-4 z-[99] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Abrir Painel Admin"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </button>
      )}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}
