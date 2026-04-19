import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Usa o database especifico do AI Studio
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || "(default)");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  email: string;
  nome: string;
  foto: string;
  status: 'pending' | 'approved' | 'blocked';
  isAdmin?: boolean;
}

/**
 * Inicia o fluxo de login com Google.
 * A criacao/atualizacao do perfil no Firestore e feita pelo AuthProvider
 * no listener onAuthStateChanged, garantindo consistencia e evitando duplicacao.
 */
export async function loginWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, googleProvider);
    // AuthProvider.onAuthStateChanged cuida do resto
  } catch (error: any) {
    // Ignorar cancelamento pelo usuario
    if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
      console.error('Erro no login:', error);
      throw error;
    }
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
