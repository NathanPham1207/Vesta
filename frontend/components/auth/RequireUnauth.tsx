import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function RequireUnauth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'authenticated') return <Redirect href="/(tabs)" />;

  return <>{children}</>;
}

