const OpenAI = require("openai");

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

const IMAGE_LIBRARY = {
  egg: {
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Cooked egg dish on a plate",
  },
  toast: {
    imageUrl:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Toast plated for breakfast",
  },
  rice: {
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Rice-based home cooked dish",
  },
  pasta: {
    imageUrl:
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Pasta served in a bowl",
  },
  salad: {
    imageUrl:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Fresh salad in a bowl",
  },
  soup: {
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Soup served in a ceramic bowl",
  },
  sandwich: {
    imageUrl:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Sandwich stacked on a plate",
  },
  chicken: {
    imageUrl:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Chicken entree plated for dinner",
  },
  fruit: {
    imageUrl:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Fresh fruit arranged on a table",
  },
  yogurt: {
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Yogurt parfait with fruit",
  },
  default: {
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Cooked meal on a dining table",
  },
};

let client = null;

// simple cache memory
let recipeCache = {
  pantryKey: null,
  data: null,
  createdAt: 0,
};

function getOpenAIClient() {
  if (client) {
    return client;
  }

  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return client;
}

function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

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

function hashText(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function pickRecipeImage(recipe) {
  const haystack = [
    recipe.title,
    recipe.description,
    ...(Array.isArray(recipe.ingredientsUsed) ? recipe.ingredientsUsed : []),
  ]
    .join(" ")
    .toLowerCase();

  const keywordOrder = [
    { keyword: "omelette", key: "egg" },
    { keyword: "egg", key: "egg" },
    { keyword: "toast", key: "toast" },
    { keyword: "rice", key: "rice" },
    { keyword: "pasta", key: "pasta" },
    { keyword: "salad", key: "salad" },
    { keyword: "soup", key: "soup" },
    { keyword: "sandwich", key: "sandwich" },
    { keyword: "chicken", key: "chicken" },
    { keyword: "banana", key: "fruit" },
    { keyword: "berry", key: "fruit" },
    { keyword: "fruit", key: "fruit" },
    { keyword: "yogurt", key: "yogurt" },
  ];

  for (const entry of keywordOrder) {
    if (haystack.includes(entry.keyword)) {
      return IMAGE_LIBRARY[entry.key];
    }
  }

  const libraryKeys = Object.keys(IMAGE_LIBRARY).filter((key) => key !== "default");
  const selectedKey =
    libraryKeys[hashText(haystack || recipe.title || "recipe") % libraryKeys.length];

  return IMAGE_LIBRARY[selectedKey] || IMAGE_LIBRARY.default;
}

function enrichRecipe(recipe, index) {
  const image = pickRecipeImage(recipe);

  return {
    id:
      typeof recipe.id === "string" && recipe.id.trim()
        ? recipe.id
        : `recipe-${index + 1}-${hashText(recipe.title || String(index))}`,
    title: recipe.title,
    description: recipe.description,
    whyRecommended: recipe.whyRecommended,
    difficulty: recipe.difficulty,
    ingredientsUsed: recipe.ingredientsUsed,
    missingIngredients: recipe.missingIngredients,
    steps: recipe.steps,
    imageUrl: recipe.imageUrl || image.imageUrl,
    imageAlt: recipe.imageAlt || `${recipe.title} - ${image.imageAlt}`,
  };
}

function buildResult(recipes, options = {}) {
  return {
    recipes: recipes.map(enrichRecipe),
    source: options.source || "fallback",
    fallback: Boolean(options.fallback),
    generatedAt: new Date().toISOString(),
  };
}

function getFallbackRecipes(normalizedItems) {
  const names = normalizedItems.map((i) => i.name);
  const hasEgg = names.includes("egg") || names.includes("eggs");
  const hasBread = names.includes("bread");
  const hasMilk = names.includes("milk");
  const hasSpinach = names.includes("spinach");
  const hasRice = names.includes("rice");
  const hasCheese = names.includes("cheese");
  const hasChicken = names.includes("chicken") || names.includes("chicken breast");
  const hasYogurt = names.includes("yogurt") || names.includes("greek yogurt");
  const hasFruit = names.some((name) =>
    ["banana", "bananas", "strawberry", "strawberries", "blueberry", "blueberries"].includes(name)
  );

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

  if (hasChicken) {
    recipes.push({
      title: "Simple Chicken Skillet",
      description: "A quick chicken skillet with pantry basics.",
      whyRecommended:
        "It helps use chicken before it expires and keeps the recipe practical.",
      difficulty: 2,
      ingredientsUsed: ["chicken"],
      missingIngredients: ["salt", "pepper", "garlic"],
      steps: [
        "Season the chicken with salt and pepper if available.",
        "Heat oil in a skillet over medium heat.",
        "Cook the chicken until browned on both sides.",
        "Lower the heat and cook until the center is fully done.",
        "Add garlic or simple seasoning if available.",
        "Serve hot with any side you have on hand.",
      ],
    });
  }

  if (hasYogurt && hasFruit) {
    recipes.push({
      title: "Fruit Yogurt Bowl",
      description: "A fast yogurt bowl topped with fruit.",
      whyRecommended:
        "It uses perishable dairy and fruit with almost no prep time.",
      difficulty: 1,
      ingredientsUsed: ["yogurt", "fruit"],
      missingIngredients: ["granola or honey (optional)"],
      steps: [
        "Spoon the yogurt into a bowl.",
        "Slice or arrange the fruit on top.",
        "Add granola or honey if available.",
        "Serve immediately.",
      ],
    });
  }

  while (recipes.length < 4) {
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

  return buildResult(recipes.slice(0, 4), {
    source: "fallback",
    fallback: true,
  });
}

function validateRecipeShape(parsed) {
  if (!parsed || !Array.isArray(parsed.recipes) || parsed.recipes.length === 0) {
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

function extractJsonPayload(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Model returned an empty response.");
  }

  const trimmed = rawText.trim();

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw error;
    }

    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate);
  }
}

