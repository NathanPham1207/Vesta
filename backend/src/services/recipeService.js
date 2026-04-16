const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// simple cache memory
let recipeCache = {
  pantryKey: null,
  data: null,
  createdAt: 0,
};

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

function normalizePantryItems(items) {
  return items.map((item) => ({
    name: String(item.name || "").trim().toLowerCase(),
    category: item.category || "Unknown",
    status: item.status || "unknown",
    daysLeft:
      typeof item.daysLeft === "number"
        ? item.daysLeft
        : typeof item.expirationDaysLeft === "number"
        ? item.expirationDaysLeft
        : null,
  }));
}

function buildPantryKey(items) {
  return JSON.stringify(
    items
      .map((item) => ({
        name: item.name,
        status: item.status,
        daysLeft: item.daysLeft,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );
}

function getFallbackRecipes(normalizedItems) {
  const names = normalizedItems.map((i) => i.name);
  const hasEgg = names.includes("egg") || names.includes("eggs");
  const hasBread = names.includes("bread");
  const hasMilk = names.includes("milk");
  const hasSpinach = names.includes("spinach");
  const hasRice = names.includes("rice");
  const hasCheese = names.includes("cheese");

  const recipes = [];

  if (hasEgg && hasSpinach) {
    recipes.push({
      title: "Spinach Omelette",
      description: "A quick omelette that helps use up eggs and spinach.",
      whyRecommended:
        "It uses ingredients commonly found in the pantry and is fast to cook.",
      difficulty: 1,
      ingredientsUsed: ["eggs", "spinach"],
      missingIngredients: hasCheese ? [] : ["cheese (optional)"],
      steps: [
        "Crack the eggs into a bowl.",
        "Whisk the eggs until the yolks and whites are fully combined.",
        "Heat a pan over medium heat.",
        "Add a small amount of oil or butter to the pan if available.",
        "Add the spinach and cook for 1 to 2 minutes until slightly softened.",
        "Pour the eggs into the pan over the spinach.",
        "Let the eggs cook until the bottom begins to set.",
        "Gently fold the omelette in half.",
        "Add cheese before folding if available.",
        "Cook for another minute and serve warm.",
      ],
    });
  }

  if (hasEgg && hasBread && hasMilk) {
    recipes.push({
      title: "French Toast",
      description: "Simple French toast using bread, eggs, and milk.",
      whyRecommended:
        "It uses multiple pantry staples and is easy for a student meal.",
      difficulty: 2,
      ingredientsUsed: ["bread", "eggs", "milk"],
      missingIngredients: ["cinnamon or syrup (optional)"],
      steps: [
        "Crack the eggs into a bowl.",
        "Pour the milk into the bowl with the eggs.",
        "Whisk until the mixture is smooth.",
        "Heat a pan over medium heat.",
        "Lightly grease the pan with butter or oil if available.",
        "Dip one slice of bread into the egg mixture.",
        "Turn it over so both sides are coated.",
        "Place the bread into the hot pan.",
        "Cook until the first side is golden brown.",
        "Flip the bread and cook the other side until golden brown.",
        "Repeat with the remaining bread slices.",
        "Serve warm with cinnamon or syrup if available.",
      ],
    });
  }

  if (hasRice && hasEgg) {
    recipes.push({
      title: "Egg Fried Rice",
      description: "A fast fried rice using cooked rice and eggs.",
      whyRecommended:
        "It is simple, flexible, and works well with leftover ingredients.",
      difficulty: 2,
      ingredientsUsed: ["rice", "eggs"],
      missingIngredients: ["green onion", "soy sauce"],
      steps: [
        "Heat a pan over medium-high heat.",
        "Add a small amount of oil if available.",
        "Crack the eggs into the pan.",
        "Scramble the eggs until fully cooked.",
        "Remove the eggs and set them aside.",
        "Add the cooked rice to the same pan.",
        "Break up any clumps and stir-fry the rice for a few minutes.",
        "Return the scrambled eggs to the pan.",
        "Mix the eggs and rice together well.",
        "Add soy sauce if available.",
        "Stir for another minute and serve hot.",
      ],
    });
  }

  while (recipes.length < 3) {
    recipes.push({
      title: "Simple Pantry Bowl",
      description: "A flexible bowl meal using whatever ingredients are available.",
      whyRecommended:
        "It is a safe fallback recipe when the AI service is unavailable.",
      difficulty: 1,
      ingredientsUsed: normalizedItems
        .slice(0, 3)
        .map((i) => i.name)
        .filter(Boolean),
      missingIngredients: [],
      steps: [
        "Choose 2 or 3 pantry ingredients that seem to go well together.",
        "Wash, peel, or prepare them as needed.",
        "Cook or warm each ingredient in the most suitable way you can.",
        "Combine the cooked ingredients in a bowl or plate.",
        "Add simple seasoning such as salt, pepper, or sauce if available.",
        "Taste and adjust the seasoning if needed.",
        "Serve immediately.",
      ],
    });
  }

  return { recipes: recipes.slice(0, 3) };
}

function validateRecipeShape(parsed) {
  if (!parsed || !Array.isArray(parsed.recipes)) {
    return false;
  }

  return parsed.recipes.every((recipe) => {
    return (
      typeof recipe.title === "string" &&
      recipe.title.trim().length > 0 &&
      typeof recipe.description === "string" &&
      recipe.description.trim().length > 0 &&
      typeof recipe.whyRecommended === "string" &&
      recipe.whyRecommended.trim().length > 0 &&
      Number.isInteger(recipe.difficulty) &&
      recipe.difficulty >= 1 &&
      recipe.difficulty <= 5 &&
      Array.isArray(recipe.ingredientsUsed) &&
      recipe.ingredientsUsed.every(
        (ingredient) =>
          typeof ingredient === "string" && ingredient.trim().length > 0
      ) &&
      Array.isArray(recipe.missingIngredients) &&
      recipe.missingIngredients.every(
        (ingredient) =>
          typeof ingredient === "string" && ingredient.trim().length > 0
      ) &&
      Array.isArray(recipe.steps) &&
      recipe.steps.length > 0 &&
      recipe.steps.every(
        (step) => typeof step === "string" && step.trim().length > 0
      )
    );
  });
}

async function generateRecipes(pantryItems) {
  const normalizedItems = normalizePantryItems(pantryItems).filter(
    (i) => i.name
  );

  if (!normalizedItems.length) {
    return { recipes: [] };
  }

  const pantryKey = buildPantryKey(normalizedItems);
  const now = Date.now();

  if (
    recipeCache.pantryKey === pantryKey &&
    recipeCache.data &&
    now - recipeCache.createdAt < CACHE_TTL_MS
  ) {
    return {
      ...recipeCache.data,
      cached: true,
    };
  }

  const expiringSoon = normalizedItems
    .filter((i) => i.status === "expiring_soon" || i.status === "expiring soon")
    .map((i) => i.name);

  const prompt = `
You are a recipe recommendation assistant for a food waste reduction app.

Pantry items:
${JSON.stringify(normalizedItems, null, 2)}

Instructions:
- Recommend exactly 10 recipes.
- Prioritize ingredients with status "expiring_soon" or "expiring soon".
- Prefer easy and practical recipes for college students.
- Prefer recipes that use many existing pantry items.
- Keep recipes realistic and simple enough to cook at home.
- If ingredients are missing, include them in missingIngredients.
- Add a difficulty field as an integer from 1 to 5.
- Difficulty meaning:
  1 = very easy
  2 = easy
  3 = medium
  4 = hard
  5 = very hard
- Steps should be clear, sequential, and easy to follow one by one in a mobile app.
- Include as many steps as needed for the recipe.
- Each step should describe one clear action or a very small grouped action.
- Return JSON only.
- Do not include markdown.
- Do not include any extra explanation outside JSON.

Return this exact structure:
{
  "recipes": [
    {
      "title": "string",
      "description": "string",
      "whyRecommended": "string",
      "difficulty": 1,
      "ingredientsUsed": ["string"],
      "missingIngredients": ["string"],
      "steps": ["string"]
    }
  ]
}

Available ingredients: ${normalizedItems.map((i) => i.name).join(", ")}
Expiring soon ingredients: ${expiringSoon.join(", ")}
`;

  try {
    const response = await client.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    const raw = response.output_text;
    const parsed = JSON.parse(raw);

    if (!validateRecipeShape(parsed)) {
      throw new Error("Invalid recipe JSON shape returned by model.");
    }

    recipeCache = {
      pantryKey,
      data: parsed,
      createdAt: now,
    };

    return {
      ...parsed,
      cached: false,
    };
  } catch (error) {
    console.error(
      "OpenAI recipe generation failed. Using fallback.",
      error.message
    );

    const fallback = getFallbackRecipes(normalizedItems);

    return {
      ...fallback,
      cached: false,
      fallback: true,
    };
  }
}

module.exports = {
  generateRecipes,
};