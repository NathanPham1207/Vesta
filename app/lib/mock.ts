import { DetectedIngredient, Recipe } from "./types";

export const MOCK_DETECTED: DetectedIngredient[] = [
  { name: "egg", confidence: 0.93 },
  { name: "spinach", confidence: 0.86 },
  { name: "milk", confidence: 0.78 },
  { name: "onion", confidence: 0.74 },
  { name: "garlic", confidence: 0.71 },
  { name: "tomato", confidence: 0.63 },
];

export const PANTRY_DEFAULT = ["salt", "pepper", "oil"];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "spinach-omelette",
    title: "Spinach Omelette",
    timeMinutes: 12,
    difficulty: "Easy",
    tags: ["quick", "breakfast", "high-protein"],
    ingredientsNormalized: ["egg", "spinach", "salt", "pepper", "butter"],
    coreIngredientsNormalized: ["egg"],
    steps: [
      "Whisk eggs with salt and pepper.",
      "Sauté spinach briefly.",
      "Pour eggs into pan, add spinach, fold and cook until set.",
    ],
  },
  {
    id: "garlic-tomato-pasta",
    title: "Garlic Tomato Pasta",
    timeMinutes: 20,
    difficulty: "Easy",
    tags: ["quick", "dinner"],
    ingredientsNormalized: [
      "pasta",
      "tomato",
      "garlic",
      "oil",
      "salt",
      "parmesan",
    ],
    coreIngredientsNormalized: ["pasta", "tomato"],
    steps: [
      "Cook pasta in salted water.",
      "Sauté garlic in oil, add tomatoes and simmer.",
      "Toss pasta with sauce, top with parmesan.",
    ],
  },
  {
    id: "shakshuka-lite",
    title: "Shakshuka (Lite)",
    timeMinutes: 25,
    difficulty: "Medium",
    tags: ["one-pan", "brunch"],
    ingredientsNormalized: [
      "egg",
      "tomato",
      "onion",
      "garlic",
      "salt",
      "pepper",
      "paprika",
    ],
    coreIngredientsNormalized: ["egg", "tomato"],
    steps: [
      "Sauté onion and garlic.",
      "Simmer tomatoes with spices.",
      "Crack eggs into sauce and cook until whites set.",
    ],
  },
  {
    id: "creamy-spinach-soup",
    title: "Creamy Spinach Soup",
    timeMinutes: 18,
    difficulty: "Easy",
    tags: ["comfort", "soup"],
    ingredientsNormalized: [
      "spinach",
      "onion",
      "garlic",
      "milk",
      "salt",
      "pepper",
    ],
    coreIngredientsNormalized: ["spinach"],
    steps: [
      "Sauté onion and garlic.",
      "Add spinach and cook down.",
      "Add milk, simmer, blend, season to taste.",
    ],
  },
];
