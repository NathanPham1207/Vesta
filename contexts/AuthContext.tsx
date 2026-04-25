import { isValidEmailFormat } from '@/utils/validation/email';
import { mockSignInDelay } from '@/services/auth/mockSignIn';
import React, { createContext, useCallback, useContext, useState } from 'react';

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string };

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (fullName: string, email: string, password: string) => Promise<SignInResult>;
  signOut: () => void;
  updateName: (name: string) => { ok: boolean; message?: string };
  updatePassword: (currentPassword: string, newPassword: string) => { ok: boolean; message?: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock password store — in a real app this would be Firebase Auth
const MOCK_PASSWORD_KEY = '__mock_pw__';
let _mockPassword = 'password123';

const MIN_PASSWORD_LENGTH = 8;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const e = email.trim();
    const p = password.trim();

    if (!isValidEmailFormat(e) || !p) {
      return { ok: false, message: 'Please enter a valid email and password.' };
    }

    await mockSignInDelay();

    if (e.toLowerCase() === 'fail@test.com') {
      return { ok: false, message: 'Invalid email or password.' };
    }

    _mockPassword = p;
    const name = e.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    setUser({ name, email: e });
    setIsAuthenticated(true);
    return { ok: true };
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string): Promise<SignInResult> => {
      const name = fullName.trim();
      const e = email.trim();
      const p = password.trim();

      if (!name) return { ok: false, message: 'Please enter your name.' };
      if (!isValidEmailFormat(e)) return { ok: false, message: 'Please enter a valid email address.' };
      if (p.length < MIN_PASSWORD_LENGTH) {
        return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
      }

      await mockSignInDelay();

      if (e.toLowerCase() === 'taken@test.com') {
        return { ok: false, message: 'An account with this email already exists.' };
      }

      _mockPassword = p;
      setUser({ name, email: e });
      setIsAuthenticated(true);
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateName = useCallback((name: string): { ok: boolean; message?: string } => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, message: 'Name cannot be empty.' };
    setUser((prev) => (prev ? { ...prev, name: trimmed } : prev));
    return { ok: true };
  }, []);

  const updatePassword = useCallback(
    (currentPassword: string, newPassword: string): { ok: boolean; message?: string } => {
      if (!currentPassword) return { ok: false, message: 'Please enter your current password.' };
      if (currentPassword !== _mockPassword) return { ok: false, message: 'Current password is incorrect.' };
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return { ok: false, message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
      }
      if (newPassword === currentPassword) {
        return { ok: false, message: 'New password must differ from the current one.' };
      }
      _mockPassword = newPassword;
      return { ok: true };
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, signIn, signUp, signOut, updateName, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
