import { Search, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { COLORS } from '@/constants/colors';
import type { InventoryItem } from '@/services/auth/inventoryApi';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { Info } from 'lucide-react-native';

export type ExpiringSoonSheetFilter = 'all' | 'expiringSoon' | 'expired';

type ExpiringSoonSheetProps = {
  visible: boolean;
  onClose: () => void;
  // Optional override for real backend later.
  items?: InventoryItem[];
  onItemsChange?: (nextItems: InventoryItem[]) => void;
};

export function ExpiringSoonSheet({
  visible,
  onClose,
  items = [],
  onItemsChange,
}: ExpiringSoonSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * 0.72);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ExpiringSoonSheetFilter>('all');
  const [displayItems, setDisplayItems] = useState<InventoryItem[]>(items);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const focusAnim = React.useRef(new Animated.Value(0)).current;
  const clearAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim, isSearchFocused]);

  const showClear = isSearchFocused && search.trim().length > 0;

  useEffect(() => {
    Animated.timing(clearAnim, {
      toValue: showClear ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [clearAnim, showClear]);

  useEffect(() => {
    if (!visible) return;
    setSearch('');
    setFilter('all');
    setDisplayItems(items);
    setIsSearchFocused(false);
  }, [visible, items]);

  const filterOptions = useMemo(
    () => [
      { id: 'all', label: 'All Status' },
      { id: 'expiringSoon', label: 'Expiring Soon' },
      { id: 'expired', label: 'Expired' },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const normalizeStatus = (status: InventoryItem['status']) => {
      if (status === 'expiring_soon') return 'expiringSoon';
      if (status === 'expired') return 'expired';
      return 'fresh';
    };

    return displayItems.filter((it) => {
      const matchesText = !q || it.name.toLowerCase().includes(q);

      let matchesStatus = true;
      if (filter === 'expired') matchesStatus = normalizeStatus(it.status) === 'expired';
      if (filter === 'expiringSoon') matchesStatus = normalizeStatus(it.status) === 'expiringSoon';

      return matchesText && matchesStatus;
    });
  }, [displayItems, search, filter]);

  const subtitle = `${displayItems.length} items are expired or expiring soon`;

  const handleDelete = (id: string) => {
    if (!id) return;
    setDisplayItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      onItemsChange?.(next);
      return next;
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayPress} onPress={onClose} />

        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View
            style={[
              styles.sheet,
              {
                height: sheetHeight,
                paddingBottom: insets.bottom,
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.infoIconWrap}>
                    <Info size={18} color={COLORS.warning} />
                  </View>
                  <Text style={styles.title}>Items Requiring Attention</Text>
                </View>

                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={10}
                  style={styles.closeBtn}
                >
                  <X size={18} color={COLORS.subtext} />
                </Pressable>
              </View>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <Animated.View
              style={[
                styles.searchRowBase,
                {
                  shadowOpacity: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.12],
                  }),
                  transform: [
                    {
                      scale: focusAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.01],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.searchRowOverlay,
                  {
                    opacity: focusAnim,
                  },
                ]}
              />

              <Search size={16} color={COLORS.subtext} />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search items..."
                placeholderTextColor={COLORS.subtext}
                style={styles.searchInput}
                autoCorrect={false}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                cursorColor={COLORS.primary}
                selectionColor={COLORS.primary}
                underlineColorAndroid="transparent"
              />

              <Animated.View
                style={[
                  styles.clearBtnWrap,
                  {
                    opacity: clearAnim,
                    transform: [
                      {
                        scale: clearAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  },
                ]}
                pointerEvents={showClear ? 'auto' : 'none'}
              >
                <Pressable
                  onPress={() => setSearch('')}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  style={styles.clearBtn}
                >
                  <X size={16} color={COLORS.subtext} />
                </Pressable>
              </Animated.View>
            </Animated.View>

            <View style={styles.filterWrap}>
              <FilterBar
                options={filterOptions}
                selectedId={filter}
                onSelect={(id) => setFilter(id as ExpiringSoonSheetFilter)}
              />
            </View>

            <View style={styles.list}>
              <FlatList
                data={filtered}
                keyExtractor={(it, index) => it.id ?? String(index)}
                renderItem={({ item }) => (
                  <InventoryItemCard item={item} onDelete={handleDelete} />
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

            <View style={styles.bottomSpacer} />
          </View>
        </View>
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
  overlayPress: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  sheet: {
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
    zIndex: 1,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  closeBtn: {
    marginTop: 2,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
  },
  searchRowBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.muted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  searchRowOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    zIndex: 0,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.body,
    paddingVertical: 0,
    fontWeight: FONT_WEIGHT.medium,
    zIndex: 1,
  },
  clearBtnWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  filterWrap: {
    marginBottom: SPACING.md,
  },
  list: {
    flex: 1,
    // Prevent layout shifts: the sheet has a fixed height; only this list scrolls.
    minHeight: 0,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  bottomSpacer: {
    height: 6,
  },
});

