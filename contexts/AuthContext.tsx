import { mockSignInDelay } from '@/services/auth/mockSignIn';
import { isValidEmailFormat } from '@/utils/validation/email';
import React, { createContext, useCallback, useContext, useState } from 'react';

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string };

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null; // Tracks the logged-in user [cite: 1]
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
  // State to store user details for the Profile screen [cite: 1]
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
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

    // Success: Update both auth status and user data [cite: 1]
    setIsAuthenticated(true);
    setUser({ name: 'Test User', email: e }); 
    return { ok: true as const };
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
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

      // Success: Save the new user's info [cite: 1]
      setIsAuthenticated(true);
      setUser({ name: name, email: e });
      return { ok: true as const };
    },
    [],
  );

  const signOut = useCallback(() => {
    // Clear everything on logout [cite: 1]
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    // Providing 'user' here fixes the "Property missing" error in App.tsx [cite: 1]
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}