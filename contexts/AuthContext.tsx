import React, { createContext, useContext, useState, useCallback } from 'react';
import { isValidEmailFormat } from '@/utils/validation/email';
import { mockSignInDelay } from '@/services/auth/mockSignIn';

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string };

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<SignInResult>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    // TODO: Replace mock with Firebase Auth signInWithEmailAndPassword
    const e = email.trim();
    const p = password.trim();

    if (!isValidEmailFormat(e) || !p) {
      return {
        ok: false as const,
        message: 'Please enter a valid email and password.',
      };
    }

    await mockSignInDelay();

    if (e.toLowerCase() === 'fail@test.com') {
      return {
        ok: false as const,
        message: 'Invalid email or password.',
      };
    }

    setIsAuthenticated(true);
    return { ok: true as const };
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      // TODO: Replace mock with Firebase Auth createUserWithEmailAndPassword
      const name = fullName.trim();
      const e = email.trim();
      const p = password.trim();
      const MIN_PASSWORD = 8;

      if (!name) {
        return {
          ok: false as const,
          message: 'Please enter your name.',
        };
      }

      if (!isValidEmailFormat(e)) {
        return {
          ok: false as const,
          message: 'Please enter a valid email address.',
        };
      }

      if (p.length < MIN_PASSWORD) {
        return {
          ok: false as const,
          message: `Password must be at least ${MIN_PASSWORD} characters.`,
        };
      }

      await mockSignInDelay();

      if (e.toLowerCase() === 'taken@test.com') {
        return {
          ok: false as const,
          message: 'An account with this email already exists.',
        };
      }

      setIsAuthenticated(true);
      return { ok: true as const };
    },
    [],
  );

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
