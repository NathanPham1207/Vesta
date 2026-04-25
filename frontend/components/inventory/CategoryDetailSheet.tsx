import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
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
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import type { InventoryItem } from '@/services/auth/inventoryApi';
import {
  FILTER_OPTIONS,
  type CategoryDetailFilter,
} from '@/constants/homeInventory';
import { useCategoryFilter } from '@/hooks/useCategoryFilter';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';

// ─── Constants ───────────────────────────────────────────────────────────────

const SHEET_HEIGHT_RATIO = 0.72;
const SHEET_BORDER_RADIUS = 18;
const HANDLE_WIDTH = 54;
const HANDLE_HEIGHT = 6;
const FILTER_MENU_WIDTH = 180;
const FILTER_MENU_TOP_OFFSET = 52;
const ICON_WRAP_SIZE = 28;
const ICON_BG_COLOR = 'rgba(234, 179, 8, 0.12)';

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryDetailSheetProps = {
  visible: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  items?: InventoryItem[];
  itemCount?: number;
  categoryIcon?: string;
  onDeleteItem?: (id: string) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CategoryDetailSheet({
  visible,
  onClose,
  categoryId,
  categoryName,
  items = [],
  itemCount,
  categoryIcon,
  onDeleteItem,
}: CategoryDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const { search, setSearch, filter, setFilter, categoryItems, filtered } =
    useCategoryFilter(items, categoryId);

  useEffect(() => {
    if (!visible) return;
    setSearch('');
    setFilter('all');
    setIsFilterMenuOpen(false);
  }, [visible, setSearch, setFilter]);

  const displayCount = itemCount ?? categoryItems.length;

  const filterButtonLabel =
    FILTER_OPTIONS.find((o) => o.id === filter)?.label ?? 'All';

  const handleDelete = useCallback((id: string) => {
    if (!id) return;
    onDeleteItem?.(id);
  }, [onDeleteItem]);

  const handleSelectFilter = useCallback((opt: CategoryDetailFilter) => {
    setFilter(opt);
    setIsFilterMenuOpen(false);
  }, [setFilter]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <SafeAreaView style={styles.safeWrap} edges={['bottom']}>
          <View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom }]}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.headerTop}>
              <View style={styles.titleRow}>
                <View style={styles.iconWrap}>
                  <Text style={styles.iconText}>{categoryIcon ?? '🍽️'}</Text>
                </View>
                <View>
                  <Text style={styles.title}>{categoryName}</Text>
                  <Text style={styles.subtitle}>{displayCount} items in this category</Text>
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

            {/* Search + Filter */}
            <View style={styles.controlsRow}>
              <View style={styles.searchControl}>
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search items..."
                />
              </View>

              <View style={styles.filterAnchor}>
                <Pressable
                  onPress={() => setIsFilterMenuOpen((v) => !v)}
                  style={({ pressed }) => [
                    styles.filterButton,
                    pressed && styles.filterButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Filter status"
                >
                  <Text style={styles.filterButtonText}>{filterButtonLabel}</Text>
                  {isFilterMenuOpen
                    ? <ChevronUp size={16} color={COLORS.subtext} />
                    : <ChevronDown size={16} color={COLORS.subtext} />
                  }
                </Pressable>

                {isFilterMenuOpen ? (
                  <>
                    <Pressable
                      style={styles.filterBackdrop}
                      onPress={() => setIsFilterMenuOpen(false)}
                    />
                    <View style={styles.filterMenu}>
                      {FILTER_OPTIONS.map((opt) => {
                        const isSelected = filter === opt.id;
                        return (
                          <Pressable
                            key={opt.id}
                            onPress={() => handleSelectFilter(opt.id)}
                            style={[
                              styles.filterMenuItem,
                              isSelected && styles.filterMenuItemSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.filterMenuItemText,
                                isSelected && styles.filterMenuItemTextSelected,
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

            {/* List */}
            <FlatList
              style={styles.list}
              data={filtered}
              keyExtractor={(it, index) => it.id ?? String(index)}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  safeWrap: {
    width: '100%',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SHEET_BORDER_RADIUS,
    borderTopRightRadius: SHEET_BORDER_RADIUS,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  handle: {
    alignSelf: 'center',
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
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
    width: ICON_WRAP_SIZE,
    height: ICON_WRAP_SIZE,
    borderRadius: ICON_WRAP_SIZE / 2,
    backgroundColor: ICON_BG_COLOR,
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
  filterAnchor: {
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
  filterBackdrop: {
    position: 'absolute',
    left: -SPACING.lg,
    right: -SPACING.lg,
    top: -SPACING.md,
    bottom: -SPACING.lg,
  },
  filterMenu: {
    position: 'absolute',
    top: FILTER_MENU_TOP_OFFSET,
    right: 0,
    width: FILTER_MENU_WIDTH,
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
  list: {
    flex: 1,
    minHeight: 0,
    zIndex: 0,
    elevation: 0,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
