import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const ok = await signIn(email, password);
      if (ok) {
        router.replace('/(tabs)');
      } else {
        setError('Please enter email and password.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password recovery will be available in a future update.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBlock}>
            <Text style={styles.logo}>Vesta</Text>
            <Text style={styles.welcome}>Welcome back</Text>
          </View>

          <AppCard style={styles.signInCard}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              error={error || undefined}
            />
            <Pressable onPress={handleForgotPassword} hitSlop={12}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
            <AppButton
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              style={styles.signInButton}
            />
            <View style={styles.demoBox}>
              <Text style={styles.demoText}>
                Demo: enter any email and password to continue.
              </Text>
            </View>
          </AppCard>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <AppButton
            title="Continue with Google"
            onPress={() => Alert.alert('Coming soon', 'Google sign-in will be available later.')}
            variant="outline"
            style={styles.socialButton}
          />
          <AppButton
            title="Continue with Apple"
            onPress={() => Alert.alert('Coming soon', 'Apple sign-in will be available later.')}
            variant="outline"
            style={styles.socialButton}
          />

          <Pressable
            onPress={() => Alert.alert('Sign Up', 'Sign up flow will be available in a future update.')}
            style={styles.signUpRow}
          >
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Text style={styles.signUpLink}>Sign up</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  logoBlock: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 40,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  welcome: {
    fontSize: FONT_SIZE.body,
    color: COLORS.subtext,
    marginTop: SPACING.sm,
  },
  signInCard: {
    marginBottom: SPACING.xl,
  },
  cardTitle: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  forgotLink: {
    fontSize: FONT_SIZE.small,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  signInButton: {
    marginTop: SPACING.sm,
  },
  demoBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.muted,
    borderRadius: 8,
  },
  demoText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
  },
  socialButton: {
    marginBottom: SPACING.md,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  signUpText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.subtext,
  },
  signUpLink: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
