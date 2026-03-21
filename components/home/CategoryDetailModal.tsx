import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import type { CategoryItem } from '@/components/home/CategoryCard';
import { ModalTrashButton } from '@/components/home/ModalTrashButton';
import { StatusFilterDropdown } from '@/components/home/StatusFilterDropdown';
import { COLORS } from '@/constants/colors';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import {
  type CategoryInventoryItem,
  type InventoryFreshnessFilter,
  matchesFreshnessFilter,
  formatCategoryItemDetail,
  statusDotColor,
} from '@/constants/homeInventory';

interface CategoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  category: CategoryItem | null;
  /** From shared Home inventory — single source of truth. */
  items: CategoryInventoryItem[];
  onDeleteItem: (id: string) => void;
}

export function CategoryDetailModal({
  visible,
  onClose,
  category,
  items: allItems,
  onDeleteItem,
}: CategoryDetailModalProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<InventoryFreshnessFilter>('all');

  useEffect(() => {
    if (visible && category) {
      setSearch('');
      setStatusFilter('all');
    }
  }, [visible, category?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (!matchesFreshnessFilter(item.status, statusFilter)) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q);
    });
  }, [allItems, search, statusFilter]);

  const emptyMessage =
    allItems.length === 0
      ? 'No items in this category.'
      : 'No items match your filters.';

  if (!category) return null;

  const countLabel = `${category.count} item${category.count === 1 ? '' : 's'} in this category`;

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
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={12}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <View style={styles.headerRow}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.title}>{category.title}</Text>
            </View>
            <Text style={styles.subtitle}>{countLabel}</Text>

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
                resetKey={`${visible}-${category.id}`}
              />
            </View>

            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.map((item) => (
                <CategoryItemRow
                  key={item.id}
                  item={item}
                  onDelete={() => onDeleteItem(item.id)}
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

function CategoryItemRow({
  item,
  onDelete,
}: {
  item: CategoryInventoryItem;
  onDelete: () => void;
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemMain}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemMeta}>
          <View
            style={[
              styles.dot,
              { backgroundColor: statusDotColor(item.status) },
            ]}
          />
          <Text style={styles.itemDetail}>{formatCategoryItemDetail(item)}</Text>
        </View>
      </View>
      <ModalTrashButton onPress={onDelete} />
    </View>
  );
}

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginRight: 36,
    marginBottom: SPACING.xs,
  },
  categoryIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    flex: 1,
  },
  subtitle: {
    fontSize: FONT_SIZE.small,
    color: COLORS.subtext,
    marginBottom: SPACING.lg,
    textAlign: 'center',
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
    maxHeight: 320,
    zIndex: 0,
  },
  listContent: {
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.muted,
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
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemDetail: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.subtext,
    fontSize: FONT_SIZE.small,
    paddingVertical: SPACING.xl,
  },
});
