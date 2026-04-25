import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';

interface ManualAddCardProps {
  onAddItem: () => void;
}

export function ManualAddCard({ onAddItem }: ManualAddCardProps) {
  return (
    <AppCard>
      <Text style={styles.sectionTitle}>Or Add Manually</Text>
      <Pressable
        onPress={onAddItem}
        style={({ pressed }) => [
          styles.dashedButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.dashedButtonText}>+ Add Item</Text>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dashedButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedButtonText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: COLORS.muted,
  },
});
