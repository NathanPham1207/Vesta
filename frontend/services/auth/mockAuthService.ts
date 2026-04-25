import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from './types';
import type { AuthService } from './authService';
import { isValidEmail } from '@/utils/validators/authValidators';

const SESSION_KEY = '@vesta/auth/session';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function createSession(email: string): Session {
  // Mock user id generator; replace with Firebase uid later.
  const userId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  return { userId, email };
}

export const mockAuthService: AuthService = {
  async getSession() {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<Session>;
      if (
        typeof parsed?.userId === 'string' &&
        typeof parsed?.email === 'string' &&
        isValidEmail(parsed.email)
      ) {
        return { userId: parsed.userId, email: parsed.email };
      }
      return null;
    } catch {
      return null;
    }
  },

  async signIn(email, password) {
    await delay(2000); // Simulated API latency

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      throw new Error('Please enter a valid email.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Deterministic mock failure path for testing the error UI.
    if (trimmedEmail.toLowerCase().includes('error')) {
      throw new Error('Invalid email or password.');
    }

    const session = createSession(trimmedEmail);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async signUp(email, password) {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      throw new Error('Please enter a valid email.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Deterministic mock error path for testing the error UI.
    if (trimmedEmail.toLowerCase().includes('taken') || trimmedEmail.toLowerCase().includes('error')) {
      throw new Error('This email is already registered.');
    }

    const session = createSession(trimmedEmail);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async signInWithGoogle() {
    await delay(2000);
    const email = 'google.user@example.com';
    const session = createSession(email);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async signInWithApple() {
    await delay(2000);
    const email = 'apple.user@example.com';
    const session = createSession(email);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async resetPassword(email) {
    await delay(2000);
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      throw new Error('Please enter a valid email.');
    }
    // Mock behavior: always succeed for valid emails.
    return;
  },

  async signOut() {
    await AsyncStorage.removeItem(SESSION_KEY);
  },
};

