import { AppCard } from '@/components/ui/AppCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ReceiptItem {
  id: string;
  storeName: string;
  purchaseDate: string;
  totalAmount: number;
  itemCount: number;
}

interface ReceiptHistoryCardProps {
  receipt: ReceiptItem;
  onPress?: () => void;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    timeZone: 'UTC',
  });
}

export function ReceiptHistoryCard({ receipt, onPress }: ReceiptHistoryCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <AppCard padding="md">
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.storeName}>{receipt.storeName}</Text>
            <Text style={styles.date}>{formatDate(receipt.purchaseDate)}</Text>
            <Text style={styles.items}>{receipt.itemCount} items</Text>
          </View>
          <Text style={styles.amount}>${receipt.totalAmount.toFixed(2)}</Text>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {},
  storeName: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    marginTop: SPACING.xs,
  },
  items: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    marginTop: SPACING.xs,
  },
  amount: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  pressed: {
    opacity: 0.9,
  },
});
