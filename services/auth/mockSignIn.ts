/**
 * Mock email/password sign-in delay. Replace with Firebase Auth later.
 * TODO: Replace with Firebase signInWithEmailAndPassword
 */
const DELAY_MS_MIN = 800;
const DELAY_MS_MAX = 1200;

export function mockSignInDelay(): Promise<void> {
  const ms =
    DELAY_MS_MIN +
    Math.floor(Math.random() * (DELAY_MS_MAX - DELAY_MS_MIN + 1));
  return new Promise((resolve) => setTimeout(resolve, ms));
}
