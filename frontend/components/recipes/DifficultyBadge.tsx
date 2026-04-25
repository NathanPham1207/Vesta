import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const difficultySolid: Record<Difficulty, { bg: string; text: string }> = {
  Easy: { bg: COLORS.success, text: COLORS.surface },
  Medium: { bg: COLORS.warning, text: COLORS.surface },
  Hard: { bg: COLORS.danger, text: COLORS.surface },
};

const difficultySoft: Record<Difficulty, { bg: string; text: string }> = {
  Easy: { bg: '#DCFCE7', text: '#15803D' },
  Medium: { bg: '#FEF9C3', text: '#A16207' },
  Hard: { bg: '#FEE2E2', text: '#B91C1C' },
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  /** `soft` = light pill on white cards (Recipes mockup). */
  variant?: 'solid' | 'soft';
}

export function DifficultyBadge({
  difficulty,
  variant = 'solid',
}: DifficultyBadgeProps) {
  const palette = variant === 'soft' ? difficultySoft : difficultySolid;
  const { bg, text } = palette[difficulty] ?? {
    bg: COLORS.muted,
    text: COLORS.text,
  };
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{difficulty}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignSelf: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
