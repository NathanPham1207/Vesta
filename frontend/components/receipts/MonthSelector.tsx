import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

export interface MonthOption {
  id: string;
  label: string;
}

interface MonthSelectorProps {
  months: MonthOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MonthSelector({
  months,
  selectedId,
  onSelect,
}: MonthSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {months.map((m) => {
        const isSelected = selectedId === m.id;
        return (
          <Pressable
            key={m.id}
            onPress={() => onSelect(m.id)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text
              style={[styles.chipText, isSelected && styles.chipTextSelected]}
            >
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  chipTextSelected: {
    color: COLORS.surface,
  },
});
