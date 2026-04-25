import type { Session } from './types';

export type AuthService = {
  getSession: () => Promise<Session | null>;
  signIn: (email: string, password: string) => Promise<Session>;
  signUp: (email: string, password: string) => Promise<Session>;
  signInWithGoogle: () => Promise<Session>;
  signInWithApple: () => Promise<Session>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

