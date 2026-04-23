import { ModalTrashButton } from '@/components/home/ModalTrashButton';
import { StatusFilterDropdown } from '@/components/home/StatusFilterDropdown';
import { SearchBar } from '@/components/ui/SearchBar';
import { COLORS } from '@/constants/colors';
import {
  type AttentionInventoryItem,
  type InventoryFreshnessFilter,
  CATEGORY_BADGE_STYLES,
  matchesFreshnessFilter,
  statusDotColor,
} from '@/constants/homeInventory';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const ATTENTION_LIST_MAX_HEIGHT = 360;
const WARNING_ICON_SIZE = 44;
const WARNING_COLOR = COLORS.warning ?? '#F97316';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AttentionItemsModalProps {
  visible: boolean;
  onClose: () => void;
  /** Derived on Home from shared inventory — single source of truth. */
  attentionItems: AttentionInventoryItem[];
  attentionCount: number;
  onDeleteItem: (id: string) => void;
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function AttentionItemRow({
  item,
  onDelete,
}: {
  item: AttentionInventoryItem;
  onDelete: (id: string) => void;
}) {
  const badge = CATEGORY_BADGE_STYLES[item.badgeKey];

  const handleDelete = useCallback(
    () => onDelete(item.id),
    [item.id, onDelete],
  );

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemMain}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemMetaRow}>
          <View style={[styles.dot, { backgroundColor: statusDotColor(item.status) }]} />
          <Text style={styles.statusText}>{item.statusLine}</Text>
          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {item.categoryLabel}
            </Text>
          </View>
        </View>
      </View>
      <ModalTrashButton onPress={handleDelete} />
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AttentionItemsModal({
  visible,
  onClose,
  attentionItems,
  attentionCount,
  onDeleteItem,
}: AttentionItemsModalProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryFreshnessFilter>('all');

  useEffect(() => {
    if (visible) {
      setSearch('');
      setStatusFilter('all');
    }
  }, [visible]);

  const subtitle = useMemo(
    () =>
      `${attentionCount} item${attentionCount === 1 ? '' : 's'} ${
        attentionCount === 1 ? 'is' : 'are'
      } expired or expiring soon`,
    [attentionCount],
  );

  const emptyMessage = useMemo(
    () =>
      attentionItems.length === 0
        ? 'No items currently require attention.'
        : 'No items match your filters.',
    [attentionItems.length],
  );

  const filtered = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();

    return attentionItems.filter((item) => {
      if (!matchesFreshnessFilter(item.status, statusFilter)) return false;
      if (!searchQuery) return true;
      return item.name.toLowerCase().includes(searchQuery);
    });
  }, [attentionItems, search, statusFilter]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet} pointerEvents="box-none">
          <View style={styles.card}>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <View style={styles.warnWrap}>
              <Text style={styles.warnIcon}>!</Text>
            </View>
            <Text style={styles.title}>Items Requiring Attention</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.searchRow}>
              <View style={styles.searchFlex}>
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search items..."
                  variant="minimal"
                />
              </View>
              <StatusFilterDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                resetKey={`${visible}-attention`}
              />
            </View>

            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.map((item) => (
                <AttentionItemRow
                  key={item.id}
                  item={item}
                  onDelete={onDeleteItem}
                />
              ))}
              {filtered.length === 0 ? (
                <Text style={styles.empty}>{emptyMessage}</Text>
              ) : null}
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    zIndex: 1,
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
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.semibold,
  },
  warnWrap: {
    alignSelf: 'center',
    width: WARNING_ICON_SIZE,
    height: WARNING_ICON_SIZE,
    borderRadius: WARNING_ICON_SIZE / 2,
    backgroundColor: WARNING_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  warnIcon: {
    color: COLORS.surface,
    fontSize: 22,
    fontWeight: FONT_WEIGHT.bold,
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
    marginBottom: SPACING.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    zIndex: 20,
  },
  searchFlex: {
    flex: 1,
    minWidth: 0,
  },
  listScroll: {
    maxHeight: ATTENTION_LIST_MAX_HEIGHT,
    zIndex: 0,
  },
  listContent: {
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemMain: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    flexShrink: 1,
    marginRight: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
    textTransform: 'lowercase',
  },
  empty: {
    textAlign: 'center',
    color: COLORS.subtext,
    fontSize: FONT_SIZE.small,
    paddingVertical: SPACING.xl,
  },
});
