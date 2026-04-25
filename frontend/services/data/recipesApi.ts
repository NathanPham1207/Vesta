import { getFirestoreDb } from '@/services/firestore/client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string;
  image: string | null;
  inStock: boolean;
};

export type RecipeRecord = {
  id: string;
  title: string;
  description: string;
  time: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string | null;
  ingredients: RecipeIngredient[];
  instructions: string[];
};

type RecipeDoc = {
  title?: unknown;
  description?: unknown;
  time?: unknown;
  servings?: unknown;
  difficulty?: unknown;
  image?: unknown;
  ingredients?: unknown;
  instructions?: unknown;
};

function normalizeDifficulty(value: unknown): RecipeRecord['difficulty'] {
  if (value === 'Medium') return 'Medium';
  if (value === 'Hard') return 'Hard';
  return 'Easy';
}

function toRecipeRecord(id: string, raw: RecipeDoc): RecipeRecord | null {
  if (typeof raw.title !== 'string' || !raw.title.trim()) {
    return null;
  }

  const ingredients = Array.isArray(raw.ingredients)
    ? raw.ingredients
        .map((ingredient, index) => {
          if (!ingredient || typeof ingredient !== 'object') return null;
          const row = ingredient as Record<string, unknown>;
          const name = typeof row.name === 'string' ? row.name.trim() : '';
          if (!name) return null;

          return {
            id: typeof row.id === 'string' && row.id.trim() ? row.id : `${id}-ing-${index}`,
            name,
            quantity: typeof row.quantity === 'string' ? row.quantity : '',
            image: typeof row.image === 'string' ? row.image : null,
            inStock: Boolean(row.inStock),
          };
        })
        .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null)
    : [];

  const instructions = Array.isArray(raw.instructions)
    ? raw.instructions.filter((step): step is string => typeof step === 'string')
    : [];

  return {
    id,
    title: raw.title.trim(),
    description: typeof raw.description === 'string' ? raw.description : '',
    time: typeof raw.time === 'string' ? raw.time : '10 min',
    servings: typeof raw.servings === 'number' && Number.isFinite(raw.servings) ? raw.servings : 1,
    difficulty: normalizeDifficulty(raw.difficulty),
    image: typeof raw.image === 'string' ? raw.image : null,
    ingredients,
    instructions,
  };
}

export async function getRecipes(): Promise<RecipeRecord[]> {
  const db = getFirestoreDb();
  const snapshots = await getDocs(query(collection(db, 'recipes'), orderBy('title', 'asc')));

  return snapshots.docs
    .map((snapshot) => toRecipeRecord(snapshot.id, snapshot.data() as RecipeDoc))
    .filter((recipe): recipe is RecipeRecord => recipe !== null);
}
