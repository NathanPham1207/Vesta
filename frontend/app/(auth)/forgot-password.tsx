import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

/** Placeholder route so login can navigate here. Wire Firebase sendPasswordResetEmail later. */
export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: 'Reset password' }} />
      <View style={styles.box}>
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.sub}>
          Reset flow placeholder — connect Firebase sendPasswordResetEmail here.
        </Text>
        <Link href="/login" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={styles.linkText}>Back to Sign In</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  box: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  title: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sub: { fontSize: FONT_SIZE.body, color: COLORS.subtext, marginBottom: SPACING.xl },
  linkBtn: { alignSelf: 'flex-start' },
  linkText: { fontSize: FONT_SIZE.body, color: COLORS.primary, fontWeight: FONT_WEIGHT.semibold },
});
