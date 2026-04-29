import { APP_USER_ID } from '@/constants/appUser';
import { getFirestoreDb } from '@/services/firestore/client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  addedDate: string;
  isPurchased: boolean;
  autoAdded: boolean;
}

type ShoppingListDoc = {
  name?: unknown;
  quantity?: unknown;
  unit?: unknown;
  category?: unknown;
  addedDate?: unknown;
  isPurchased?: unknown;
  autoAdded?: unknown;
  createdAt?: Timestamp | null;
};

let memoryShoppingList: ShoppingListItem[] = [];
const memorySubscribers = new Set<(items: ShoppingListItem[]) => void>();

function emitMemoryShoppingList() {
  const snapshot = [...memoryShoppingList].sort((a, b) =>
    b.addedDate.localeCompare(a.addedDate),
  );

  memorySubscribers.forEach((callback) => callback(snapshot));
}

function createMemoryId() {
  return `shopping-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function canUseFirestore(): boolean {
  try {
    getFirestoreDb();
    return true;
  } catch {
    return false;
  }
}

function toShoppingListItem(snapshot: QueryDocumentSnapshot<ShoppingListDoc>): ShoppingListItem | null {
  const data = snapshot.data();
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) return null;

  return {
    id: snapshot.id,
    name,
    quantity: typeof data.quantity === 'number' ? data.quantity : 1,
    unit: typeof data.unit === 'string' ? data.unit : '',
    category: typeof data.category === 'string' ? data.category : '',
    addedDate: typeof data.addedDate === 'string' ? data.addedDate : new Date().toISOString().split('T')[0],
    isPurchased: typeof data.isPurchased === 'boolean' ? data.isPurchased : false,
    autoAdded: typeof data.autoAdded === 'boolean' ? data.autoAdded : false,
  };
}

function shoppingListCollection() {
  const db = getFirestoreDb();
  return collection(db, 'users', APP_USER_ID, 'shoppingList');
}

export function subscribeShoppingList(callback: (items: ShoppingListItem[]) => void): () => void {
  if (!canUseFirestore()) {
    memorySubscribers.add(callback);
    callback([...memoryShoppingList]);

    return () => {
      memorySubscribers.delete(callback);
    };
  }

  const q = query(shoppingListCollection(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map((doc) => toShoppingListItem(doc as QueryDocumentSnapshot<ShoppingListDoc>))
      .filter((item): item is ShoppingListItem => item !== null);
    callback(items);
  });
}

export async function addShoppingListItem(
  item: Omit<ShoppingListItem, 'id'>,
): Promise<string> {
  if (!canUseFirestore()) {
    const id = createMemoryId();
    memoryShoppingList = [
      {
        id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        addedDate: item.addedDate,
        isPurchased: item.isPurchased,
        autoAdded: item.autoAdded,
      },
      ...memoryShoppingList,
    ];
    emitMemoryShoppingList();
    return id;
  }

  const ref = await addDoc(shoppingListCollection(), {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    addedDate: item.addedDate,
    isPurchased: item.isPurchased,
    autoAdded: item.autoAdded,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function removeShoppingListItem(id: string): Promise<void> {
  if (!canUseFirestore()) {
    memoryShoppingList = memoryShoppingList.filter((item) => item.id !== id);
    emitMemoryShoppingList();
    return;
  }

  const db = getFirestoreDb();
  await deleteDoc(doc(db, 'users', APP_USER_ID, 'shoppingList', id));
}

export async function toggleShoppingListItemPurchased(id: string, isPurchased: boolean): Promise<void> {
  if (!canUseFirestore()) {
    memoryShoppingList = memoryShoppingList.map((item) =>
      item.id === id ? { ...item, isPurchased } : item,
    );
    emitMemoryShoppingList();
    return;
  }

  const db = getFirestoreDb();
  await updateDoc(doc(db, 'users', APP_USER_ID, 'shoppingList', id), { isPurchased });
}

export async function clearPurchasedShoppingItems(items: ShoppingListItem[]): Promise<void> {
  if (!canUseFirestore()) {
    const purchasedIds = new Set(items.filter((item) => item.isPurchased).map((item) => item.id));
    memoryShoppingList = memoryShoppingList.filter((item) => !purchasedIds.has(item.id));
    emitMemoryShoppingList();
    return;
  }

  const db = getFirestoreDb();
  const purchased = items.filter((i) => i.isPurchased);
  await Promise.all(
    purchased.map((i) => deleteDoc(doc(db, 'users', APP_USER_ID, 'shoppingList', i.id))),
  );
}
