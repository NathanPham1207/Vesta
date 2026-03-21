/**
 * Mock home inventory for category / attention modals.
 * TODO: Load item data from Firestore later.
 * TODO: Sync inventory changes from backend.
 */

import { COLORS } from '@/constants/colors';

export type InventoryFreshnessStatus = 'fresh' | 'good' | 'expired';

export type InventoryFreshnessFilter = 'all' | InventoryFreshnessStatus;

/** Item shown inside a category detail popup. */
export interface CategoryInventoryItem {
  id: string;
  name: string;
  categoryId: string;
  quantityLabel: string;
  daysLeft: number;
  status: InventoryFreshnessStatus;
}

/** Item shown in “Items Requiring Attention” popup. */
export interface AttentionInventoryItem {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  statusLine: string;
  status: InventoryFreshnessStatus;
  badgeKey:
    | 'dairy'
    | 'fruits'
    | 'meat'
    | 'vegetables'
    | 'beverages'
    | 'groceries';
}

export const CATEGORY_BADGE_STYLES: Record<
  AttentionInventoryItem['badgeKey'],
  { backgroundColor: string; color: string }
> = {
  dairy: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  fruits: { backgroundColor: '#FCE7F3', color: '#BE185D' },
  meat: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  vegetables: { backgroundColor: '#DCFCE7', color: '#15803D' },
  beverages: { backgroundColor: '#EDE9FE', color: '#5B21B6' },
  groceries: { backgroundColor: '#F3F4F6', color: '#374151' },
};

/** Items per category id (matches mockData categories 1–6). Single seed for local state. */
export const inventoryItemsByCategoryId: Record<string, CategoryInventoryItem[]> = {
  '1': [
    {
      id: 'inv-1-1',
      name: 'Orange Juice',
      categoryId: '1',
      quantityLabel: '1 carton',
      daysLeft: 11,
      status: 'fresh',
    },
  ],
  '2': [
    {
      id: 'inv-2-1',
      name: 'Whole Milk',
      categoryId: '2',
      quantityLabel: '1 gallon',
      daysLeft: 5,
      status: 'good',
    },
    {
      id: 'inv-2-2',
      name: 'Cheddar Cheese',
      categoryId: '2',
      quantityLabel: '1 block',
      daysLeft: 14,
      status: 'fresh',
    },
    {
      id: 'inv-2-3',
      name: 'Butter',
      categoryId: '2',
      quantityLabel: '2 sticks',
      daysLeft: 30,
      status: 'fresh',
    },
    {
      id: 'inv-2-4',
      name: 'Greek Yogurt',
      categoryId: '2',
      quantityLabel: '4 cups',
      daysLeft: 2,
      status: 'good',
    },
  ],
  '3': [
    {
      id: 'inv-3-1',
      name: 'Strawberries',
      categoryId: '3',
      quantityLabel: '1 lb',
      daysLeft: 1,
      status: 'good',
    },
    {
      id: 'inv-3-2',
      name: 'Bananas',
      categoryId: '3',
      quantityLabel: '1 bunch',
      daysLeft: 4,
      status: 'good',
    },
    {
      id: 'inv-3-3',
      name: 'Blueberries',
      categoryId: '3',
      quantityLabel: '1 pint',
      daysLeft: 6,
      status: 'fresh',
    },
  ],
  '4': [
    {
      id: 'inv-4-1',
      name: 'Pasta',
      categoryId: '4',
      quantityLabel: '2 boxes',
      daysLeft: 120,
      status: 'fresh',
    },
    {
      id: 'inv-4-2',
      name: 'Rice',
      categoryId: '4',
      quantityLabel: '1 bag',
      daysLeft: 90,
      status: 'fresh',
    },
    {
      id: 'inv-4-3',
      name: 'Olive Oil',
      categoryId: '4',
      quantityLabel: '1 bottle',
      daysLeft: 60,
      status: 'fresh',
    },
  ],
  '5': [
    {
      id: 'inv-5-1',
      name: 'Chicken Breast',
      categoryId: '5',
      quantityLabel: '2 lbs',
      daysLeft: 1,
      status: 'good',
    },
    {
      id: 'inv-5-2',
      name: 'Ground Beef',
      categoryId: '5',
      quantityLabel: '1 lb',
      daysLeft: 3,
      status: 'good',
    },
  ],
  '6': [
    {
      id: 'inv-6-1',
      name: 'Spinach',
      categoryId: '6',
      quantityLabel: '1 bag',
      daysLeft: 2,
      status: 'good',
    },
    {
      id: 'inv-6-2',
      name: 'Broccoli',
      categoryId: '6',
      quantityLabel: '1 head',
      daysLeft: 5,
      status: 'fresh',
    },
    {
      id: 'inv-6-3',
      name: 'Carrots',
      categoryId: '6',
      quantityLabel: '1 lb',
      daysLeft: 10,
      status: 'fresh',
    },
    {
      id: 'inv-6-4',
      name: 'Tomatoes',
      categoryId: '6',
      quantityLabel: '4 ct',
      daysLeft: 4,
      status: 'good',
    },
    {
      id: 'inv-6-5',
      name: 'Lettuce',
      categoryId: '6',
      quantityLabel: '1 head',
      daysLeft: 3,
      status: 'good',
    },
  ],
};

