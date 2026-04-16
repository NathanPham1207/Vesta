import { BASE_URL, COMMON_HEADERS } from "../config/api";

export type Recipe = {
  title: string;
  description: string;
  whyRecommended: string;
  difficulty: number;
  ingredientsUsed: string[];
  missingIngredients: string[];
  steps: string[];
};

export type RecipeResponse = {
  success: boolean;
  cached?: boolean;
  recipes?: Recipe[];
  message?: string;
  fallback?: boolean;
};

export async function getRecipeRecommendations(
  userId: string
): Promise<RecipeResponse> {
  const response = await fetch(
    `${BASE_URL}/api/recipes/recommend?userId=${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: COMMON_HEADERS,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch recipe recommendations");
  }

  return data;
}