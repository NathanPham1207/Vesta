import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

export function FreshnessGuideCard() {
  return (
    <AppCard>
      <Text style={styles.title}>Freshness Guide</Text>
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, styles.dotFresh]} />
          <Text style={styles.legendText}>Fresh</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, styles.dotGood]} />
          <Text style={styles.legendText}>Good</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, styles.dotExpired]} />
          <Text style={styles.legendText}>Expired</Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotFresh: {
    backgroundColor: COLORS.success,
  },
  dotGood: {
    backgroundColor: COLORS.warning,
  },
  dotExpired: {
    backgroundColor: COLORS.danger,
  },
  legendText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
  },
});
