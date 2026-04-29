import { APP_USER_ID } from '@/constants/appUser';
import { getFirestoreDb } from '@/services/firestore/client';
import type { RecipeItem } from '@/components/recipes/RecipeCard';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

function canUseFirestore(): boolean {
  try {
    getFirestoreDb();
    return true;
  } catch {
    return false;
  }
}

function savedRecipesCollection() {
  const db = getFirestoreDb();
  return collection(db, 'users', APP_USER_ID, 'savedRecipes');
}

export function subscribeSavedRecipes(
  callback: (recipes: RecipeItem[]) => void,
): () => void {
  if (!canUseFirestore()) {
    callback([]);
    return () => {};
  }

  const q = query(savedRecipesCollection(), orderBy('savedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const recipes = snapshot.docs
        .map((d) => {
          const data = d.data();
          if (typeof data.title !== 'string') return null;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { savedAt: _savedAt, ...recipe } = data as RecipeItem & { savedAt: string };
          return recipe as RecipeItem;
        })
        .filter((r): r is RecipeItem => r !== null);
      callback(recipes);
    },
    (err) => {
      console.error('subscribeSavedRecipes error', err);
      callback([]);
    },
  );
}

export async function saveRecipe(recipe: RecipeItem): Promise<void> {
  if (!canUseFirestore()) return;
  const db = getFirestoreDb();
  const ref = doc(db, 'users', APP_USER_ID, 'savedRecipes', recipe.id);
  await setDoc(ref, { ...recipe, savedAt: new Date().toISOString() });
}

export async function unsaveRecipe(recipeId: string): Promise<void> {
  if (!canUseFirestore()) return;
  const db = getFirestoreDb();
  await deleteDoc(doc(db, 'users', APP_USER_ID, 'savedRecipes', recipeId));
}
