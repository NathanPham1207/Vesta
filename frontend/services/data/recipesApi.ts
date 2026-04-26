import { APP_USER_ID } from '@/constants/appUser';
import { BASE_URL, COMMON_HEADERS } from '@/services/auth/apiConfig';

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

type ApiRecipe = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  time?: unknown;
  servings?: unknown;
  difficulty?: unknown;
  image?: unknown;
  ingredients?: unknown;
  instructions?: unknown;
  imageUrl?: unknown;
  ingredientsUsed?: unknown;
  missingIngredients?: unknown;
  steps?: unknown;
};

type RecipesResponse = {
  success?: unknown;
  message?: unknown;
  recipes?: unknown;
};

function normalizeDifficulty(value: unknown): RecipeRecord['difficulty'] {
  if (typeof value === 'string') {
    if (value === 'Medium') return 'Medium';
    if (value === 'Hard') return 'Hard';
    return 'Easy';
  }

  if (typeof value === 'number') {
    if (value >= 4) return 'Hard';
    if (value >= 2) return 'Medium';
  }

  return 'Easy';
}

function toIngredient(
  name: unknown,
  index: number,
  inStock: boolean,
): RecipeIngredient | null {
  if (typeof name !== 'string' || !name.trim()) {
    return null;
  }

  return {
    id: `${inStock ? 'used' : 'missing'}-${index}-${name.trim().toLowerCase()}`,
    name: name.trim(),
    quantity: '',
    image: null,
    inStock,
  };
}

function toRecipeRecord(raw: ApiRecipe, index: number): RecipeRecord | null {
  if (typeof raw.title !== 'string' || !raw.title.trim()) {
    return null;
  }

  const usedIngredients = Array.isArray(raw.ingredientsUsed)
    ? raw.ingredientsUsed
        .map((name, ingredientIndex) => toIngredient(name, ingredientIndex, true))
        .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null)
    : [];

  const missingIngredients = Array.isArray(raw.missingIngredients)
    ? raw.missingIngredients
        .map((name, ingredientIndex) => toIngredient(name, ingredientIndex, false))
        .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null)
    : [];

  const mappedIngredients = Array.isArray(raw.ingredients)
    ? raw.ingredients
        .map((ingredient, ingredientIndex) => {
          if (!ingredient || typeof ingredient !== 'object') return null;
          const row = ingredient as Record<string, unknown>;
          const name = typeof row.name === 'string' ? row.name.trim() : '';
          if (!name) return null;

          return {
            id:
              typeof row.id === 'string' && row.id.trim()
                ? row.id
                : `ingredient-${index}-${ingredientIndex}`,
            name,
            quantity: typeof row.quantity === 'string' ? row.quantity : '',
            image: typeof row.image === 'string' ? row.image : null,
            inStock: Boolean(row.inStock),
          };
        })
        .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null)
    : [];

  const instructions = Array.isArray(raw.instructions)
    ? raw.instructions.filter((step): step is string => typeof step === 'string' && step.trim().length > 0)
    : Array.isArray(raw.steps)
      ? raw.steps.filter((step): step is string => typeof step === 'string' && step.trim().length > 0)
      : [];

  const ingredients =
    mappedIngredients.length > 0
      ? mappedIngredients
      : [...usedIngredients, ...missingIngredients];

  return {
    id:
      typeof raw.id === 'string' && raw.id.trim()
        ? raw.id
        : `recipe-${index}`,
    title: raw.title.trim(),
    description: typeof raw.description === 'string' ? raw.description : '',
    time: typeof raw.time === 'string' && raw.time.trim() ? raw.time : '15 min',
    servings:
      typeof raw.servings === 'number' && Number.isFinite(raw.servings) && raw.servings > 0
        ? Math.round(raw.servings)
        : 1,
    difficulty: normalizeDifficulty(raw.difficulty),
    image:
      typeof raw.image === 'string'
        ? raw.image
        : typeof raw.imageUrl === 'string'
          ? raw.imageUrl
          : null,
    ingredients,
    instructions,
  };
}

export async function getRecipes(): Promise<RecipeRecord[]> {
  const response = await fetch(
    `${BASE_URL}/api/recipes/recommend?userId=${encodeURIComponent(APP_USER_ID)}`,
    {
      method: 'GET',
      headers: COMMON_HEADERS,
    },
  );

  const data = (await response.json()) as RecipesResponse;

  if (!response.ok || data.success !== true) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Failed to load recipes.',
    );
  }

  const recipes = Array.isArray(data.recipes) ? data.recipes : [];

  return recipes
    .map((recipe, index) => toRecipeRecord(recipe as ApiRecipe, index))
    .filter((recipe): recipe is RecipeRecord => recipe !== null);
}
