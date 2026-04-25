# Auth Architecture (Mock + Firebase-ready)

This app uses an `AuthService` abstraction so you can swap the backend without changing your UI, route guards, or screens.

## How to connect Firebase Auth
1. Implement `firebaseAuthService.ts` to match the `AuthService` interface:
   - `getSession()`: return the currently authenticated user session (or `null`).
   - `signIn(email, password)`: create a Firebase session and return `{ userId, email }`.
   - `signUp(email, password)`: create a Firebase user and return `{ userId, email }`.
   - `resetPassword(email)`: trigger Firebase password reset email.
   - `signInWithGoogle()`: start Google auth and return `{ userId, email }`.
   - `signInWithApple()`: start Apple auth and return `{ userId, email }`.
   - `signOut()`: sign out and clear the session.
2. Update `services/auth/index.ts`:
   - Replace `mockAuthService` with `firebaseAuthService`.
   - (Optional) keep both and choose based on an env flag.
   - Set `AUTH_SIMULATED_LATENCY_MS` to `0` (or remove the usage in the UI) so you don't add artificial delay.

### Notes
- Your persistence + route protection lives in `AuthContext` and the `RequireAuth/RequireUnauth` components. Those should not need changes when swapping providers.
- Keep the returned `Session` shape (`userId`, `email`) consistent.

