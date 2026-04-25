import { mockAuthService } from './mockAuthService';
// import { firebaseAuthService } from './firebaseAuthService';

// Used by the UI to simulate network latency while the mock auth service is active.
// When you switch to Firebase Auth, set this to 0 (or remove the usage).
export const AUTH_SIMULATED_LATENCY_MS = 2000;

// Switch this export to `firebaseAuthService` when you connect Firebase Auth.
export const authService = mockAuthService;

