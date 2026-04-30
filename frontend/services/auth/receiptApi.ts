import { APP_USER_ID } from '@/constants/appUser';
import type { ScanItem } from '@/services/auth/scanApi';
import { BASE_URL, COMMON_HEADERS, JSON_HEADERS } from '@/services/auth/apiConfig';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReceiptScannedItem = {
  name: string;
  quantity: number | null;
  unit: string | null;
  price: number | null;
  category: string;
};

export type ReceiptItem = {
  id: string;
  storeName: string;
  purchaseDate: string;
  totalAmount: number;
  itemCount: number;
  imageType?: string;
  items: ReceiptScannedItem[];
  createdAt?: string;
};

export type SaveReceiptPayload = {
  storeName: string;
  purchaseDate: string;
  imageType?: string;
  items: ScanItem[];
};

type ReceiptApiItem = {
  id?: unknown;
  storeName?: unknown;
  purchaseDate?: unknown;
  totalAmount?: unknown;
  itemCount?: unknown;
  imageType?: unknown;
  items?: unknown;
  createdAt?: unknown;
};

type ReceiptListResponse = {
  success?: unknown;
  message?: unknown;
  receipts?: unknown;
};

type ReceiptMutationResponse = {
  success?: unknown;
  message?: unknown;
  receipt?: unknown;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();

  try {
    return JSON.parse(rawText) as T;
  } catch {
    const preview = rawText.slice(0, 160).trim();
    throw new Error(
      preview
        ? `Receipt API returned non-JSON response: ${preview}`
        : 'Receipt API returned an empty or invalid response.',
    );
  }
}

function calculateTotalAmount(items: ScanItem[]): number {
  // price is already the total line price from the receipt (not a unit price),
  // so we simply sum each item's price without multiplying by quantity.
  return items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    return sum + price;
  }, 0);
}

function normalizeItems(raw: unknown): ReceiptScannedItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null)
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name : 'Unknown',
      quantity: typeof item.quantity === 'number' ? item.quantity : null,
      unit: typeof item.unit === 'string' ? item.unit : null,
      price: typeof item.price === 'number' ? item.price : null,
      category: typeof item.category === 'string' ? item.category : 'Misc',
    }));
}

function toReceiptItem(raw: ReceiptApiItem): ReceiptItem | null {
  const storeName = typeof raw.storeName === 'string' ? raw.storeName.trim() : 'Unknown store';
  const purchaseDate = typeof raw.purchaseDate === 'string' ? raw.purchaseDate : '';
  const totalAmount = typeof raw.totalAmount === 'number' ? raw.totalAmount : 0;
  const itemCount = typeof raw.itemCount === 'number' ? raw.itemCount : 0;
  const imageType = typeof raw.imageType === 'string' ? raw.imageType : undefined;
  const items = normalizeItems(raw.items);

  if (!purchaseDate) return null;

  return {
    id: typeof raw.id === 'string' ? raw.id : `receipt-${purchaseDate}`,
    storeName,
    purchaseDate,
    totalAmount,
    itemCount,
    imageType,
    items,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getReceipts(): Promise<ReceiptItem[]> {
  const response = await fetch(
    `${BASE_URL}/receipts/${encodeURIComponent(APP_USER_ID)}`,
    {
      method: 'GET',
      headers: COMMON_HEADERS,
    },
  );

  const data = await parseJsonResponse<ReceiptListResponse>(response);

  if (!response.ok || data.success !== true) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Failed to load receipts.',
    );
  }

  const receipts = Array.isArray(data.receipts) ? data.receipts : [];

  return receipts
    .map((item) => toReceiptItem(item as ReceiptApiItem))
    .filter((item): item is ReceiptItem => item !== null);
}

export async function saveReceipt(payload: SaveReceiptPayload): Promise<ReceiptItem> {
  const totalAmount = calculateTotalAmount(payload.items);

  const serializedItems: ReceiptScannedItem[] = payload.items.map((item) => ({
    name: typeof item.name === 'string' ? item.name : 'Unknown',
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    category: typeof item.category === 'string' ? item.category : 'Misc',
  }));

  const response = await fetch(
    `${BASE_URL}/receipts/${encodeURIComponent(APP_USER_ID)}`,
    {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        storeName: payload.storeName.trim() || 'Unknown store',
        purchaseDate: payload.purchaseDate,
        totalAmount,
        itemCount: payload.items.length,
        imageType: payload.imageType ?? 'receipt',
        items: serializedItems,
      }),
    },
  );

  const data = await parseJsonResponse<ReceiptMutationResponse>(response);

  if (!response.ok || data.success !== true) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Failed to save receipt.',
    );
  }

  const receipt = toReceiptItem((data.receipt ?? {}) as ReceiptApiItem);

  if (!receipt) {
    throw new Error('Receipt API returned an invalid receipt payload.');
  }

  return receipt;
}
