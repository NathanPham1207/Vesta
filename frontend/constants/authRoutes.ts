import type { Href } from 'expo-router';

/** Stable hrefs for auth stack navigation. */
export const AUTH_ROUTES = {
  login: '/login' as Href,
  signup: '/signup' as Href,
  forgotPassword: '/forgot-password' as Href,
  tabs: '/(tabs)' as Href,
} as const;
