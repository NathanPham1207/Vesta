import { APP_USER_ID } from '@/constants/appUser';
import type { ScanItem } from '@/services/auth/scanApi';
import { getFirestoreDb } from '@/services/firestore/client';
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    type QueryDocumentSnapshot,
    type Timestamp,
} from 'firebase/firestore';

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

type ReceiptDoc = {
  storeName?: unknown;
  purchaseDate?: unknown;
  totalAmount?: unknown;
  itemCount?: unknown;
  imageType?: unknown;
  items?: unknown;
  createdAt?: Timestamp | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function receiptCollection() {
  const db = getFirestoreDb();
  return collection(db, 'users', APP_USER_ID, 'receipts');
}

function calculateTotalAmount(items: ScanItem[]): number {
  return items.reduce((sum, item) =>
    sum + (typeof item.price === 'number' ? item.price : 0), 0);
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

function toReceiptItem(snapshot: QueryDocumentSnapshot<ReceiptDoc>): ReceiptItem | null {
  const data = snapshot.data();
  const storeName = typeof data.storeName === 'string' ? data.storeName.trim() : 'Unknown store';
  const purchaseDate = typeof data.purchaseDate === 'string' ? data.purchaseDate : '';
  const totalAmount = typeof data.totalAmount === 'number' ? data.totalAmount : 0;
  const itemCount = typeof data.itemCount === 'number' ? data.itemCount : 0;
  const imageType = typeof data.imageType === 'string' ? data.imageType : undefined;
  const items = normalizeItems(data.items);

  if (!purchaseDate) return null;

  return {
    id: snapshot.id,
    storeName,
    purchaseDate,
    totalAmount,
    itemCount,
    imageType,
    items,
    createdAt: data.createdAt?.toDate().toISOString(),
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getReceipts(): Promise<ReceiptItem[]> {
  const snapshots = await getDocs(
    query(receiptCollection(), orderBy('createdAt', 'desc')),
  );

  return snapshots.docs
    .map((s) => toReceiptItem(s as QueryDocumentSnapshot<ReceiptDoc>))
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

  const docRef = await addDoc(receiptCollection(), {
    storeName: payload.storeName.trim() || 'Unknown store',
    purchaseDate: payload.purchaseDate,
    totalAmount,
    itemCount: payload.items.length,
    imageType: payload.imageType ?? 'receipt',
    items: serializedItems,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    storeName: payload.storeName.trim() || 'Unknown store',
    purchaseDate: payload.purchaseDate,
    totalAmount,
    itemCount: payload.items.length,
    imageType: payload.imageType,
    items: serializedItems,
  };
}