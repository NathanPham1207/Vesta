import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

export interface CategoryItem {
  id: string;
  title: string;
  icon: string;
  count: number;
}

interface CategoryCardProps {
  item: CategoryItem;
  onPress?: () => void;
}

export function CategoryCard({ item, onPress }: CategoryCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <AppCard padding="md">
        <Text style={styles.icon}>{item.icon}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.count}>{item.count} items</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  count: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    marginTop: SPACING.xs,
  },
  pressed: {
    opacity: 0.9,
  },
});
