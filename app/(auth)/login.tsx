import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { AUTH_ROUTES } from '@/constants/authRoutes';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
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
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PASSWORD_REQUIRED = 'Password is required.';

type PasswordFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  onBlur?: TextInputProps['onBlur'];
} & Pick<TextInputProps, 'returnKeyType' | 'onSubmitEditing' | 'blurOnSubmit'>;

const PasswordField = React.forwardRef<TextInput, PasswordFieldProps>(
  function PasswordField(
    {
      value,
      onChangeText,
      placeholder,
      error,
      onBlur,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);

    return (
      <View style={styles.passwordWrapper}>
        <AppInput
          ref={ref}
          label="Password"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!visible}
          error={error}
          onBlur={onBlur}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.inputBgWithIcon}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />
        <Pressable
          style={styles.eyeButton}
          onPress={() => setVisible((v) => !v)}
          hitSlop={12}
        >
          <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁'}</Text>
        </Pressable>
      </View>
    );
  },
);

function SocialButton({
  title,
  iconText,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  iconText: string;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.socialButton,
        disabled && styles.socialButtonDisabled,
        pressed && !disabled && styles.socialButtonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="small" />
      ) : (
        <View style={styles.socialInner}>
          <View style={styles.socialIconWrap}>
            <Text style={styles.socialIcon}>{iconText}</Text>
          </View>
          <Text style={styles.socialText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const emailRef = useRef(email);
  const passwordRef = useRef(password);
  emailRef.current = email;
  passwordRef.current = password;

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const onEmailChange = useCallback((text: string) => {
    setEmail(text);
    setTouched((t) => ({ ...t, email: true }));
  }, []);

  const onPasswordChange = useCallback((text: string) => {
    setPassword(text);
    setTouched((t) => ({ ...t, password: true }));
  }, []);

  const showEmailError = touched.email || email.length > 0;
  const emailError = showEmailError
    ? getEmailValidationError(email)
    : undefined;

  const showPasswordError = touched.password || password.length > 0;
  const passwordError =
    showPasswordError && !password.trim() ? PASSWORD_REQUIRED : undefined;

  const canSignIn = isValidEmailFormat(email) && password.trim().length > 0;
  const socialBusy = loading || googleLoading || appleLoading;

  const handleSignIn = async () => {
    if (loading || googleLoading || appleLoading) {
      return;
    }

    setFormError('');
    setTouched({ email: true, password: true });

    const currentEmail = emailRef.current;
    const currentPassword = passwordRef.current;

    if (!isValidEmailFormat(currentEmail) || !currentPassword.trim()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with Firebase Auth (AuthContext.signIn already delegates to mock)
      const result = await signIn(currentEmail, currentPassword);
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

  const handleGoogle = async () => {
    setFormError('');
    setGoogleLoading(true);
    try {
      // TODO: Replace with Firebase Google provider
      await new Promise((r) => setTimeout(r, 900));
      setFormError('Google sign-in is not connected yet.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    setFormError('');
    setAppleLoading(true);
    try {
      // TODO: Replace with Firebase Apple provider
      await new Promise((r) => setTimeout(r, 900));
      setFormError('Apple sign-in is not connected yet.');
    } finally {
      setAppleLoading(false);
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
          <View style={styles.headerBlock}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../assets/images/logo_vesta_clean.png')}
                style={styles.brandLogo}
              />
              <Text style={styles.brandName}>Vesta</Text>
            </View>
            <Text style={styles.subtitle}>
              Welcome back! Track your food inventory.
            </Text>
          </View>

          <AppCard style={styles.card} padding="xl">
            {formError ? (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>{formError}</Text>
              </View>
            ) : null}

            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your credentials to access your account
            </Text>

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
              style={styles.inputBgWithIcon}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />

            <PasswordField
              ref={passwordInputRef}
              value={password}
              onChangeText={onPasswordChange}
              placeholder="Enter your password"
              error={passwordError}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              returnKeyType="go"
              blurOnSubmit
              onSubmitEditing={() => {
                if (loading || googleLoading || appleLoading) {
                  return;
                }
                void handleSignIn();
              }}
            />

            <Pressable
              onPress={() => router.push(AUTH_ROUTES.forgotPassword)}
              hitSlop={12}
              style={({ pressed }) => [
                styles.forgotPressable,
                Platform.OS === 'web' && { cursor: 'pointer' as const },
                pressed && Platform.OS === 'web' && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>

            <AppButton
              title="Sign In"
              onPress={handleSignIn}
              disabled={loading || !canSignIn}
              loading={loading}
              style={styles.signInButton}
              textStyle={styles.signInButtonText}
            />

            <View style={styles.demoBox}>
              <Text style={styles.demoHeader}>Demo Credentials:</Text>
              <Text style={styles.demoLine}>Email: demo@vesta.com</Text>
              <Text style={styles.demoLine}>Password: demo123</Text>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <SocialButton
                title="Google"
                iconText="G"
                onPress={handleGoogle}
                loading={googleLoading}
                disabled={socialBusy && !googleLoading}
              />
              <SocialButton
                title="Apple"
                iconText=""
                onPress={handleApple}
                loading={appleLoading}
                disabled={socialBusy && !appleLoading}
              />
            </View>

            <Pressable
              onPress={() => router.push(AUTH_ROUTES.signup)}
              style={({ pressed }) => [
                styles.signUpRow,
                Platform.OS === 'web' && { cursor: 'pointer' as const },
                pressed && Platform.OS === 'web' && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.footerMuted}>
                Don't have an account?{' '}
              </Text>
              <Text style={styles.footerLink}>Sign up</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  headerBlock: {
    alignItems: 'center',
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
    width: '100%',
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
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    marginBottom: SPACING.lg,
  },
  inputBgWithIcon: {
    backgroundColor: COLORS.muted,
    paddingRight: 44,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  eyeIcon: {
    fontSize: 18,
    lineHeight: 18,
  },
  forgotPressable: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xs,
  },
  forgotLink: {
    fontSize: FONT_SIZE.small,
    color: COLORS.primary,
  },
  signInButton: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  signInButtonText: {
    fontWeight: FONT_WEIGHT.bold,
  },
  demoBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
  },
  demoHeader: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  demoLine: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    marginBottom: SPACING.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    marginHorizontal: SPACING.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  socialButtonPressed: {
    opacity: 0.9,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconWrap: {
    width: 22,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  socialIcon: {
    fontSize: 18,
    lineHeight: 18,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },
  socialText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
    alignItems: 'center',
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
