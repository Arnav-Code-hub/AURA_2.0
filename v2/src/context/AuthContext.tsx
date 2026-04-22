"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type SessionUser = { uid: string; email: string | null };
export type AuthUser = User | SessionUser | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  isSessionUser: boolean;
  getUid: () => string | null;
  googleSignIn: () => Promise<UserCredential | null>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSessionUser: false,
  getUid: () => null,
  googleSignIn: async () => null,
  logOut: () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getUid = useCallback((): string | null => {
    if (firebaseUser) return firebaseUser.uid;
    if (sessionUser) return sessionUser.uid;
    return null;
  }, [firebaseUser, sessionUser]);

  const googleSignIn = useCallback(async (): Promise<UserCredential | null> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }, []);

  const logOut = useCallback(() => {
    signOut(auth);
    setSessionUser(null);
    // Clear session cookie by calling logout API
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) setSessionUser(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // When no Firebase user, check session (for non-authorized domains)
  useEffect(() => {
    if (firebaseUser !== null) return;
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { user?: SessionUser | null }) => {
        if (!cancelled && data?.user) setSessionUser(data.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  const user: AuthUser = firebaseUser ?? sessionUser ?? null;
  const isSessionUser = !!sessionUser && !firebaseUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSessionUser,
        getUid,
        googleSignIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(AuthContext);
