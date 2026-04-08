import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

// Define a simple local User interface to replace Firebase's User type
export interface LocalUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACTIVE_USER_KEY = 'nutriai_active_user';
const USERS_DB_KEY = 'nutriai_users_db'; // to store credentials, though simple for now

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there is an active session
    const active = localStorage.getItem(ACTIVE_USER_KEY);
    if (active) {
      try {
        const parsed = JSON.parse(active);
        setUser(parsed);
      } catch {
        localStorage.removeItem(ACTIVE_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const data = await res.json();
      
      const realUser: LocalUser = {
        uid: data.sub || 'google_' + Math.random().toString(36).substring(2, 9),
        email: data.email,
        displayName: data.name,
        photoURL: data.picture,
      };
      
      // Save Google Drive Access Token locally if we need to backup
      localStorage.setItem('nutriai_google_token', tokenResponse.access_token);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(realUser));
      setUser(realUser);
    } catch (err) {
      console.error('Failed to fetch user profile via google token', err);
    }
  };

  const googleLoginReq = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    scope: 'email profile https://www.googleapis.com/auth/drive.file',
  });

  const signInWithGoogle = async () => {
    googleLoginReq();
  };

  const getDb = () => {
    try {
      const db = localStorage.getItem(USERS_DB_KEY);
      return db ? JSON.parse(db) : {};
    } catch {
      return {};
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await new Promise(res => setTimeout(res, 800));
    const db = getDb();
    if (db[email] && db[email].password === password) {
      const activeUser: LocalUser = {
        uid: db[email].uid,
        email: email,
        displayName: db[email].displayName || 'Usuário',
        photoURL: null,
      };
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));
      setUser(activeUser);
    } else {
      throw new Error('user-not-found');
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    await new Promise(res => setTimeout(res, 800));
    const db = getDb();
    if (db[email]) {
      throw new Error('email-already-in-use');
    }
    const newUid = 'local_' + Math.random().toString(36).substring(2, 9);
    db[email] = { password, uid: newUid, displayName: name };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

    const activeUser: LocalUser = {
      uid: newUid,
      email: email,
      displayName: name,
      photoURL: null,
    };
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));
    setUser(activeUser);
  };

  const signOut = async () => {
    localStorage.removeItem(ACTIVE_USER_KEY);
    setUser(null);
  };

  const continueAsGuest = () => {
    const guestUser: LocalUser = {
      uid: 'guest',
      email: null,
      displayName: 'Visitante (Modo Demo)',
      photoURL: null,
    };
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
