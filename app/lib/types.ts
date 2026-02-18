export type DetectedIngredient = {
  name: string;
  confidence: number; // 0..1
};

export type SubOption = {
  use: string[];
  note?: string;
};

export type Recipe = {
  id: string;
  title: string;
  timeMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  ingredientsNormalized: string[];
  coreIngredientsNormalized?: string[];
  steps: string[];
};

export type RankedRecipe = Recipe & {
  score: number; // 0..1-ish
  matchCount: number;
  totalCount: number;
  missing: string[];
  substitutions: Record<string, SubOption[]>;
};
