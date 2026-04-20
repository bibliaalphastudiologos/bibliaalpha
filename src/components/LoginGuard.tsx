import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import AdminPanel from './AdminPanel';

type AccessMode = 'idle' | 'guest' | 'google';

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
  const [accessMode, setAccessMode] = useState<AccessMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ba_access_mode') as AccessMode) || 'idle';
    }
    return 'idle';
  });

  useEffect(() => {
    const handleOpenAdmin = () => setShowAdmin(true);
    window.addEventListener('open-admin', handleOpenAdmin);
    return () => window.removeEventListener('open-admin', handleOpenAdmin);
  }, []);

  const handleGuestAccess = () => {
    localStorage.setItem('ba_access_mode', 'guest');
    setAccessMode('guest');
  };

  const handleLogin = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      localStorage.setItem('ba_access_mode', 'google');
      setAccessMode('google');
      await login();
    } catch (e: any) {
      localStorage.removeItem('ba_access_mode');
      setAccessMode('idle');
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
    localStorage.removeItem('ba_access_mode');
    setAccessMode('idle');
    logout();
  };

  // — Guest mode: full access, no auth —
  if (accessMode === 'guest' && !user) {
    return (
      <>
        {children}
        {/* Subtle guest badge */}
        <div className="fixed bottom-3 left-3 z-[99] flex items-center gap-2">
          <span className="text-xs text-sleek-text-muted bg-sleek-bg border border-sleek-border rounded-full px-3 py-1 opacity-60">
            Visitante
          </span>
          <button
            onClick={() => {
              localStorage.removeItem('ba_access_mode');
              setAccessMode('idle');
            }}
            className="text-xs text-blue-500 hover:underline opacity-60"
          >
            Entrar
          </button>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-sleek-bg">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center">
        <div className="mb-6 w-16 h-16 bg-black rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl font-serif font-bold">α</span>
        </div>
        <h1 className="text-2xl font-bold text-sleek-text-main mb-2">Bíblia Alpha</h1>
        <p className="text-sleek-text-muted mb-8 max-w-sm text-sm">
          Leia, estude e anote com comentários clássicos e planos de leitura.
        </p>

        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-sm w-full">
            <p className="text-xs text-red-600 font-mono">{loginError}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-sleek-border rounded-lg shadow-sm hover:bg-gray-50 transition-colors font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            {loginLoading ? 'Entrando...' : 'Entrar com Google'}
          </button>

          <button
            onClick={handleGuestAccess}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-sleek-border rounded-lg hover:bg-sleek-surface transition-colors text-sm text-sleek-text-muted"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Continuar sem login (visitante)
          </button>
        </div>

        <p className="mt-6 text-xs text-sleek-text-muted max-w-xs">
          O modo visitante permite leitura completa. Comentários e planos de leitura requerem login.
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-sm">
              <p className="text-xs text-red-600 font-mono">{profileError}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center">
        <div className="mb-6 text-orange-500">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-sleek-text-main mb-2">Acesso Pendente</h1>
        <p className="text-sleek-text-muted mb-6 max-w-sm text-sm">Seu acesso está em análise. Aguarde aprovação do administrador.</p>
        <div className="flex flex-col gap-2">
          <button onClick={handleGuestAccess} className="px-4 py-2 text-sm bg-sleek-surface border border-sleek-border rounded-lg text-sleek-text-muted hover:bg-sleek-bg">
            Usar como visitante enquanto aguarda
          </button>
          <button onClick={handleLogout} className="text-sm text-blue-600 hover:underline">Sair / Trocar conta</button>
        </div>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sleek-bg p-4 font-sans text-center">
        <div className="mb-6 text-red-500">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-sleek-text-main mb-2">Acesso Bloqueado</h1>
        <p className="text-sleek-text-muted mb-8 max-w-sm">Sua conta foi bloqueada. Contate o administrador.</p>
        <button onClick={handleLogout} className="text-sm text-blue-600 hover:underline">Sair</button>
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