function buildPrompt(normalizedItems) {
  const expiringSoon = normalizedItems
    .filter((i) => i.status === "expiring_soon" || i.status === "expiring soon")
    .map((i) => i.name);

  return `
You are a recipe recommendation assistant for a food waste reduction app.

Pantry items:
${JSON.stringify(normalizedItems, null, 2)}

Instructions:
- Recommend exactly 6 recipes.
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
}

async function generateRecipes(pantryItems) {
  const normalizedItems = normalizePantryItems(pantryItems).filter(
    (i) => i.name
  );

  if (!normalizedItems.length) {
    return buildResult([], {
      source: "fallback",
      fallback: true,
    });
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

  const openAIClient = getOpenAIClient();

  if (!openAIClient) {
    const fallback = getFallbackRecipes(normalizedItems);

    recipeCache = {
      pantryKey,
      data: fallback,
      createdAt: now,
    };

    return {
      ...fallback,
      cached: false,
      message: "OPENAI_API_KEY is missing. Returned curated fallback recipes.",
    };
  }

  try {
    const response = await openAIClient.responses.create({
      model: "gpt-5.4",
      input: buildPrompt(normalizedItems),
    });

    const parsed = extractJsonPayload(response.output_text);

    if (!validateRecipeShape(parsed)) {
      throw new Error("Invalid recipe JSON shape returned by model.");
    }

    const result = buildResult(parsed.recipes, {
      source: "openai",
      fallback: false,
    });

    recipeCache = {
      pantryKey,
      data: result,
      createdAt: now,
    };

    return {
      ...result,
      cached: false,
    };
  } catch (error) {
    console.error(
      "OpenAI recipe generation failed. Using fallback.",
      error.message
    );

    const fallback = getFallbackRecipes(normalizedItems);

    recipeCache = {
      pantryKey,
      data: fallback,
      createdAt: now,
    };

    return {
      ...fallback,
      cached: false,
      message:
        error.message || "OpenAI recipe generation failed. Using fallback.",
    };
  }
}

module.exports = {
  generateRecipes,
  isOpenAIConfigured,
};
