import { getInventory, InventoryItem as ApiInventoryItem } from '@/services/auth/inventoryApi';
import { useSettings } from '@/contexts/SettingsContext';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

// Re-export API type so consumers can import InventoryItem from this context
export type { ApiInventoryItem as InventoryItem };

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export interface UserRank {
  points: number;
  tier: RankTier;
  cookedRecipes: string[];
}

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
  const { expiryWarningDays, lowStockThreshold } = useSettings();
  const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [userRank, setUserRank] = useState<UserRank>({
    points: 150,
    tier: 'Bronze',
    cookedRecipes: [],
  });

  const autoAddedItemsRef = useRef<Set<string>>(new Set());

  // Fetch real inventory from Firestore on mount
  useEffect(() => {
    getInventory()
      .then(items => setInventory(items))
      .catch(err => console.error('InventoryContext: failed to load inventory', err));
  }, []);

  const addToShoppingList = (item: Omit<ShoppingListItem, 'id' | 'addedDate' | 'isPurchased'>) => {
    const newId = `sl-${Date.now()}`;
    setShoppingList(prev => [...prev, { ...item, id: newId, addedDate: getDateString(), isPurchased: false }]);
  };

  const removeFromShoppingList = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const toggleShoppingListItem = (id: string) => {
    setShoppingList(prev => prev.map(i =>
      i.id === id ? { ...i, isPurchased: !i.isPurchased } : i
    ));
  };

  const clearPurchasedItems = () => {
    setShoppingList(prev => prev.filter(item => !item.isPurchased));
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

  // Auto-sync: add to shopping list items that are low stock, expiring soon, or expired.
  // Thresholds are driven by user settings.
  useEffect(() => {
    const needsRestock = inventory.filter(item =>
      item.quantity < lowStockThreshold ||
      item.status === 'expired' ||
      (item.daysLeft != null && item.daysLeft <= expiryWarningDays)
    );

    const itemsToAdd: ShoppingListItem[] = [];

    needsRestock.forEach((invItem) => {
      const itemKey = invItem.name.toLowerCase();
      if (!autoAddedItemsRef.current.has(itemKey)) {
        itemsToAdd.push({
          id: `auto-${invItem.id ?? itemKey}`,
          name: invItem.name,
          quantity: 1,
          unit: invItem.unit ?? '',
          category: invItem.category,
          autoAdded: true,
          addedDate: getDateString(),
          isPurchased: false,
        });
        autoAddedItemsRef.current.add(itemKey);
      }
    });

    if (itemsToAdd.length > 0) {
      setShoppingList(prev => [...prev, ...itemsToAdd]);
    }
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
