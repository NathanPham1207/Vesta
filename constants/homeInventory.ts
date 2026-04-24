import { COLORS } from '@/constants/colors';

export type InventoryFreshnessStatus = 'fresh' | 'expiringSoon' | 'expired';

export type InventoryFreshnessFilter = 'all' | InventoryFreshnessStatus;

export type CategoryDetailFilter = InventoryFreshnessFilter;
const FILTER_LABELS: Record<InventoryFreshnessFilter, string> = {
  all: 'All Status',
  fresh: 'Fresh',
  expiringSoon: 'Expiring Soon',
  expired: 'Expired',
};

export function getFilterLabel(filter: InventoryFreshnessFilter): string {
  return FILTER_LABELS[filter];
}

// Sau đó mới đến FILTER_OPTIONS
export const FILTER_ORDER: CategoryDetailFilter[] = [
  'all',
  'fresh',
  'expiringSoon',
  'expired',
];

export const FILTER_OPTIONS = FILTER_ORDER.map((id) => ({
  id,
  label: getFilterLabel(id),
}));

/** Raw lot/batch item from backend (kept separate for expiry accuracy). */
export interface InventoryLotItem {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry?: number;
  status?: 'fresh' | 'expiring soon'| 'expiring_soon' | 'expired';
  createdAt?: string;
  purchaseDate?: string;
}

/**
 * Grouped display row used in Home/category UI.
 * It keeps the underlying raw lots so detail views can inspect each batch.
 */
export interface CategoryInventoryItem {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  categoryId: string;
  totalQuantity: number;
  nearestExpiryDate: string;
  quantityLabel: string;
  daysLeft: number;
  status: InventoryFreshnessStatus;
  lots: InventoryLotItem[];
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

export const CATEGORY_BADGE_STYLES: Record<AttentionInventoryItem['badgeKey'], { backgroundColor: string; color: string }> = {
  dairy: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  fruits: { backgroundColor: '#FCE7F3', color: '#BE185D' },
  meat: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  vegetables: { backgroundColor: '#DCFCE7', color: '#15803D' },
  beverages: { backgroundColor: '#EDE9FE', color: '#5B21B6' },
  groceries: { backgroundColor: '#F3F4F6', color: '#374151' },
};

/**
 * “Expiring soon / attention” rule (adjust as needed):
 * - expired status, or negative daysLeft
 * - OR expires within 0–3 days (inclusive)
 */
export const ATTENTION_MAX_DAYS_LEFT = 3;

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
    case 'expiringSoon':
      return COLORS.warning;
    case 'expired':
      return COLORS.danger;
    default:
      return COLORS.subtext;
  }
}
