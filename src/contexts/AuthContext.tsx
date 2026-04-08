import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

// Lazy-load the Capacitor Google Auth plugin at runtime to avoid hard build dependency
let _googleAuthPlugin: any = null;
async function getGoogleAuthPlugin() {
  if (_googleAuthPlugin) return _googleAuthPlugin;
  try {
    const mod = await import('@codetrix-studio/capacitor-google-auth');
    _googleAuthPlugin = (mod as any).GoogleAuth;
    return _googleAuthPlugin;
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Guest user for demo mode (no Firebase)
const GUEST_USER_KEY = 'nutriai_guest_mode';

const isNativePlatform = Capacitor.isNativePlatform();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Demo mode: check if guest mode was enabled
      const guestMode = localStorage.getItem(GUEST_USER_KEY);
      if (guestMode) {
        setUser({ uid: 'guest', displayName: 'Usuário', email: null, photoURL: null } as unknown as User);
      }
      setLoading(false);
      return;
    }

    // Handle redirect result (web fallback for Google sign-in)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch(() => {
        // No redirect result or error — ignore
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase não configurado');
    }

    if (isNativePlatform) {
      // --- Native Android / iOS via Capacitor Google Auth plugin ---
      const plugin = await getGoogleAuthPlugin();
      if (plugin) {
        try {
          await plugin.initialize({
            clientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || '',
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
          const googleUser = await plugin.signIn();
          const { signInWithCredential, GoogleAuthProvider: GAP } = await import('firebase/auth');
          const credential = GAP.credential(googleUser.authentication.idToken);
          await signInWithCredential(auth, credential);
        } catch (err: any) {
          if (err?.error === 'popup_closed_by_user' || err?.code === '12501') return; // user cancelled
          throw err;
        }
        return;
      }
    }

    // --- Web: try popup first, fall back to redirect ---
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      // popup blocked or unsupported (e.g. in-app browser)
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) throw new Error('Firebase não configurado');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!isFirebaseConfigured || !auth) throw new Error('Firebase não configurado');
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: name });
    setUser({ ...newUser, displayName: name });
  };

  const signOut = async () => {
    if (isNativePlatform) {
      const plugin = await getGoogleAuthPlugin();
      if (plugin) { try { await plugin.signOut(); } catch { /* ignore */ } }
    }
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    localStorage.removeItem(GUEST_USER_KEY);
    setUser(null);
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_USER_KEY, 'true');
    setUser({ uid: 'guest', displayName: 'Visitante', email: null, photoURL: null } as unknown as User);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isFirebaseReady: isFirebaseConfigured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      continueAsGuest,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
