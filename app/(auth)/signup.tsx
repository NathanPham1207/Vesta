import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert } from '@/components/ui/Alert';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { AUTH_SIMULATED_LATENCY_MS } from '@/services/auth';
import { isValidEmail } from '@/utils/validators/authValidators';

export default function SignUpScreen() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const emailError = useMemo(() => {
    if (!email) return '';
    if (!isValidEmail(email)) return 'Please enter a valid email.';
    return '';
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return '';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return '';
    if (confirmPassword !== password) return 'Passwords do not match.';
    return '';
  }, [confirmPassword, password]);

  const canSubmit = useMemo(() => {
    return isValidEmail(email) && password.length >= 6 && confirmPassword === password;
  }, [email, password, confirmPassword]);

  // Required by the assignment: handles validation gating + loading/error UI.
  const handleSignUp = async () => {
    setSubmitError('');
    setLoading(true);
    try {
      if (AUTH_SIMULATED_LATENCY_MS > 0) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, AUTH_SIMULATED_LATENCY_MS),
        );
      }
      await signUp(email, password);
      router.replace('/(tabs)');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.welcome}>Create your account</Text>
          </View>

          <AppCard style={styles.signUpCard}>
            <Text style={styles.cardTitle}>Sign Up</Text>

            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError || undefined}
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              error={passwordError || undefined}
            />

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              error={confirmPasswordError || undefined}
            />

            {submitError ? (
              <Alert variant="destructive" style={styles.submitAlert}>
                <Text style={styles.submitAlertText}>{submitError}</Text>
              </Alert>
            ) : null}

            <AppButton
              title={loading ? 'Creating...' : 'Create Account'}
              onPress={handleSignUp}
              loading={loading}
              disabled={!canSubmit}
              style={styles.signUpButton}
            />

            <Pressable
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInRow}
              hitSlop={12}
            >
              <Text style={styles.signInText}>Already have an account? </Text>
              <Text style={styles.signInLink}>Sign in</Text>
            </Pressable>
          </AppCard>
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
    textAlign: 'center',
  },
  signUpCard: {
    marginBottom: SPACING.xl,
  },
  cardTitle: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  submitAlert: {
    marginBottom: SPACING.lg,
  },
  submitAlertText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.semibold,
  },
  signUpButton: {
    marginTop: SPACING.sm,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  signInText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.subtext,
  },
  signInLink: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
});

