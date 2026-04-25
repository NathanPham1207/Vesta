import { APP_USER_ID } from '@/constants/appUser';
import { getFirestoreDb } from '@/services/firestore/client';
import { collection, getDocs, orderBy, query, type Timestamp } from 'firebase/firestore';

export type ReceiptRecord = {
  id: string;
  storeName: string;
  purchaseDate: string;
  totalAmount: number;
  itemCount: number;
};

type ReceiptDoc = {
  storeName?: unknown;
  purchaseDate?: unknown;
  totalAmount?: unknown;
  itemCount?: unknown;
  createdAt?: Timestamp | null;
};

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

function toReceiptRecord(id: string, raw: ReceiptDoc): ReceiptRecord | null {
  const storeName = typeof raw.storeName === 'string' ? raw.storeName.trim() : '';
  const purchaseDate = toIsoDate(raw.purchaseDate);
  const totalAmount =
    typeof raw.totalAmount === 'number' && Number.isFinite(raw.totalAmount)
      ? raw.totalAmount
      : Number(raw.totalAmount ?? 0);
  const itemCount = typeof raw.itemCount === 'number' ? raw.itemCount : Number(raw.itemCount ?? 0);

  if (!storeName || !purchaseDate || !Number.isFinite(totalAmount) || !Number.isFinite(itemCount)) {
    return null;
  }

  return {
    id,
    storeName,
    purchaseDate,
    totalAmount,
    itemCount: Math.max(0, itemCount),
  };
}

export async function getReceipts(): Promise<ReceiptRecord[]> {
  const db = getFirestoreDb();
  const snapshots = await getDocs(
    query(collection(db, 'users', APP_USER_ID, 'receipts'), orderBy('createdAt', 'desc')),
  );

  return snapshots.docs
    .map((snapshot) => toReceiptRecord(snapshot.id, snapshot.data() as ReceiptDoc))
    .filter((receipt): receipt is ReceiptRecord => receipt !== null);
}