/** Flatten category buckets into one list — use as initial local state on Home. */
export function flattenInventoryByCategory(
  record: Record<string, CategoryInventoryItem[]>,
): CategoryInventoryItem[] {
  return Object.values(record).flat();
}

export const INITIAL_INVENTORY_ITEMS = flattenInventoryByCategory(
  inventoryItemsByCategoryId,
);

/**
 * “Expiring soon / attention” rule (adjust as needed):
 * - expired status, or negative daysLeft
 * - OR expires within 0–5 days (inclusive)
 */
export const ATTENTION_MAX_DAYS_LEFT = 5;

export function itemRequiresAttention(item: CategoryInventoryItem): boolean {
  if (item.status === 'expired' || item.daysLeft < 0) return true;
  if (item.daysLeft <= ATTENTION_MAX_DAYS_LEFT) return true;
  return false;
}

const CATEGORY_ID_TO_BADGE: Record<
  string,
  AttentionInventoryItem['badgeKey']
> = {
  '1': 'beverages',
  '2': 'dairy',
  '3': 'fruits',
  '4': 'groceries',
  '5': 'meat',
  '6': 'vegetables',
};

export function categoryIdToBadgeKey(
  categoryId: string,
): AttentionInventoryItem['badgeKey'] {
  return CATEGORY_ID_TO_BADGE[categoryId] ?? 'groceries';
}

/** Build attention popup row from shared inventory item + category title. */
export function toAttentionInventoryItem(
  item: CategoryInventoryItem,
  categoryTitle: string,
): AttentionInventoryItem {
  return {
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
    categoryLabel: categoryTitle.toLowerCase(),
    statusLine: formatCategoryItemDetail(item),
    status: item.status,
    badgeKey: categoryIdToBadgeKey(item.categoryId),
  };
}

const FILTER_LABELS: Record<InventoryFreshnessFilter, string> = {
  all: 'All Status',
  fresh: 'Fresh',
  good: 'Good',
  expired: 'Expired',
};

export function getFilterLabel(filter: InventoryFreshnessFilter): string {
  return FILTER_LABELS[filter];
}

export function matchesFreshnessFilter(
  status: InventoryFreshnessStatus,
  filter: InventoryFreshnessFilter,
): boolean {
  if (filter === 'all') return true;
  return status === filter;
}

/** Detail line for category list rows, e.g. "1 carton • 11 days left". */
export function formatCategoryItemDetail(item: CategoryInventoryItem): string {
  if (item.status === 'expired' || item.daysLeft < 0) {
    const ago = Math.abs(item.daysLeft);
    return `${item.quantityLabel} • Expired ${ago} day${ago === 1 ? '' : 's'} ago`;
  }
  if (item.daysLeft === 0) {
    return `${item.quantityLabel} • Expires today`;
  }
  return `${item.quantityLabel} • ${item.daysLeft} day${item.daysLeft === 1 ? '' : 's'} left`;
}

export function statusDotColor(
  status: InventoryFreshnessStatus,
): string {
  switch (status) {
    case 'fresh':
      return COLORS.success;
    case 'good':
      return COLORS.warning;
    case 'expired':
      return COLORS.danger;
    default:
      return COLORS.subtext;
  }
}
