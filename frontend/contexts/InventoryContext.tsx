import { useAuth } from '@/contexts/AuthContext';
import { getInventory, InventoryItem as ApiInventoryItem } from '@/services/auth/inventoryApi';
import {
  addShoppingListItem,
  clearPurchasedShoppingItems,
  removeShoppingListItem,
  ShoppingListItem,
  subscribeShoppingList,
  toggleShoppingListItemPurchased,
} from '@/services/auth/shoppingListApi';
import {
  saveRecipe,
  subscribeSavedRecipes,
  unsaveRecipe,
} from '@/services/auth/savedRecipesApi';
import {
  saveUserRank,
  subscribeUserRank,
  UserRank,
} from '@/services/auth/userRankApi';
import { getRankTier, getTierLabel } from '@/utils/rankings/rankUtils';
import type { RankTier } from '@/utils/rankings/rankUtils';
import type { RecipeItem } from '@/components/recipes/RecipeCard';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';

export type { ApiInventoryItem as InventoryItem };
export type { ShoppingListItem };
export type { RankTier };
export type { UserRank };

interface InventoryContextType {
  inventory: ApiInventoryItem[];
  savedRecipes: RecipeItem[];
  userRank: UserRank;
  shoppingList: ShoppingListItem[];
  pendingOpenRecipe: RecipeItem | null;
  setPendingOpenRecipe: (recipe: RecipeItem | null) => void;
  addToShoppingList: (item: Omit<ShoppingListItem, 'id' | 'addedDate' | 'isPurchased'>) => void;
  removeFromShoppingList: (id: string) => void;
  toggleShoppingListItem: (id: string) => void;
  clearPurchasedItems: () => void;
  toggleSaveRecipe: (recipe: RecipeItem) => void;
  cookRecipe: (recipeId: string, ingredientCount: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const DEFAULT_RANK: UserRank = {
  points: 0,
  tier: 'Novice',
  cookedRecipes: [],
};

const getDateString = () => new Date().toISOString().split('T')[0];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [pendingOpenRecipe, setPendingOpenRecipe] = useState<RecipeItem | null>(null);
  const [userRank, setUserRank] = useState<UserRank>(DEFAULT_RANK);

  // Ref so cookRecipe always sees the latest rank without stale closures
  const userRankRef = useRef<UserRank>(DEFAULT_RANK);
  useEffect(() => {
    userRankRef.current = userRank;
  }, [userRank]);

  const shoppingListRef = useRef<ShoppingListItem[]>([]);

  // ── Load inventory ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setInventory([]);
      return;
    }
    getInventory()
      .then((items) => setInventory(items))
      .catch((err) => console.error('InventoryContext: failed to load inventory', err));
  }, [isAuthenticated]);

  // ── Real-time shopping list ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeShoppingList((items) => {
      setShoppingList(items);
      shoppingListRef.current = items;
    });
    return unsubscribe;
  }, []);

  // ── Real-time saved recipes ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeSavedRecipes((recipes) => {
      setSavedRecipes(recipes);
    });
    return unsubscribe;
  }, []);

  // ── Real-time rank from Firestore ────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeUserRank((rank) => {
      if (rank) {
        setUserRank(rank);
        userRankRef.current = rank;
      }
    });
    return unsubscribe;
  }, []);

  // ── Shopping list actions ────────────────────────────────────────────────────
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

  // ── Saved recipes actions ────────────────────────────────────────────────────
  const toggleSaveRecipe = useCallback(
    (recipe: RecipeItem) => {
      const alreadySaved = savedRecipes.some((r) => r.id === recipe.id);
      if (alreadySaved) {
        unsaveRecipe(recipe.id).catch((err) =>
          console.error('Failed to unsave recipe', err),
        );
      } else {
        saveRecipe(recipe).catch((err) =>
          console.error('Failed to save recipe', err),
        );
      }
    },
    [savedRecipes],
  );

  // ── Cook a recipe → award points, detect level-up, persist ──────────────────
  const cookRecipe = useCallback((recipeId: string, ingredientCount: number) => {
    const pointsToAdd = Math.max(ingredientCount, 1) * 10;
    const prev = userRankRef.current;

    const newPoints = prev.points + pointsToAdd;
    const newTier = getRankTier(newPoints);
    const didLevelUp = newTier !== prev.tier;

    const newRank: UserRank = {
      points: newPoints,
      tier: newTier,
      cookedRecipes: prev.cookedRecipes.includes(recipeId)
        ? prev.cookedRecipes
        : [...prev.cookedRecipes, recipeId],
    };

    setUserRank(newRank);
    userRankRef.current = newRank;
    saveUserRank(newRank).catch((err) => console.error('Failed to save rank', err));

    // Show notification after a short delay so the modal can close first
    setTimeout(() => {
      if (didLevelUp) {
        Alert.alert(
          '🎉 Level Up!',
          `You are now a ${getTierLabel(newTier)}!\n+${pointsToAdd} points earned.`,
          [{ text: 'Awesome!', style: 'default' }],
        );
      } else {
        Alert.alert(
          '✅ Recipe Cooked!',
          `+${pointsToAdd} points earned!\nTotal: ${newPoints} pts`,
          [{ text: 'OK', style: 'default' }],
        );
      }
    }, 400);
  }, []);

  // ── Auto-sync shopping list when inventory changes ───────────────────────────
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
        savedRecipes,
        userRank,
        shoppingList,
        pendingOpenRecipe,
        setPendingOpenRecipe,
        addToShoppingList,
        removeFromShoppingList,
        toggleShoppingListItem,
        clearPurchasedItems,
        toggleSaveRecipe,
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
