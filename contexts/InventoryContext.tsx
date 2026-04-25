import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  addedDate: string;
  expiryDate?: string;
  freshness?: 'fresh' | 'good' | 'expired';
  source: 'receipt' | 'fridge' | 'manual';
}

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
  inventory: InventoryItem[];
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

// Helper for mobile dates
const getDateString = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [userRank, setUserRank] = useState<UserRank>({
    points: 150, // Starting points for testing
    tier: 'Bronze',
    cookedRecipes: [],
  });

  const autoAddedItemsRef = useRef<Set<string>>(new Set());

  const addToShoppingList = (item: Omit<ShoppingListItem, 'id' | 'addedDate' | 'isPurchased'>) => {
    const newId = `sl-${Date.now()}`;
    const newDate = getDateString(0);
    setShoppingList(prev => [...prev, { ...item, id: newId, addedDate: newDate, isPurchased: false }]);
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
    Alert.alert("Recipe Cooked!", `You earned ${pointsToAdd} points!`);
  };

  // Auto-sync shopping list logic (Mobile optimized)
  useEffect(() => {
    const lowStockItems = inventory.filter(item => item.quantity < 2);
    const itemsToAdd: ShoppingListItem[] = [];

    lowStockItems.forEach((invItem) => {
      const itemKey = invItem.name.toLowerCase();
      if (!autoAddedItemsRef.current.has(itemKey)) {
        itemsToAdd.push({
          id: `auto-${invItem.id}`,
          name: invItem.name,
          quantity: 2,
          unit: invItem.unit,
          category: invItem.category,
          autoAdded: true,
          addedDate: getDateString(0),
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