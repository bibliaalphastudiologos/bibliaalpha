import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Usa o database específico do AI Studio em vez do (default)
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

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const isSuperAdmin = user.email === 'analista.ericksilva@gmail.com';
      await setDoc(userDocRef, {
        email: user.email,
        nome: user.displayName || 'Sem Nome',
        foto: user.photoURL || '',
        status: isSuperAdmin ? 'approved' : 'pending',
        isAdmin: isSuperAdmin,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}
