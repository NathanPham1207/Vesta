import { AppInput } from '@/components/ui/AppInput';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import {
  EXPIRY_WARNING_MAX,
  EXPIRY_WARNING_MIN,
  LOW_STOCK_MAX,
  LOW_STOCK_MIN,
  useSettings,
} from '@/contexts/SettingsContext';
import { Bell, ChevronLeft, Lock, ShoppingCart, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Stepper ─────────────────────────────────────────────────────────────────

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
  unit: string;
}

function Stepper({ value, min, max, onDecrement, onIncrement, unit }: StepperProps) {
  return (
    <View style={stepperStyles.row}>
      <Pressable
        style={[stepperStyles.btn, value <= min && stepperStyles.btnDisabled]}
        onPress={onDecrement}
        disabled={value <= min}
        hitSlop={8}
      >
        <Text style={[stepperStyles.btnLabel, value <= min && stepperStyles.btnLabelDisabled]}>−</Text>
      </Pressable>
      <View style={stepperStyles.valueBox}>
        <Text style={stepperStyles.value}>{value}</Text>
        <Text style={stepperStyles.unit}>{unit}</Text>
      </View>
      <Pressable
        style={[stepperStyles.btn, value >= max && stepperStyles.btnDisabled]}
        onPress={onIncrement}
        disabled={value >= max}
        hitSlop={8}
      >
        <Text style={[stepperStyles.btnLabel, value >= max && stepperStyles.btnLabelDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: COLORS.border,
  },
  btnLabel: {
    fontSize: 20,
    color: COLORS.surface,
    lineHeight: 22,
    fontWeight: FONT_WEIGHT.bold,
  },
  btnLabelDisabled: {
    color: COLORS.subtext,
  },
  valueBox: {
    alignItems: 'center',
    minWidth: 52,
  },
  value: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  unit: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    marginTop: 1,
  },
});

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.card}>
      <View style={sectionStyles.header}>
        {icon}
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
});

// ─── Row layout for stepper sections ─────────────────────────────────────────

function SettingRow({ label, description, right }: { label: string; description: string; right: React.ReactNode }) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.description}>{description}</Text>
      </View>
      {right}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingTop: SPACING.sm,
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  description: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    lineHeight: 16,
  },
});

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginVertical: SPACING.md }} />;
}

// ─── Save button ──────────────────────────────────────────────────────────────

function SaveButton({ onPress, label = 'Save Changes', loading = false }: { onPress: () => void; label?: string; loading?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [saveBtnStyles.btn, pressed && saveBtnStyles.pressed]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={saveBtnStyles.label}>{loading ? 'Saving…' : label}</Text>
    </Pressable>
  );
}

const saveBtnStyles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
  },
});

// ─── Main modal ───────────────────────────────────────────────────────────────

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { user, updateName, updatePassword } = useAuth();
  const { expiryWarningDays, lowStockThreshold, setExpiryWarningDays, setLowStockThreshold } = useSettings();

  // Account section state
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState('');

  // Password section state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Reset transient state each time the modal opens
  const handleShow = useCallback(() => {
    setDisplayName(user?.name ?? '');
    setNameError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  }, [user]);

  // ── Account: save name ────────────────────────────────────────────────────

  const handleSaveName = useCallback(() => {
    setNameError('');
    const result = updateName(displayName);
    if (!result.ok) {
      setNameError(result.message ?? 'Failed to update name.');
      return;
    }
    Alert.alert('Saved', 'Your display name has been updated.');
  }, [displayName, updateName]);

  // ── Account: change password ──────────────────────────────────────────────

  const handleChangePassword = useCallback(() => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const result = updatePassword(currentPassword, newPassword);
    if (!result.ok) {
      setPasswordError(result.message ?? 'Failed to update password.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess(true);
  }, [currentPassword, newPassword, confirmPassword, updatePassword]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={handleShow}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onClose} hitSlop={8}>
            <ChevronLeft size={26} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* ── Section 1: Account Information ────────────────────────── */}
            <Section icon={<User size={18} color={COLORS.primary} />} title="Account Information">
              <AppInput
                label="Display Name"
                value={displayName}
                onChangeText={(t) => { setDisplayName(t); setNameError(''); }}
                placeholder="Your name"
                autoCapitalize="words"
                returnKeyType="done"
                error={nameError}
              />
              <AppInput
                label="Email"
                value={user?.email ?? ''}
                editable={false}
                style={styles.readOnlyInput}
              />
              <SaveButton onPress={handleSaveName} label="Save Name" />
            </Section>

            {/* ── Section 2: Change Password ────────────────────────────── */}
            <Section icon={<Lock size={18} color={COLORS.primary} />} title="Change Password">
              <AppInput
                label="Current Password"
                value={currentPassword}
                onChangeText={(t) => { setCurrentPassword(t); setPasswordError(''); setPasswordSuccess(false); }}
                placeholder="Enter current password"
                secureTextEntry
                returnKeyType="next"
              />
              <AppInput
                label="New Password"
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setPasswordError(''); setPasswordSuccess(false); }}
                placeholder="At least 8 characters"
                secureTextEntry
                returnKeyType="next"
              />
              <AppInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setPasswordError(''); setPasswordSuccess(false); }}
                placeholder="Repeat new password"
                secureTextEntry
                returnKeyType="done"
                error={passwordError}
              />
              {passwordSuccess && (
                <Text style={styles.successText}>Password updated successfully.</Text>
              )}
              <SaveButton onPress={handleChangePassword} label="Update Password" />
            </Section>

            {/* ── Section 3: Expiry Notifications ──────────────────────── */}
            <Section icon={<Bell size={18} color={COLORS.primary} />} title="Expiry Notifications">
              <SettingRow
                label="Warning threshold"
                description={
                  `Items expiring within ${expiryWarningDays} day${expiryWarningDays !== 1 ? 's' : ''} will be flagged and added to your shopping list.`
                }
                right={
                  <Stepper
                    value={expiryWarningDays}
                    min={EXPIRY_WARNING_MIN}
                    max={EXPIRY_WARNING_MAX}
                    unit={expiryWarningDays === 1 ? 'day' : 'days'}
                    onDecrement={() => setExpiryWarningDays(expiryWarningDays - 1)}
                    onIncrement={() => setExpiryWarningDays(expiryWarningDays + 1)}
                  />
                }
              />
            </Section>

            {/* ── Section 4: Low Stock Alert ────────────────────────────── */}
            <Section icon={<ShoppingCart size={18} color={COLORS.primary} />} title="Low Stock Alert">
              <SettingRow
                label="Stock threshold"
                description={
                  `Items with fewer than ${lowStockThreshold} unit${lowStockThreshold !== 1 ? 's' : ''} remaining will be auto-added to your shopping list.`
                }
                right={
                  <Stepper
                    value={lowStockThreshold}
                    min={LOW_STOCK_MIN}
                    max={LOW_STOCK_MAX}
                    unit={lowStockThreshold === 1 ? 'unit' : 'units'}
                    onDecrement={() => setLowStockThreshold(lowStockThreshold - 1)}
                    onIncrement={() => setLowStockThreshold(lowStockThreshold + 1)}
                  />
                }
              />
            </Section>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 34, // mirrors backBtn width to keep title centered
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  readOnlyInput: {
    color: COLORS.subtext,
    backgroundColor: COLORS.muted,
  },
  successText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
});
