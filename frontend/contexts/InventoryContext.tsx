import { subscribeInventory, InventoryItem as ApiInventoryItem } from '@/services/auth/inventoryApi';
import {
  addShoppingListItem,
  clearPurchasedShoppingItems,
  removeShoppingListItem,
  ShoppingListItem,
  subscribeShoppingList,
  toggleShoppingListItemPurchased,
} from '@/services/auth/shoppingListApi';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

// Re-export API type so consumers can import InventoryItem from this context
export type { ApiInventoryItem as InventoryItem };
export type { ShoppingListItem };

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export interface UserRank {
  points: number;
  tier: RankTier;
  cookedRecipes: string[];
}

interface InventoryContextType {
  inventory: ApiInventoryItem[];
  bookmarkedRecipes: string[];
  userRank: UserRank;
  shoppingList: ShoppingListItem[];
  addToShoppingList: (item: Omit<ShoppingListItem, 'id' | 'addedDate' | 'isPurchased'>) => void;
  removeFromShoppingList: (id: string) => void;
  toggleShoppingListItem: (id: string) => void;
  clearPurchasedItems: () => void;
  cookRecipe: (recipeId: string, matchPercentage: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const getDateString = () => new Date().toISOString().split('T')[0];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [userRank, setUserRank] = useState<UserRank>({
    points: 150,
    tier: 'Bronze',
    cookedRecipes: [],
  });

  const shoppingListRef = useRef<ShoppingListItem[]>([]);

  // Subscribe to real-time inventory updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeInventory((items) => setInventory(items));
    return unsubscribe;
  }, []);

  // Subscribe to real-time shopping list updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeShoppingList((items) => {
      setShoppingList(items);
      shoppingListRef.current = items;
    });
    return unsubscribe;
  }, []);

  const addToShoppingList = (item: Omit<ShoppingListItem, 'id' | 'addedDate' | 'isPurchased'>) => {
    addShoppingListItem({
      ...item,
      addedDate: getDateString(),
      isPurchased: false,
    }).catch((err) => console.error('Failed to add shopping list item', err));
  };

  const removeFromShoppingList = (id: string) => {
    removeShoppingListItem(id).catch((err) =>
      console.error('Failed to remove shopping list item', err),
    );
  };

  const toggleShoppingListItem = (id: string) => {
    const item = shoppingList.find((i) => i.id === id);
    if (!item) return;
    toggleShoppingListItemPurchased(id, !item.isPurchased).catch((err) =>
      console.error('Failed to toggle shopping list item', err),
    );
  };

  const clearPurchasedItems = () => {
    clearPurchasedShoppingItems(shoppingList).catch((err) =>
      console.error('Failed to clear purchased items', err),
    );
  };

  const cookRecipe = (recipeId: string, matchPercentage: number) => {
    const pointsToAdd = Math.floor(matchPercentage * 10);
    setUserRank(prev => ({
      ...prev,
      points: prev.points + pointsToAdd,
      cookedRecipes: [...prev.cookedRecipes, recipeId],
    }));
    Alert.alert('Recipe Cooked!', `You earned ${pointsToAdd} points!`);
  };

  // Auto-sync: add items to shopping list when quantity < 2, or status is expiring_soon/expired.
  // Re-evaluates every time inventory changes. Will not add duplicates.
  useEffect(() => {
    if (inventory.length === 0) return;

    const needsRestock = inventory.filter(
      (item) =>
        item.quantity < 2 ||
        item.status === 'expiring_soon' ||
        item.status === 'expired',
    );

    needsRestock.forEach((invItem) => {
      const alreadyInList = shoppingListRef.current.some(
        (s) => s.name.toLowerCase() === invItem.name.toLowerCase() && s.autoAdded,
      );
      if (alreadyInList) return;

      addShoppingListItem({
        name: invItem.name,
        quantity: 1,
        unit: invItem.unit ?? '',
        category: invItem.category,
        autoAdded: true,
        addedDate: getDateString(),
        isPurchased: false,
      }).catch((err) => console.error('Failed to auto-add shopping list item', err));
    });
  }, [inventory]);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        bookmarkedRecipes,
        userRank,
        shoppingList,
        addToShoppingList,
        removeFromShoppingList,
        toggleShoppingListItem,
        clearPurchasedItems,
        cookRecipe,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}
