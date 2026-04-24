import type { ManualItemSubmitInput } from '@/components/scan/ManualItemModal';
import type { InventoryItem } from '@/services/auth/inventoryApi';
import type {
  ScanAnalysisResult,
  ScanItem,
  ScanReceiptResponse,
} from '@/services/auth/scanApi';
import { calculateExpiryDate, getExpiryDays } from '@/utils/expiry';

// ─── Constants ───────────────────────────────────────────────────────────────

export const SCAN_GENERIC_FAILURE_MESSAGE =
  'Scan failed. Please try again with a food-related image.';

// ─── Item field resolvers ─────────────────────────────────────────────────────

export function resolveItemName(item: ScanItem, index: number): string {
  const normalized = typeof item.name === 'string' ? item.name.trim() : '';
  return normalized || `Item ${index + 1}`;
}

export function resolveItemCategory(item: ScanItem): string {
  return item.category?.trim() || 'Misc';
}

export function resolveStoreName(result: ScanAnalysisResult): string {
  return result.storeName?.trim() || 'Unknown store';
}

export function resolvePurchaseDate(result: ScanAnalysisResult): string {
  return result.purchaseDate || new Date().toISOString();
}

export function formatDisplayDate(dateString: string): string {
  return dateString.slice(0, 10);
}

// ─── Error messages ───────────────────────────────────────────────────────────

export function getScanFailureMessage(reason?: string | null): string {
  switch (reason) {
    case 'non_food_image':
      return 'Please scan a food, drink, grocery, or pantry-related image.';
    case 'unclear_image':
      return 'This image is too unclear. Please try again with a clearer photo.';
    case 'no_food_items_detected':
      return "We couldn't detect any valid food items from this image.";
    default:
      return SCAN_GENERIC_FAILURE_MESSAGE;
  }
}

export function getUnexpectedScanErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();
    if (
      normalized.includes('network') ||
      normalized.includes('failed to fetch') ||
      normalized.includes('request failed')
    ) {
      return 'Network error. Please check your connection and try again.';
    }
  }
  return SCAN_GENERIC_FAILURE_MESSAGE;
}

// ─── Response normalizer ──────────────────────────────────────────────────────

export function normalizeScanResponse(
  response: ScanReceiptResponse,
): ScanAnalysisResult | null {
  if (!response.success) return null;

  const raw = response.data as Partial<ScanAnalysisResult> | undefined;
  const items = Array.isArray(raw?.items) ? raw.items : [];

  if (items.length === 0) return null;

  return {
    isFoodRelated: true,
    imageType: raw?.imageType ?? 'receipt',
    storeName: raw?.storeName ?? 'Unknown store',
    purchaseDate: raw?.purchaseDate ?? null,
    items,
  };
}

// ─── Inventory item builders ──────────────────────────────────────────────────

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveItemExpiryDate(
  item: ScanItem,
  purchaseDate: string,
  index: number,
): string {
  const days = getExpiryDays(resolveItemName(item, index), resolveItemCategory(item));
  return calculateExpiryDate(purchaseDate, days);
}

export function buildInventoryItemsFromScan(result: ScanAnalysisResult): InventoryItem[] {
  const purchaseDate = resolvePurchaseDate(result);

  return result.items.map((item, index) => ({
    name: resolveItemName(item, index),
    category: resolveItemCategory(item),
    quantity: Math.max(1, toNumber(item.quantity, 1)),
    expiryDate: resolveItemExpiryDate(item, purchaseDate, index),
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
    source: 'scan' as const,
  }));
}

export function buildManualInventoryItem(input: ManualItemSubmitInput): InventoryItem {
  return {
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    purchaseDate: input.purchaseDate ?? null,
    expiryDate: input.expiryDate ?? null,
    source: 'manual' as const,
  };
}