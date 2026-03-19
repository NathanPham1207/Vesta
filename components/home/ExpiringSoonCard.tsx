import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

interface ExpiringSoonCardProps {
  count: number;
  onPress?: () => void;
}

export function ExpiringSoonCard({ count, onPress }: ExpiringSoonCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <AppCard>
        <View style={styles.row}>
          <Text style={styles.label}>Expiring Soon</Text>
          <Text style={styles.count}>{count}</Text>
        </View>
        <Text style={styles.hint}>Items to use or toss</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  count: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning,
  },
  hint: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    marginTop: SPACING.xs,
  },
  pressed: {
    opacity: 0.9,
  },
});
