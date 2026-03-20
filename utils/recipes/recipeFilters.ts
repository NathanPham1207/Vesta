import type { DietaryTag, RecipeItem } from '@/components/recipes/RecipeCard';

export const COOK_TIME_OPTIONS = [
  { id: 'any', label: 'Any time' },
  { id: '10', label: 'Under 10 min' },
  { id: '20', label: 'Under 20 min' },
  { id: '30', label: 'Under 30 min' },
] as const;

export const SERVINGS_OPTIONS = [
  { id: 'any', label: 'Any amount' },
  { id: '1-2', label: '1-2' },
  { id: '3-4', label: '3-4' },
  { id: 'gt5', label: '>5' },
] as const;

export const DIETARY_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'glutenFree', label: 'Gluten free' },
  { id: 'highProtein', label: 'High Protein' },
  { id: 'lowCarb', label: 'Low carb' },
] as const;

export type CookTimeId = (typeof COOK_TIME_OPTIONS)[number]['id'];
export type ServingsFilterId = (typeof SERVINGS_OPTIONS)[number]['id'];
export type DietaryFilterId = (typeof DIETARY_OPTIONS)[number]['id'];

export type RecipeFiltersState = {
  cookTime: CookTimeId;
  servings: ServingsFilterId;
  mainIngredient: string;
  dietary: DietaryFilterId;
};

export function parseRecipeMinutes(time: string): number {
  const m = time.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function matchesCookTime(recipe: RecipeItem, cookTime: CookTimeId): boolean {
  if (cookTime === 'any') return true;
  const cap = parseInt(cookTime, 10);
  return parseRecipeMinutes(recipe.time) <= cap;
}

function matchesServings(recipe: RecipeItem, servings: ServingsFilterId): boolean {
  if (servings === 'any') return true;
  const s = recipe.servings;
  if (servings === '1-2') return s >= 1 && s <= 2;
  if (servings === '3-4') return s >= 3 && s <= 4;
  if (servings === 'gt5') return s > 5;
  return true;
}

function matchesMainIngredient(recipe: RecipeItem, keyword: string): boolean {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  const inText =
    recipe.title.toLowerCase().includes(q) ||
    recipe.description.toLowerCase().includes(q);
  const inIngredients = recipe.ingredients.some((ing) =>
    ing.toLowerCase().includes(q),
  );
  return inText || inIngredients;
}

function matchesDietary(recipe: RecipeItem, dietary: DietaryFilterId): boolean {
  if (dietary === 'all') return true;
  return recipe.dietaryTags.includes(dietary as DietaryTag);
}

export function applyRecipeFilters(
  list: RecipeItem[],
  filters: RecipeFiltersState,
): RecipeItem[] {
  return list.filter(
    (r) =>
      matchesCookTime(r, filters.cookTime) &&
      matchesServings(r, filters.servings) &&
      matchesMainIngredient(r, filters.mainIngredient) &&
      matchesDietary(r, filters.dietary),
  );
}

export function cookTimeLabel(id: CookTimeId): string {
  return COOK_TIME_OPTIONS.find((o) => o.id === id)?.label ?? 'Any time';
}

export function servingsLabel(id: ServingsFilterId): string {
  return SERVINGS_OPTIONS.find((o) => o.id === id)?.label ?? 'Any amount';
}

export function dietaryLabel(id: DietaryFilterId): string {
  return DIETARY_OPTIONS.find((o) => o.id === id)?.label ?? 'All';
}
