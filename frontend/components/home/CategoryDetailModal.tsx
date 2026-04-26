import type { CategoryItem } from '@/components/home/CategoryCard';
import { ModalTrashButton } from '@/components/home/ModalTrashButton';
import { StatusFilterDropdown } from '@/components/home/StatusFilterDropdown';
import { SearchBar } from '@/components/ui/SearchBar';
import { COLORS } from '@/constants/colors';
import {
  type InventoryFreshnessFilter
} from '@/constants/homeInventory';
import { RADIUS } from '@/constants/radius';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import type { InventoryItem } from '@/services/auth/inventoryApi';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatItemDetail(item: InventoryItem): string {
  const daysLeft = typeof item.daysLeft === 'number' ? item.daysLeft : item.daysUntilExpiry ?? 0;
  if (item.status === 'expired') {
    const ago = Math.abs(daysLeft);
    return `${item.quantity} item${item.quantity === 1 ? '' : 's'} • Expired ${ago} day${ago === 1 ? '' : 's'} ago`;
  }
  if (daysLeft === 0) return `${item.quantity} item${item.quantity === 1 ? '' : 's'} • Expires today`;
  return `${item.quantity} item${item.quantity === 1 ? '' : 's'} • ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
}

function matchesFilter(item: InventoryItem, filter: InventoryFreshnessFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'expiringSoon') return item.status === 'expiring_soon';
  return item.status === filter;
}

function resolveStatusDotColor(item: InventoryItem): string {
  if (item.status === 'expired') return COLORS.danger;
  if (item.status === 'fresh') return COLORS.success;
  return COLORS.warning;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  category: CategoryItem | null;
  items: InventoryItem[];
  onDeleteItem: (id: string) => void;
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function CategoryItemRow({
  item,
  onPress,
  onDelete,
}: {
  item: InventoryItem;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable style={styles.itemCard} onPress={onPress}>
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
      <View style={styles.itemMain}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemMeta}>
          <View style={[styles.dot, { backgroundColor: resolveStatusDotColor(item) }]} />
          <Text style={styles.itemDetail}>{formatItemDetail(item)}</Text>
        </View>
      </View>
      <ModalTrashButton onPress={onDelete} />
    </Pressable>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CategoryDetailModal({
  visible,
  onClose,
  category,
  items: allItems,
  onDeleteItem,
}: CategoryDetailModalProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryFreshnessFilter>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (visible && category) {
      setSearch('');
      setStatusFilter('all');
      setSelectedItem(null);
    }
  }, [visible, category?.id]);

  const filtered = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (!matchesFilter(item, statusFilter)) return false;
      if (!searchQuery) return true;
      return item.name.toLowerCase().includes(searchQuery);
    });
  }, [allItems, search, statusFilter]);

  if (!category) return null;

  const actualCount = allItems.length;
  const countLabel = `${actualCount} item${actualCount === 1 ? '' : 's'} in this category`;
  const emptyMessage = allItems.length === 0
    ? 'No items in this category.'
    : 'No items match your filters.';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet} pointerEvents="box-none">
          <View style={styles.card}>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <View style={styles.headerRow}>
              <Image source={category.icon} style={styles.categoryIcon} resizeMode="contain" />
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
                  key={item.id ?? item.name}
                  item={item}
                  onPress={() => setSelectedItem(item)}
                  onDelete={() => onDeleteItem(item.id ?? '')}
                />
              ))}
              {filtered.length === 0 ? (
                <Text style={styles.empty}>{emptyMessage}</Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Item detail modal */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedItem(null)} />
          <View style={styles.sheet} pointerEvents="box-none">
            <View style={styles.card}>
              <Pressable style={styles.closeBtn} onPress={() => setSelectedItem(null)} hitSlop={12}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>

              {selectedItem?.imageUrl ? (
                <ExpoImage
                  source={{ uri: selectedItem.imageUrl }}
                  style={styles.detailImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={200}
                />
              ) : null}

              <Text style={styles.title}>{selectedItem?.name}</Text>
              <Text style={styles.subtitle}>
                {selectedItem?.quantity} item{selectedItem?.quantity === 1 ? '' : 's'}
                {selectedItem?.expiryDate
                  ? ` • Expires ${selectedItem.expiryDate.slice(0, 10)}`
                  : ''}
              </Text>

              <View style={styles.detailBlock}>
                <DetailRow label="Category" value={selectedItem?.category ?? '—'} />
                <DetailRow label="Status" value={selectedItem?.status ?? '—'} />
                <DetailRow label="Purchase Date" value={selectedItem?.purchaseDate?.slice(0, 10) ?? 'N/A'} />
                <DetailRow label="Expiry Date" value={selectedItem?.expiryDate?.slice(0, 10) ?? 'N/A'} />
                <DetailRow label="Source" value={selectedItem?.source ?? 'N/A'} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginRight: 36,
    marginBottom: SPACING.xs,
  },
  categoryIcon: {
    width: 32,
    height: 32,
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
    gap: SPACING.md,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    flexShrink: 0,
  },
  itemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    flexShrink: 0,
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
  detailImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.muted,
  },
  detailBlock: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONT_SIZE.small,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.subtext,
  },
  detailValue: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
});
