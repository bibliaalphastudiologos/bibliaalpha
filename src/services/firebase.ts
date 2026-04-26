import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db  = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Email do administrador principal — centralizado aqui para evitar repetição
export const SUPER_ADMIN_EMAIL = 'analista.ericksilva@gmail.com';

// Garante que a sessão persiste no localStorage mesmo após fechar o browser
setPersistence(auth, browserLocalPersistence).catch(e =>
  console.warn('[Auth] Não foi possível definir persistência local:', e)
);

export interface UserProfile {
  email: string;
  nome: string;
  foto: string;
  status: 'pending' | 'approved' | 'blocked';
  isAdmin?: boolean;
}

/**
 * Inicia o fluxo de login com Google.
 * Tenta popup primeiro; se bloqueado faz fallback para redirect.
 */
export async function loginWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    const code = error?.code ?? '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError: any) {
        console.error('Erro no redirect login:', redirectError);
        throw redirectError;
      }
      return;
    }
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function processRedirectResult(): Promise<void> {
  try {
    await getRedirectResult(auth);
  } catch (error: any) {
    if (
      error?.code !== 'auth/popup-closed-by-user' &&
      error?.code !== 'auth/cancelled-popup-request'
    ) {
      console.error('Erro no redirect result:', error);
    }
  }
}
