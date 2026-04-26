import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import type { InventoryItem } from '@/services/auth/inventoryApi';
import { Image as ExpoImage } from 'expo-image';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type InventoryItemCardProps = {
  item: InventoryItem;
  onDelete?: (id: string) => void;
  mode?: 'attention' | 'category';
};

type InventoryCardStatus =
  | 'fresh' | 'good' | 'expiringSoon'
  | 'expiring_soon' | 'expired' | 'expiring soon';

function normalizeStatus(status: InventoryItem['status']): InventoryCardStatus {
  if (status === 'expiring_soon') return 'expiring_soon';
  if (status === 'expired') return 'expired';
  if (status === 'fresh') return 'fresh';
  return 'expiringSoon';
}

function statusDotStyle(status: InventoryCardStatus) {
  if (status === 'expired') return { backgroundColor: COLORS.danger };
  if (status === 'fresh') return { backgroundColor: COLORS.success };
  return { backgroundColor: COLORS.warning };
}

function statusTextAttention(item: InventoryItem): string {
  const daysLeft = typeof item.daysLeft === 'number' ? item.daysLeft : item.daysUntilExpiry ?? 0;
  if (normalizeStatus(item.status) === 'expired') return `Expired ${Math.abs(daysLeft)} days ago`;
  return `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
}

function statusTextCategory(item: InventoryItem): string {
  const daysLeft = typeof item.daysLeft === 'number' ? item.daysLeft : item.daysUntilExpiry ?? 0;
  if (normalizeStatus(item.status) === 'expired') return `Expired ${Math.abs(daysLeft)} days ago`;
  return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;
}

function categoryChipStyle(categoryTitle: string) {
  const key = categoryTitle.trim().toLowerCase();
  const bg =
    key === 'dairy' ? 'rgba(56, 189, 248, 0.15)' :
    key === 'fruits' ? 'rgba(244, 63, 94, 0.12)' :
    key === 'meat' ? 'rgba(239, 68, 68, 0.12)' :
    key === 'vegetables' ? 'rgba(34, 197, 94, 0.12)' :
    'rgba(100, 116, 139, 0.14)';
  const border =
    key === 'dairy' ? 'rgba(56, 189, 248, 0.25)' :
    key === 'fruits' ? 'rgba(244, 63, 94, 0.2)' :
    key === 'meat' ? 'rgba(239, 68, 68, 0.2)' :
    key === 'vegetables' ? 'rgba(34, 197, 94, 0.22)' :
    'rgba(100, 116, 139, 0.2)';
  return { backgroundColor: bg, borderColor: border };
}

export function InventoryItemCard({
  item,
  onDelete,
  mode = 'attention',
}: InventoryItemCardProps) {
  const categoryLabel = item.category?.trim() || 'Misc';
  const chip = categoryChipStyle(categoryLabel);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.imageUrl ? (
          <ExpoImage
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : (
          <View style={styles.itemImagePlaceholder} />
        )}

        <View style={styles.main}>
          <Text style={styles.name}>{item.name}</Text>
          {mode === 'category' ? (
            <Text style={styles.qtyText}>
              {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
            </Text>
          ) : null}
          <View style={styles.subRow}>
            <View style={[styles.dot, statusDotStyle(normalizeStatus(item.status))]} />
            <Text style={styles.statusText}>
              {mode === 'category' ? statusTextCategory(item) : statusTextAttention(item)}
            </Text>
            {mode === 'attention' ? (
              <View style={[styles.chip, { backgroundColor: chip.backgroundColor, borderColor: chip.borderColor }]}>
                <Text style={styles.chipText}>{categoryLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {onDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete item"
            onPress={() => { if (item.id) onDelete?.(item.id); }}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
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
    gap: SPACING.md,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    flexShrink: 0,
  },
  itemImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    flexShrink: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
  deleteBtnPressed: {
    opacity: 0.6,
  },
});
