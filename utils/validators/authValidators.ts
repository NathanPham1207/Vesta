export function isValidEmail(email: string) {
  const trimmed = email.trim();
  // Simple email validation suitable for client-side gating.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

