import { APP_USER_ID } from '@/constants/appUser';
import { getFirestoreDb } from '@/services/firestore/client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';

export type InventoryStatus = "fresh" | "expiring_soon" | "expired";
export type InventorySource = "manual" | "scan";

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

type InventoryDoc = {
  name?: unknown;
  category?: unknown;
  quantity?: unknown;
  expiryDate?: unknown;
  imageUrl?: unknown;
  purchaseDate?: unknown;
  unit?: unknown;
  source?: unknown;
  daysUntilExpiry?: unknown;
  status?: unknown;
  createdAt?: Timestamp | null;
};

function toIsoDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function calculateDaysUntilExpiry(expiryDate: string): number {
  const expiryTime = new Date(expiryDate).getTime();
  const now = Date.now();
  return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
}

function normalizeStatus(rawStatus: unknown, daysUntilExpiry: number): InventoryStatus {
  if (rawStatus === 'expired') return 'expired';
  if (rawStatus === 'expiring_soon' || rawStatus === 'expiring soon') return 'expiring_soon';
  if (rawStatus === 'fresh') return 'fresh';

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 3) return 'expiring_soon';
  return 'fresh';
}

function toInventoryItem(snapshot: QueryDocumentSnapshot<InventoryDoc>): InventoryItem | null {
  const data = snapshot.data();
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const category = typeof data.category === 'string' ? data.category.trim() : 'Misc';
  const quantity = typeof data.quantity === 'number' ? data.quantity : Number(data.quantity ?? 1);
  const expiryDate = toIsoDate(data.expiryDate);
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : null;
  const purchaseDate = toIsoDate(data.purchaseDate);
  const unit = typeof data.unit === 'string' ? data.unit : null;
  const source = data.source === 'manual' || data.source === 'scan' ? data.source : null;

  if (!name || !expiryDate) {
    return null;
  }

  const resolvedQuantity = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;
  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);

  return {
    id: snapshot.id,
    name,
    category: category || 'Misc',
    quantity: resolvedQuantity,
    expiryDate,
    imageUrl,
    purchaseDate: purchaseDate ?? null,
    unit,
    source,
    daysUntilExpiry:
      typeof data.daysUntilExpiry === 'number' && Number.isFinite(data.daysUntilExpiry)
        ? data.daysUntilExpiry
        : daysUntilExpiry,
    daysLeft: daysUntilExpiry,
    status: normalizeStatus(data.status, daysUntilExpiry),
    createdAt: data.createdAt?.toDate().toISOString(),
  };
}

function inventoryCollection() {
  const db = getFirestoreDb();
  return collection(db, 'users', APP_USER_ID, 'pantryItems');
}

export async function getInventory(): Promise<InventoryItem[]> {
  const snapshots = await getDocs(query(inventoryCollection(), orderBy('createdAt', 'desc')));

  return snapshots.docs
    .map((snapshot) => toInventoryItem(snapshot as QueryDocumentSnapshot<InventoryDoc>))
    .filter((item): item is InventoryItem => item !== null);
}

export function subscribeInventory(callback: (items: InventoryItem[]) => void): () => void {
  const q = query(inventoryCollection(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map((snapshot) => toInventoryItem(snapshot as QueryDocumentSnapshot<InventoryDoc>))
      .filter((item): item is InventoryItem => item !== null);
    callback(items);
  });
}

export async function saveInventory(payload: { items: InventoryItem[] }) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('No inventory items to save.');
  }

  const collectionRef = inventoryCollection();
  const writeResults = await Promise.all(
    payload.items.map(async (item) => {
      const name = item.name?.trim();
      if (!name) {
        throw new Error('Inventory item name is required.');
      }

      const quantity = Number.isFinite(item.quantity) ? Math.max(1, item.quantity) : 1;
      const expiryDate = toIsoDate(item.expiryDate);
      const purchaseDate = toIsoDate(item.purchaseDate) ?? new Date().toISOString();

      if (!expiryDate) {
        throw new Error(`Inventory item "${name}" has an invalid expiry date.`);
      }

      const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
      const status = normalizeStatus(item.status, daysUntilExpiry);
      const source = item.source === 'scan' ? 'scan' : 'manual';

      return addDoc(collectionRef, {
        name,
        category: item.category?.trim() || 'Misc',
        quantity,
        expiryDate,
        purchaseDate,
        unit: item.unit ?? null,
        source,
        daysUntilExpiry,
        status,
        imageUrl: item.imageUrl ?? null,
        createdAt: serverTimestamp(),
      });
    }),
  );

  return {
    success: true,
    savedCount: writeResults.length,
    ids: writeResults.map((result) => result.id),
  };
}

export async function deleteInventory(itemId: string) {
  if (!itemId?.trim()) {
    throw new Error('Missing inventory item ID.');
  }

  const db = getFirestoreDb();
  await deleteDoc(doc(db, 'users', APP_USER_ID, 'pantryItems', itemId));
  return { success: true, id: itemId };
}