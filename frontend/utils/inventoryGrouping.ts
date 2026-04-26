import type {
  CategoryInventoryItem,
  InventoryFreshnessStatus,
  InventoryLotItem,
} from '@/constants/homeInventory';
import type { InventoryItem } from '@/services/auth/inventoryApi';

function titleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Normalizes product names so banana / Banana / BANANA group together. */
export function normalizeItemName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

const CATEGORY_ID_BY_NAME: Record<string, string> = {
  bakery: '1',
  beverages: '2',
  condiments: '3',
  dairy: '4',
  frozen: '5',
  fruits: '6',
  meat: '7',
  pantry: '8',
  seafood: '9',
  snacks: '10',
  misc: '11',
  vegetables: '12',
};

export function categoryToId(category: string): string {
  const normalized = category.trim().toLowerCase();
  return CATEGORY_ID_BY_NAME[normalized] ?? '11';
}

function statusFromDaysLeft(daysLeft: number): InventoryFreshnessStatus {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 3) return 'expiringSoon';
  return 'fresh';
}

function resolveDaysUntilExpiry(lot: InventoryLotItem): number {
  if (typeof lot.daysUntilExpiry === 'number' && Number.isFinite(lot.daysUntilExpiry)) {
    return lot.daysUntilExpiry;
  }
  if (lot.status === 'expired') return -1;
  if (lot.status === 'expiring soon') return 1;
  return 4;
}

/**
 * Returns exactly one lot for delete from a grouped item:
 * 1) expired lot with earliest expiry first
 * 2) otherwise nearest upcoming expiry.
 */
export function getPriorityLotToDelete(lots: InventoryLotItem[]): InventoryLotItem | null {
  if (!lots.length) return null;

  const byExpiryAsc = [...lots].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
  );

  const expiredLots = byExpiryAsc.filter((lot) => resolveDaysUntilExpiry(lot) < 0);
  if (expiredLots.length > 0) {
    return expiredLots[0];
  }

  return byExpiryAsc[0] ?? null;
}

function normalizeLotStatus(
  status: string | null | undefined,
): InventoryLotItem['status'] {
  if (status === 'fresh') return 'fresh';
  if (status === 'expired') return 'expired';
  if (status === 'expiring soon' || status === 'expiring_soon') return 'expiring soon';
  return undefined;
}

/**
 * Groups raw backend lots by normalizedName + category for display.
 * Raw lots are preserved in `lots` so detail views can show per-batch expiry.
 */
export function groupInventoryItems(items: InventoryItem[]): CategoryInventoryItem[] {
  const map = new Map<
    string,
    { normalizedName: string; category: string; lots: InventoryLotItem[] }
  >();

  for (const rawItem of items) {
    const normalizedName = normalizeItemName(rawItem.name);
    const category = rawItem.category;
    const normalizedCategory = category.trim().toLowerCase();
    const key = `${normalizedName}::${normalizedCategory}`;

    const lot: InventoryLotItem = {
      id: rawItem.id,
      name: rawItem.name,
      category: rawItem.category,
      quantity: rawItem.quantity,
      expiryDate: rawItem.expiryDate ?? '',
      imageUrl: rawItem.imageUrl ?? null,
      daysUntilExpiry: rawItem.daysUntilExpiry ?? undefined,
      status: normalizeLotStatus(rawItem.status),
      createdAt: rawItem.createdAt,
      purchaseDate: rawItem.purchaseDate ?? undefined,
    };

    const existing = map.get(key);
    if (existing) {
      existing.lots.push(lot);
    } else {
      map.set(key, {
        normalizedName,
        category,
        lots: [lot],
      });
    }
  }

  return Array.from(map.values())
    .map(({ normalizedName, category, lots }) => {
      const totalQuantity = lots.reduce(
        (sum, lot) => sum + (Number.isFinite(lot.quantity) ? lot.quantity : 0),
        0,
      );

      const nearestLot = [...lots].sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
      )[0];

      const nearestExpiryDate = nearestLot.expiryDate;
      const imageUrl =
        nearestLot.imageUrl ??
        lots.find((lot) => typeof lot.imageUrl === 'string' && lot.imageUrl.trim())?.imageUrl ??
        null;
      const daysLeft = resolveDaysUntilExpiry(nearestLot);
      const name = titleCase(normalizedName);

      return {
        id: `${normalizedName}::${category.trim().toLowerCase()}`,
        name,
        normalizedName,
        category,
        categoryId: categoryToId(category),
        totalQuantity,
        nearestExpiryDate,
        imageUrl,
        quantityLabel: `${totalQuantity} item${totalQuantity === 1 ? '' : 's'}`,
        daysLeft,
        status: statusFromDaysLeft(daysLeft),
        lots,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
