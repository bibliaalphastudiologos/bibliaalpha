import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
  payment_status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  access_status?: 'active' | 'blocked' | 'expired';
  manual_access?: boolean;
  approvalDateBrasilia?: string;
  approvedAt?: unknown;
  paymentId?: string;
  isAdmin?: boolean;
}

/**
 * Inicia o fluxo de login com Google.
 * Mantém o fluxo no domínio atual para evitar mistura entre os produtos.
 */
export async function loginWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function processRedirectResult(): Promise<void> {
  return Promise.resolve();
}
