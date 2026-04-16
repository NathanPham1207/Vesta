import { COLORS } from '@/constants/colors';
import type { InventoryItem, InventoryStatus } from '@/constants/mockInventoryItems';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type InventoryItemCardProps = {
  item: InventoryItem;
  onDelete?: (id: string) => void;
  mode?: 'attention' | 'category';
};

function statusDotStyle(status: InventoryStatus) {
  if (status === 'expired') return { backgroundColor: COLORS.danger };
  if (status === 'fresh') return { backgroundColor: COLORS.success };
  if (status === 'good') return { backgroundColor: COLORS.warning };
  return { backgroundColor: COLORS.warning };
}

function statusLabel(item: InventoryItem) {
  if (item.status === 'fresh') return 'Fresh';
  if (item.status === 'good') return 'Good';
  if (item.status === 'expiringSoon') return 'Expiring';
  return 'Expired';
}

function statusTextAttention(item: InventoryItem) {
  if (item.status === 'expired') {
    return `Expired ${item.daysAgo ?? 0} days ago`;
  }
  return `Expires in ${item.daysRemaining ?? 0} day${
    (item.daysRemaining ?? 0) === 1 ? '' : 's'
  }`;
}

function statusTextCategory(item: InventoryItem) {
  if (item.status === 'expired') {
    return `Expired${typeof item.daysAgo === 'number' ? ` ${item.daysAgo} days ago` : ''}`;
  }

  const days = item.daysRemaining ?? 0;
  const unit = days === 1 ? 'day' : 'days';
  return `${days} ${unit} left`;
}

function categoryChipStyle(categoryTitle: string) {
  const key = categoryTitle.trim().toLowerCase();
  // Soft, neutral chips; you can map real categories to colors later.
  const bg =
    key === 'dairy'
      ? 'rgba(56, 189, 248, 0.15)'
      : key === 'fruits'
        ? 'rgba(244, 63, 94, 0.12)'
        : key === 'meat'
          ? 'rgba(239, 68, 68, 0.12)'
          : key === 'vegetables'
            ? 'rgba(34, 197, 94, 0.12)'
            : 'rgba(100, 116, 139, 0.14)';
  const border =
    key === 'dairy'
      ? 'rgba(56, 189, 248, 0.25)'
      : key === 'fruits'
        ? 'rgba(244, 63, 94, 0.2)'
        : key === 'meat'
          ? 'rgba(239, 68, 68, 0.2)'
          : key === 'vegetables'
            ? 'rgba(34, 197, 94, 0.22)'
            : 'rgba(100, 116, 139, 0.2)';

  return {
    backgroundColor: bg,
    borderColor: border,
  };
}

export function InventoryItemCard({
  item,
  onDelete,
  mode = 'attention',
}: InventoryItemCardProps) {
  const chip = categoryChipStyle(item.categoryTitle);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={styles.name}>{item.name}</Text>
          {mode === 'category' ? (
            <Text style={styles.qtyText}>
              {item.quantity} {item.quantity === 1 ? 'carton' : 'cartons'}
            </Text>
          ) : null}
          <View style={styles.subRow}>
            <View style={[styles.dot, statusDotStyle(item.status)]} />
            <Text style={styles.statusText}>
              {mode === 'category'
                ? statusTextCategory(item)
                : statusTextAttention(item)}
            </Text>
            {mode === 'attention' ? (
              <View
                style={[
                  styles.chip,
                  {
                    backgroundColor: chip.backgroundColor,
                    borderColor: chip.borderColor,
                  },
                ]}
              >
                <Text style={styles.chipText}>{item.categoryTitle}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {onDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete item"
            onPress={() => onDelete?.(item.id)}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && styles.deleteBtnPressed,
            ]}
            hitSlop={10}
          >
            <Trash2 size={18} color={COLORS.danger} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.muted,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  main: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  qtyText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.xs,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  deleteBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  deleteBtnPressed: {
    opacity: 0.6,
  },
});

