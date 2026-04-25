import type { AuthService } from './authService';
import type { Session } from './types';

/**
 * FirebaseAuthService (stub)
 *
 * Implement this file to connect Firebase Auth later without touching the rest
 * of the app (AuthContext + route protection + screens).
 */
export const firebaseAuthService: AuthService = {
  async getSession(): Promise<Session | null> {
    throw new Error('firebaseAuthService is not implemented yet.');
  },
  async signIn(_email: string, _password: string): Promise<Session> {
    throw new Error('firebaseAuthService is not implemented yet.');
  },
  async signUp(_email: string, _password: string): Promise<Session> {
    throw new Error('firebaseAuthService is not implemented yet.');
  },
  async signInWithGoogle(): Promise<Session> {
    throw new Error('firebaseAuthService is not implemented yet.');
  },
  async signInWithApple(): Promise<Session> {
    throw new Error('firebaseAuthService is not implemented yet.');
  },
  async resetPassword(_email: string): Promise<void> {
    throw new Error('firebaseAuthService is not implemented yet.');
  },
  async signOut(): Promise<void> {
    throw new Error('firebaseAuthService is not implemented yet.');
  },
};

