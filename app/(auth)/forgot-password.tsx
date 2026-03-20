import React, { useState } from 'react';
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

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { isValidEmail } from '@/utils/validators/authValidators';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const trimmedEmail = email.trim();
  const isEmailValid = isValidEmail(trimmedEmail);

  const emailError =
    emailTouched && trimmedEmail.length > 0 && !isEmailValid
      ? 'Invalid email format'
      : '';

  const canSubmit = isEmailValid && !loading;

  const handleResetPassword = async () => {
    setSubmitError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await resetPassword(trimmedEmail);
      setSuccessMessage('Password reset link sent');
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
            <Text style={styles.welcome}>Reset your password</Text>
          </View>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>Forgot Password</Text>

            <AppInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                if (!emailTouched) setEmailTouched(true);
                setEmail(text);
              }}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError || undefined}
            />

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}

            <AppButton
              title={loading ? 'Sending...' : 'Send reset link'}
              onPress={handleResetPassword}
              loading={loading}
              disabled={!canSubmit}
              style={styles.resetButton}
            />

            <Pressable
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInRow}
              hitSlop={12}
            >
              <Text style={styles.signInText}>Back to </Text>
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
  card: {
    marginBottom: SPACING.xl,
  },
  cardTitle: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
  },
  successText: {
    color: COLORS.success,
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
  },
  resetButton: {
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

