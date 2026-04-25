import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchBar } from '@/components/ui/SearchBar';
import { COLORS } from '@/constants/colors';
import { FILTER_OPTIONS, type CategoryDetailFilter } from '@/constants/homeInventory';
import { SPACING } from '@/constants/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants/typography';
import { useCategoryFilter } from '@/hooks/useCategoryFilter';
import type { InventoryItem } from '@/services/auth/inventoryApi';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryDetailViewProps = {
  categoryId: string;
  categoryName: string;
  items: InventoryItem[];
  itemCount?: number;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CategoryDetailView({
  categoryId,
  categoryName,
  items,
  itemCount,
}: CategoryDetailViewProps) {
  const { search, setSearch, filter, setFilter, categoryItems, filtered } =
    useCategoryFilter(items, categoryId);

  const displayCount = itemCount ?? categoryItems.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{categoryName}</Text>
        <Text style={styles.subtitle}>{displayCount} items in this category</Text>
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
          options={FILTER_OPTIONS}
          selectedId={filter}
          onSelect={(id) => setFilter(id as CategoryDetailFilter)}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it, index) => it.id ?? String(index)}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
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
