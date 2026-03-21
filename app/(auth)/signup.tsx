import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AUTH_ROUTES } from '@/constants/authRoutes';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import {
  getEmailValidationError,
  isValidEmailFormat,
} from '@/utils/validation/email';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MIN_PASSWORD = 8;
const PASSWORD_REQUIRED = 'Password is required.';
const PASSWORD_TOO_SHORT = `Password must be at least ${MIN_PASSWORD} characters.`;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fullNameRef = useRef(fullName);
  const emailRef = useRef(email);
  const passwordRef = useRef(password);
  const confirmPasswordRef = useRef(confirmPassword);
  fullNameRef.current = fullName;
  emailRef.current = email;
  passwordRef.current = password;
  confirmPasswordRef.current = confirmPassword;

  const fullNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  const onFullNameChange = useCallback((text: string) => {
    setFullName(text);
    setTouched((t) => ({ ...t, fullName: true }));
  }, []);

  const onEmailChange = useCallback((text: string) => {
    setEmail(text);
    setTouched((t) => ({ ...t, email: true }));
  }, []);

  const onPasswordChange = useCallback((text: string) => {
    setPassword(text);
    setTouched((t) => ({ ...t, password: true }));
  }, []);

  const onConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    setTouched((t) => ({ ...t, confirmPassword: true }));
  }, []);

  const showNameError = touched.fullName || fullName.length > 0;
  const nameError =
    showNameError && !fullName.trim() ? 'Name is required.' : undefined;

  const showEmailError = touched.email || email.length > 0;
  const emailError = showEmailError ? getEmailValidationError(email) : undefined;

  const showPasswordError = touched.password || password.length > 0;
  const passwordError = showPasswordError
    ? !password.trim()
      ? PASSWORD_REQUIRED
      : password.trim().length < MIN_PASSWORD
        ? PASSWORD_TOO_SHORT
        : undefined
    : undefined;

  const showConfirmError =
    touched.confirmPassword || confirmPassword.length > 0;
  const confirmError = showConfirmError
    ? !confirmPassword.trim()
      ? 'Please confirm your password.'
      : confirmPassword !== password
        ? 'Passwords do not match.'
        : undefined
    : undefined;

  const passwordsMatch =
    password.trim().length >= MIN_PASSWORD &&
    confirmPassword === password &&
    confirmPassword.trim().length > 0;

  const canSignUp =
    fullName.trim().length > 0 &&
    isValidEmailFormat(email) &&
    password.trim().length >= MIN_PASSWORD &&
    passwordsMatch;

  const goToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(AUTH_ROUTES.login);
    }
  };

  const handleSignUp = async () => {
    if (loading) {
      return;
    }

    setFormError('');
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const name = fullNameRef.current.trim();
    const currentEmail = emailRef.current;
    const currentPassword = passwordRef.current;
    const currentConfirm = confirmPasswordRef.current;

    if (
      !name ||
      !isValidEmailFormat(currentEmail) ||
      currentPassword.trim().length < MIN_PASSWORD ||
      currentConfirm !== currentPassword
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(name, currentEmail, currentPassword);
      if (result.ok) {
        router.replace(AUTH_ROUTES.tabs);
      } else {
        setFormError(result.message);
      }
    } catch {
      setFormError('Something went wrong.');
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
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBlock}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../assets/images/logo_vesta_clean.png')}
                style={styles.brandLogo}
              />
              <Text style={styles.brandName}>Vesta</Text>
            </View>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <AppCard style={styles.card}>
            {formError ? (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>{formError}</Text>
              </View>
            ) : null}
            <Text style={styles.cardTitle}>Sign Up</Text>
            <AppInput
              ref={fullNameInputRef}
              label="Full name"
              value={fullName}
              onChangeText={onFullNameChange}
              placeholder="Jane Doe"
              autoCapitalize="words"
              autoCorrect={false}
              error={nameError}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />
            <AppInput
              ref={emailInputRef}
              label="Email"
              value={email}
              onChangeText={onEmailChange}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            <PasswordInput
              ref={passwordInputRef}
              value={password}
              onChangeText={onPasswordChange}
              placeholder="At least 8 characters"
              error={passwordError}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmInputRef.current?.focus()}
            />
            <PasswordInput
              ref={confirmInputRef}
              label="Confirm password"
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              placeholder="Re-enter your password"
              error={confirmError}
              onBlur={() =>
                setTouched((t) => ({ ...t, confirmPassword: true }))
              }
              returnKeyType="go"
              blurOnSubmit
              onSubmitEditing={() => {
                if (loading) {
                  return;
                }
                void handleSignUp();
              }}
            />
            <AppButton
              title="Create account"
              onPress={handleSignUp}
              disabled={loading || !canSignUp}
              loading={loading}
              style={styles.submitButton}
            />
            <View style={styles.demoBox}>
              <Text style={styles.demoText}>
                Demo: valid email and password (8+ chars). Use taken@test.com to
                see a duplicate-email error.
              </Text>
            </View>
          </AppCard>

          <Pressable
            onPress={goToLogin}
            style={({ pressed }) => [
              styles.footerRow,
              Platform.OS === 'web' && { cursor: 'pointer' as const },
              pressed && Platform.OS === 'web' && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.footerMuted}>Already have an account? </Text>
            <Text style={styles.footerLink}>Sign in</Text>
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  brandLogo: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  brandName: {
    marginLeft: SPACING.sm,
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.subtext,
    textAlign: 'center',
  },
  card: {
    marginBottom: SPACING.xl,
  },
  banner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bannerText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.danger,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  submitButton: {
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  footerMuted: {
    fontSize: FONT_SIZE.body,
    color: COLORS.subtext,
  },
  footerLink: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
