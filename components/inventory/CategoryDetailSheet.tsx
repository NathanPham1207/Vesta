import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { EmptyState } from '@/components/ui/EmptyState';
import type { InventoryItem } from '@/constants/mockInventoryItems';
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';
import { SearchBar } from '@/components/ui/SearchBar';

export type CategoryDetailFilter = 'all' | 'fresh' | 'good' | 'expiringSoon' | 'expired';

type CategoryDetailSheetProps = {
  visible: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  // Optional: keep UI count consistent with where data comes from.
  itemCount?: number;
  // Optional: feed in combined inventory state (fresh/good + attention items).
  items?: InventoryItem[];
  // Optional category icon string/emoji for the header.
  categoryIcon?: string;
};

function filterLabel(filter: Exclude<CategoryDetailFilter, 'all'>) {
  switch (filter) {
    case 'fresh':
      return 'Fresh';
    case 'good':
      return 'Good';
    case 'expiringSoon':
      return 'Expiring';
    case 'expired':
      return 'Expired';
  }
}

export function CategoryDetailSheet({
  visible,
  onClose,
  categoryId,
  categoryName,
  itemCount,
  items = [],
  categoryIcon,
}: CategoryDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * 0.72);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CategoryDetailFilter>('all');
  const [displayItems, setDisplayItems] = useState<InventoryItem[]>(items);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDisplayItems(items);
    setSearch('');
    setFilter('all');
    setIsFilterMenuOpen(false);
  }, [visible, items]);

  const categoryItems = useMemo(() => {
    return displayItems.filter((it) => it.categoryId === categoryId);
  }, [displayItems, categoryId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categoryItems.filter((it) => {
      const matchesText = !q || it.name.toLowerCase().includes(q);
      const matchesStatus = filter === 'all' ? true : it.status === filter;
      return matchesText && matchesStatus;
    });
  }, [categoryItems, search, filter]);

  const subtitleCount =
    typeof itemCount === 'number' ? itemCount : categoryItems.length;

  const filterOrder = useMemo<CategoryDetailFilter[]>(
    () => ['all', 'fresh', 'good', 'expiringSoon', 'expired'],
    [],
  );

  const filterButtonLabel =
    filter === 'all'
      ? 'All Status'
      : filterLabel(filter as Exclude<CategoryDetailFilter, 'all'>);

  const handleDelete = (id: string) => {
    if (!id) return;
    setDisplayItems((prev) => prev.filter((it) => it.id !== id));
  };

  const filterMenuOptions = useMemo(
    () =>
      filterOrder.map((opt) => ({
        id: opt,
        label:
          opt === 'all'
            ? 'All Status'
            : filterLabel(opt as Exclude<CategoryDetailFilter, 'all'>),
      })),
    [filterOrder],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <SafeAreaView style={styles.safeWrap} edges={['bottom']}>
          <View
            style={[
              styles.sheetWrap,
              { height: sheetHeight, paddingBottom: insets.bottom },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.headerTop}>
              <View style={styles.titleRow}>
                <View style={styles.iconWrap}>
                  <Text style={styles.iconText}>{categoryIcon ?? '🍽️'}</Text>
                </View>
                <View>
                  <Text style={styles.title}>{categoryName}</Text>
                  <Text style={styles.subtitle}>{subtitleCount} items in this category</Text>
                </View>
              </View>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={10}
              >
                <X size={18} color={COLORS.subtext} />
              </Pressable>
            </View>

            <View style={styles.controlsRow}>
              <View style={styles.searchControl}>
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search items..."
                />
              </View>

              <View style={styles.filterButtonAnchor}>
                <Pressable
                  onPress={() => setIsFilterMenuOpen((v) => !v)}
                  style={({ pressed }) => [
                    styles.filterButton,
                    pressed ? styles.filterButtonPressed : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Filter status"
                >
                  <Text style={styles.filterButtonText}>
                    {filterButtonLabel}
                  </Text>
                  {isFilterMenuOpen ? (
                    <ChevronUp size={16} color={COLORS.subtext} />
                  ) : (
                    <ChevronDown size={16} color={COLORS.subtext} />
                  )}
                </Pressable>

                {isFilterMenuOpen ? (
                  <>
                    <Pressable
                      style={styles.dropdownBackdrop}
                      onPress={() => setIsFilterMenuOpen(false)}
                    />
                    <View style={styles.filterMenuPanel}>
                      {filterMenuOptions.map((opt) => {
                        const isSelected = filter === opt.id;
                        return (
                          <Pressable
                            key={opt.id}
                            onPress={() => {
                              setFilter(opt.id);
                              setIsFilterMenuOpen(false);
                            }}
                            style={[
                              styles.filterMenuItem,
                              isSelected && styles.filterMenuItemSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.filterMenuItemText,
                                isSelected
                                  ? styles.filterMenuItemTextSelected
                                  : null,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            <FlatList
              style={styles.list}
              data={filtered}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <InventoryItemCard
                  item={item}
                  mode="category"
                  onDelete={handleDelete}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <EmptyState
                  message="No items found"
                  submessage="Try adjusting your search or filter."
                />
              }
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  safeWrap: {
    width: '100%',
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  title: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
  },
  // Compact Search + Filter row
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    zIndex: 5,
  },
  searchControl: {
    flex: 1,
  },
  filterButtonAnchor: {
    position: 'relative',
    zIndex: 10,
  },
  filterButton: {
    minWidth: 132,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterButtonText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  dropdownBackdrop: {
    position: 'absolute',
    left: -SPACING.lg,
    right: -SPACING.lg,
    top: -SPACING.md,
    bottom: -SPACING.lg,
  },
  filterMenuPanel: {
    position: 'absolute',
    top: 52,
    right: 0,
    width: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 20,
  },
  filterMenuItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  filterMenuItemSelected: {
    backgroundColor: COLORS.muted,
  },
  filterMenuItemText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  filterMenuItemTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  list: {
    flex: 1,
    minHeight: 0,
    zIndex: 0,
    elevation: 0,
  },
});

