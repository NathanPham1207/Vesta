import { AuthProvider } from '@/contexts/AuthContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      {/* 2. Wrap the Stack with InventoryProvider so all screens can access it */}
      <InventoryProvider> 
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          {/* 3. Add the profile screen here to make it part of the root stack */}
          <Stack.Screen 
            name="profile" 
            options={{ 
              animation: 'slide_from_right' // Gives it a nice transition
            }} 
          />
        </Stack>
      </InventoryProvider>
    </AuthProvider>
  );
}