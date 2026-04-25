import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from '@/components/ui/StatCard';
import { SPACING } from '@/constants/spacing';

interface ReceiptSummaryCardProps {
  totalReceipts: number;
  totalSpent: number;
  averagePerTrip: number;
}

export function ReceiptSummaryCard({
  totalReceipts,
  totalSpent,
  averagePerTrip,
}: ReceiptSummaryCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <StatCard label="Total Receipts" value={totalReceipts} />
      </View>
      <View style={styles.cell}>
        <StatCard label="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
      </View>
      <View style={styles.cell}>
        <StatCard label="Avg per Trip" value={`$${averagePerTrip.toFixed(2)}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
