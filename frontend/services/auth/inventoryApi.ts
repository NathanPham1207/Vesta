import { APP_USER_ID } from '@/constants/appUser';
import { BASE_URL, COMMON_HEADERS, JSON_HEADERS } from '@/services/auth/apiConfig';
import { resolveInventoryImageSource } from '@/utils/inventoryImages';

export type InventoryStatus = 'fresh' | 'expiring_soon' | 'expired';
export type InventorySource = 'manual' | 'scan';

export type InventoryItem = {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate?: string | null;
  imageUrl?: string | null;
  purchaseDate?: string | null;
  unit?: string | null;
  source?: InventorySource | null;
  daysUntilExpiry?: number | null;
  daysLeft?: number | null;
  status?: InventoryStatus;
  createdAt?: string;
};

type InventoryApiItem = {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  quantity?: unknown;
  expiryDate?: unknown;
  imageUrl?: unknown;
  purchaseDate?: unknown;
  unit?: unknown;
  source?: unknown;
  daysUntilExpiry?: unknown;
  daysLeft?: unknown;
  status?: unknown;
  createdAt?: unknown;
};

type InventoryListResponse = {
  success?: unknown;
  message?: unknown;
  items?: unknown;
};

type InventoryMutationResponse = {
  success?: unknown;
  message?: unknown;
  items?: unknown;
  id?: unknown;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();

  try {
    return JSON.parse(rawText) as T;
  } catch {
    const preview = rawText.slice(0, 160).trim();
    throw new Error(
      preview
        ? `Inventory API returned non-JSON response: ${preview}`
        : 'Inventory API returned an empty or invalid response.',
    );
  }
}

function toIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function calculateDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) {
    return null;
  }

  const expiryTime = new Date(expiryDate).getTime();
  if (Number.isNaN(expiryTime)) {
    return null;
  }

  return Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
}

function normalizeStatus(rawStatus: unknown, daysLeft: number | null): InventoryStatus {
  if (rawStatus === 'expired') return 'expired';
  if (rawStatus === 'expiring_soon' || rawStatus === 'expiring soon') return 'expiring_soon';
  if (rawStatus === 'fresh' || rawStatus === 'good') return 'fresh';

  if (daysLeft != null) {
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 3) return 'expiring_soon';
  }

  return 'fresh';
}

function toInventoryItem(raw: InventoryApiItem): InventoryItem | null {
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) {
    return null;
  }

  const expiryDate = toIsoDate(raw.expiryDate);
  const daysLeft =
    typeof raw.daysLeft === 'number' && Number.isFinite(raw.daysLeft)
      ? raw.daysLeft
      : calculateDaysUntilExpiry(expiryDate);

  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    name,
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category : 'Misc',
    quantity:
      typeof raw.quantity === 'number' && Number.isFinite(raw.quantity)
        ? raw.quantity
        : Number(raw.quantity ?? 1),
    expiryDate,
    imageUrl: resolveInventoryImageSource(
      name,
      typeof raw.imageUrl === 'string' ? raw.imageUrl : null,
    ),
    purchaseDate: toIsoDate(raw.purchaseDate),
    unit: typeof raw.unit === 'string' ? raw.unit : null,
    source: raw.source === 'manual' || raw.source === 'scan' ? raw.source : null,
    daysUntilExpiry:
      typeof raw.daysUntilExpiry === 'number' && Number.isFinite(raw.daysUntilExpiry)
        ? raw.daysUntilExpiry
        : daysLeft,
    daysLeft,
    status: normalizeStatus(raw.status, daysLeft),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
  };
}

function normalizePayloadItems(items: InventoryItem[]) {
  return items.map((item) => ({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    expiryDate: item.expiryDate,
    imageUrl: item.imageUrl ?? null,
    purchaseDate: item.purchaseDate ?? null,
    unit: item.unit ?? null,
    source: item.source ?? null,
    createdAt: item.createdAt ?? null,
  }));
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await fetch(`${BASE_URL}/inventory/${encodeURIComponent(APP_USER_ID)}`, {
    method: 'GET',
    headers: COMMON_HEADERS,
  });

  const data = await parseJsonResponse<InventoryListResponse>(response);

  if (!response.ok || data.success !== true) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Failed to load inventory.',
    );
  }

  const items = Array.isArray(data.items) ? data.items : [];

  return items
    .map((item) => toInventoryItem(item as InventoryApiItem))
    .filter((item): item is InventoryItem => item !== null);
}

export async function saveInventory(payload: { items: InventoryItem[] }) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('No inventory items to save.');
  }

  const response = await fetch(`${BASE_URL}/inventory/${encodeURIComponent(APP_USER_ID)}`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      items: normalizePayloadItems(payload.items),
    }),
  });

  const data = await parseJsonResponse<InventoryMutationResponse>(response);

  if (!response.ok || data.success !== true) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Failed to save inventory.',
    );
  }

  return data;
}

export async function deleteInventory(itemId: string) {
  if (!itemId?.trim()) {
    throw new Error('Missing inventory item ID.');
  }

  const response = await fetch(
    `${BASE_URL}/inventory/${encodeURIComponent(APP_USER_ID)}/${encodeURIComponent(itemId)}`,
    {
      method: 'DELETE',
      headers: COMMON_HEADERS,
    },
  );

  const data = await parseJsonResponse<InventoryMutationResponse>(response);

  if (!response.ok || data.success !== true) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Failed to delete inventory item.',
    );
  }

  return {
    success: true,
    id: typeof data.id === 'string' ? data.id : itemId,
  };
}
