import type { CategoryDetailFilter } from '@/constants/homeInventory';
import type { InventoryItem } from '@/services/auth/inventoryApi';
import { useMemo, useState } from 'react';

type UseCategoryFilterResult = {
  search: string;
  setSearch: (value: string) => void;
  filter: CategoryDetailFilter;
  setFilter: (value: CategoryDetailFilter) => void;
  categoryItems: InventoryItem[];
  filtered: InventoryItem[];
};

// items are pre-filtered by category in HomeScreen.
// This hook only handles search + status filtering.
export function useCategoryFilter(
  items: InventoryItem[],
  categoryId: string,
): UseCategoryFilterResult {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CategoryDetailFilter>('all');

  const categoryItems = items;

  const filtered = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();
    return categoryItems.filter((it) => {
      const matchesText = !searchQuery || it.name.toLowerCase().includes(searchQuery);
      const matchesStatus = filter === 'all' || it.status === filter;
      return matchesText && matchesStatus;
    });
  }, [categoryItems, search, filter]);

  return { search, setSearch, filter, setFilter, categoryItems, filtered };
}