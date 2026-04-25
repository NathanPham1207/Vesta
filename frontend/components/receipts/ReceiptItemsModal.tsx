import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import type { ReceiptItem, ReceiptScannedItem } from '@/services/auth/receiptApi';
import React from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_LIST_MAX_HEIGHT = 360;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function ScannedItemRow({ item }: { item: ReceiptScannedItem }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>
          {item.category}
          {item.quantity != null ? ` · Qty: ${item.quantity}` : ''}
          {item.unit ? ` ${item.unit}` : ''}
        </Text>
      </View>
      {item.price != null ? (
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      ) : (
        <Text style={styles.itemPriceNA}>N/A</Text>
      )}
    </View>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  receipt: ReceiptItem | null;
  visible: boolean;
  onClose: () => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ReceiptItemsModal({ receipt, visible, onClose }: Props) {
  if (!receipt) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.card}>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            {/* Header */}
            <Text style={styles.title}>{receipt.storeName}</Text>
            <Text style={styles.subtitle}>{formatDate(receipt.purchaseDate)}</Text>

            {/* Summary row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryChipText}>
                  {receipt.itemCount} items
                </Text>
              </View>
              <Text style={styles.totalAmount}>
                ${receipt.totalAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Items list */}
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {receipt.items.length > 0 ? (
                receipt.items.map((item, index) => (
                  <ScannedItemRow
                    key={`${item.name}-${index}`}
                    item={item}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No item details available.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 2,
    padding: SPACING.xs,
  },
  closeText: {
    fontSize: 18,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.subtext,
  },
  title: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  summaryChip: {
    backgroundColor: COLORS.muted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  summaryChipText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.subtext,
  },
  totalAmount: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  listScroll: {
    maxHeight: ITEMS_LIST_MAX_HEIGHT,
  },
  listContent: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
  },
  itemPrice: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  itemPriceNA: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    paddingVertical: SPACING.xl,
  },
});
