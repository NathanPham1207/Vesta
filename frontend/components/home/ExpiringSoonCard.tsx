import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

/** Soft orange theme aligned with reference (border, icon, count). */
const ORANGE_ACCENT = '#F97316';
const BORDER_SOFT_ORANGE = '#FDBA74';
const CREAM_BG = '#FFF8F0';

interface ExpiringSoonCardProps {
  count: number;
  onPress?: () => void;
}

export function ExpiringSoonCard({ count, onPress }: ExpiringSoonCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={ORANGE_ACCENT}
            />
            <Text style={styles.label}>Expiring Soon</Text>
          </View>
          <Text style={styles.count}>{count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CREAM_BG,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER_SOFT_ORANGE,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexShrink: 1,
  },
  label: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  count: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.bold,
    color: ORANGE_ACCENT,
  },
  pressed: {
    opacity: 0.92,
  },
});
