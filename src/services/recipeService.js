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
      whyRecommended: "It uses ingredients commonly found in the pantry and is fast to cook.",
      ingredientsUsed: ["eggs", "spinach"],
      missingIngredients: hasCheese ? [] : ["cheese (optional)"],
      steps: [
        "Beat the eggs in a bowl.",
        "Cook spinach in a pan for 1 to 2 minutes.",
        "Pour in the eggs and cook until set.",
        "Add cheese if available and fold before serving.",
      ],
    });
  }

  if (hasEgg && hasBread && hasMilk) {
    recipes.push({
      title: "French Toast",
      description: "Simple French toast using bread, eggs, and milk.",
      whyRecommended: "It uses multiple pantry staples and is easy for a student meal.",
      ingredientsUsed: ["bread", "eggs", "milk"],
      missingIngredients: ["cinnamon or syrup (optional)"],
      steps: [
        "Whisk eggs and milk together.",
        "Dip bread slices into the mixture.",
        "Cook each side on a pan until golden brown.",
        "Serve warm.",
      ],
    });
  }

  if (hasRice && hasEgg) {
    recipes.push({
      title: "Egg Fried Rice",
      description: "A fast fried rice using cooked rice and eggs.",
      whyRecommended: "It is simple, flexible, and works well with leftover ingredients.",
      ingredientsUsed: ["rice", "eggs"],
      missingIngredients: ["green onion", "soy sauce"],
      steps: [
        "Scramble the eggs in a hot pan and set aside.",
        "Add rice and stir-fry for a few minutes.",
        "Mix the eggs back in.",
        "Add soy sauce if available and serve.",
      ],
    });
  }

  while (recipes.length < 3) {
    recipes.push({
      title: "Simple Pantry Bowl",
      description: "A flexible bowl meal using whatever ingredients are available.",
      whyRecommended: "It is a safe fallback recipe when the AI service is unavailable.",
      ingredientsUsed: normalizedItems.slice(0, 3).map((i) => i.name).filter(Boolean),
      missingIngredients: [],
      steps: [
        "Pick 2 or 3 pantry ingredients that work together.",
        "Cook or warm them as needed.",
        "Season simply with salt, pepper, or sauce if available.",
        "Serve as a quick meal.",
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
      typeof recipe.description === "string" &&
      typeof recipe.whyRecommended === "string" &&
      Array.isArray(recipe.ingredientsUsed) &&
      Array.isArray(recipe.missingIngredients) &&
      Array.isArray(recipe.steps)
    );
  });
}

async function generateRecipes(pantryItems) {
  const normalizedItems = normalizePantryItems(pantryItems).filter((i) => i.name);

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
    .filter((i) => i.status === "expiring_soon")
    .map((i) => i.name);

  const prompt = `
You are a recipe recommendation assistant for a food waste reduction app.

Pantry items:
${JSON.stringify(normalizedItems, null, 2)}

Instructions:
- Recommend exactly 10 recipes.
- Prioritize ingredients with status "expiring_soon".
- Prefer easy recipes for college students.
- Prefer recipes that use many existing pantry items.
- Keep recipes practical and realistic.
- If ingredients are missing, include them in missingIngredients.
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
      "ingredientsUsed": ["string"],
      "missingIngredients": ["string"],
      "steps": ["string", "string", "string"]
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
    console.error("OpenAI recipe generation failed. Using fallback.", error.message);

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