import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterBar } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import type {
  InventoryItem,
  InventoryStatus,
} from '@/constants/mockInventoryItems';
import { inventoryItems } from '@/constants/mockInventoryItems';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';

export type CategoryDetailStatusFilter =
  | 'all'
  | 'fresh'
  | 'good'
  | 'expiringSoon'
  | 'expired';

function statusLabel(filter: Exclude<CategoryDetailStatusFilter, 'all'>) {
  if (filter === 'fresh') return 'Fresh';
  if (filter === 'good') return 'Good';
  if (filter === 'expiringSoon') return 'Expiring';
  return 'Expired';
}

export function CategoryDetailView({
  categoryId,
  categoryName,
  itemCount,
}: {
  categoryId: string;
  categoryName: string;
  itemCount?: number;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] =
    useState<CategoryDetailStatusFilter>('all');

  const categoryItems = useMemo(() => {
    return inventoryItems.filter((it) => it.categoryId === categoryId);
  }, [categoryId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categoryItems.filter((it) => {
      const matchesText = !q || it.name.toLowerCase().includes(q);
      const matchesStatus =
        filter === 'all' ? true : it.status === filter;
      return matchesText && matchesStatus;
    });
  }, [categoryItems, search, filter]);

  const filterOptions = useMemo(
    () =>
      ([
        { id: 'all', label: 'All' },
        { id: 'fresh', label: statusLabel('fresh') },
        { id: 'good', label: statusLabel('good') },
        { id: 'expiringSoon', label: statusLabel('expiringSoon') },
        { id: 'expired', label: statusLabel('expired') },
      ] as const),
    [],
  );

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{categoryName}</Text>
        <Text style={styles.subtitle}>
          {typeof itemCount === 'number' ? itemCount : categoryItems.length} items in this category
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search items..."
        />
      </View>

      <View style={styles.filterWrap}>
        <FilterBar
          options={filterOptions as unknown as { id: string; label: string }[]}
          selectedId={filter}
          onSelect={(id) => setFilter(id as CategoryDetailStatusFilter)}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <InventoryItemCard item={item} mode="category" />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            message="No items found"
            submessage="Try adjusting your search or filter."
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.sectionTitle,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.caption,
    color: COLORS.subtext,
    fontWeight: FONT_WEIGHT.medium,
  },
  searchWrap: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filterWrap: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});

