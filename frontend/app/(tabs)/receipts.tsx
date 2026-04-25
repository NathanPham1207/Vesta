import {
  ReceiptHistoryCard,
  ReceiptItemsModal,
  ReceiptSummaryCard,
} from '@/components/receipts';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { getReceipts, type ReceiptItem } from '@/services/auth/receiptApi';
import { useFocusEffect } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_MENU_WIDTH = 200;
const MONTH_MENU_MAX_HEIGHT = 300;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthKey(dateStr: string): string {
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length < 2) return 'Unknown';
  return `${parts[0]}-${parts[1]}`; // Get YYYY-MM from date string
}

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthKey(key: string): string {
  if (key === 'Unknown') return 'Unknown';
  const [year, month] = key.split('-');
  // Dùng UTC để tránh timezone shift khi tạo Date chỉ để format
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);

  // ─── Data loading ───────────────────────────────────────────────────────────

  const loadReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReceipts();
      setReceipts(data);
    } catch (err) {
      console.error('Receipts load error:', err);
      setError('Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts]),
  );

  // ─── Month grouping ─────────────────────────────────────────────────────────

  const availableMonths = useMemo(() => {
    const keys = Array.from(new Set(receipts.map((r) => getMonthKey(r.purchaseDate))));
    return keys.sort((a, b) => b.localeCompare(a)); // newest first
  }, [receipts]);

  // Ensure selected month is valid — fallback to current month
  const resolvedMonth = useMemo(() => {
    if (availableMonths.includes(selectedMonth)) return selectedMonth;
    if (availableMonths.length > 0) return availableMonths[0];
    return selectedMonth;
  }, [availableMonths, selectedMonth]);

  const filteredReceipts = useMemo(
    () => receipts.filter((r) => getMonthKey(r.purchaseDate) === resolvedMonth),
    [receipts, resolvedMonth],
  );

  const summary = useMemo(() => {
    const totalReceipts = filteredReceipts.length;
    const totalSpent = filteredReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
    const averagePerTrip = totalReceipts > 0 ? totalSpent / totalReceipts : 0;
    return { totalReceipts, totalSpent, averagePerTrip };
  }, [filteredReceipts]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleSelectMonth = useCallback((key: string) => {
    setSelectedMonth(key);
    setIsMonthMenuOpen(false);
  }, []);

  const handleReceiptPress = useCallback((receipt: ReceiptItem) => {
    setSelectedReceipt(receipt);
    setIsItemsModalVisible(true);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Receipts</Text>
        <Text style={styles.subtitle}>Your scanned receipt history</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
        ) : null}

        {error ? (
          <Pressable onPress={loadReceipts} style={styles.errorBtn}>
            <Text style={styles.errorText}>{error} Tap to retry.</Text>
          </Pressable>
        ) : null}

        {/* Summary cards — always visible when there is data */}
        {receipts.length > 0 ? (
          <ReceiptSummaryCard
            totalReceipts={summary.totalReceipts}
            totalSpent={summary.totalSpent}
            averagePerTrip={summary.averagePerTrip}
          />
        ) : null}

        {/* Month dropdown — below summary cards */}
        <View style={styles.monthRow}>
          <View style={styles.monthAnchor}>
            <Pressable
              style={({ pressed }) => [
                styles.monthButton,
                isMonthMenuOpen && styles.monthButtonOpen,
                pressed && styles.monthButtonPressed,
              ]}
              onPress={() => setIsMonthMenuOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="Select month"
            >
              <Text style={styles.monthLabelText}>Month</Text>
              <Text style={styles.monthButtonText} numberOfLines={1}>
                {formatMonthKey(resolvedMonth)}
              </Text>
              {isMonthMenuOpen
                ? <ChevronUp size={14} color={COLORS.subtext} />
                : <ChevronDown size={14} color={COLORS.subtext} />
              }
            </Pressable>

            {isMonthMenuOpen ? (
              <>
                <Pressable
                  style={styles.monthBackdrop}
                  onPress={() => setIsMonthMenuOpen(false)}
                />
                <View style={styles.monthMenu}>
                  <ScrollView
                    style={{ maxHeight: MONTH_MENU_MAX_HEIGHT }}
                    showsVerticalScrollIndicator={false}
                  >
                    {availableMonths.length === 0 ? (
                      <Text style={styles.monthMenuEmpty}>No receipts yet</Text>
                    ) : (
                      availableMonths.map((key) => {
                        const isSelected = key === resolvedMonth;
                        return (
                          <Pressable
                            key={key}
                            onPress={() => handleSelectMonth(key)}
                            style={[
                              styles.monthMenuItem,
                              isSelected && styles.monthMenuItemSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.monthMenuItemText,
                                isSelected && styles.monthMenuItemTextSelected,
                              ]}
                            >
                              {formatMonthKey(key)}
                            </Text>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Empty state */}
        {!loading && !error && filteredReceipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>
              {availableMonths.length === 0
                ? 'No receipts yet'
                : `No receipts in ${formatMonthKey(resolvedMonth)}`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {availableMonths.length === 0
                ? 'Scan a receipt to see your purchase history here.'
                : 'Try selecting a different month from the dropdown.'}
            </Text>
          </View>
        ) : null}

        {/* Receipt list */}
        {filteredReceipts.length > 0 ? (
          <View style={styles.listSection}>
            {filteredReceipts.map((receipt) => (
              <ReceiptHistoryCard
                key={receipt.id}
                receipt={receipt}
                onPress={() => handleReceiptPress(receipt)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Receipt items modal */}
      <ReceiptItemsModal
        visible={isItemsModalVisible}
        receipt={selectedReceipt}
        onClose={() => {
          setIsItemsModalVisible(false);
          setSelectedReceipt(null);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    zIndex: 10,
  },

  title: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    marginTop: 2,
  },
  monthLabelText: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  monthRow: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    zIndex: 20,
    alignItems: 'flex-end',
  },
  monthAnchor: {
    position: 'relative',
    alignSelf: 'flex-end',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    maxWidth: 160,
  },
  monthButtonOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  monthButtonPressed: {
    opacity: 0.7,
  },
  monthButtonText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    flex: 1,
  },
  monthBackdrop: {
    position: 'absolute',
    top: -SPACING.md,
    left: -SPACING.lg * 3,
    right: -SPACING.lg,
    bottom: -500,
  },
  monthMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: MONTH_MENU_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    zIndex: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  monthMenuItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  monthMenuItemSelected: {
    backgroundColor: COLORS.muted,
  },
  monthMenuItemText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  monthMenuItemTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  monthMenuEmpty: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loader: {
    marginTop: SPACING.xl,
  },
  errorBtn: {
    marginTop: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    gap: SPACING.sm,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  listSection: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});
