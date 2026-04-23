/**
 * Resolves food item image URLs using TheMealDB ingredient image API.
 *
 * Correct URL format: https://www.themealdb.com/images/ingredients/{name}.png
 * - All lowercase
 * - Spaces replaced with underscores
 * - No -medium suffix, no capital letters
 *
 * expo-image handles 404s gracefully by showing placeholder.
 */

const THEMEALDB_BASE = 'https://www.themealdb.com/images/ingredients';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeIngredientName(name) {
  if (!name || typeof name !== 'string') return null;

  let normalized = name.trim();

  // Strip store brand prefixes
  const brandPrefixes = [
    /^kirkland\s+signature\s+/i,
    /^member['']?s\s+mark\s+/i,
    /^great\s+value\s+/i,
    /^good\s+&\s+gather\s+/i,
    /^up\s+&\s+up\s+/i,
    /^kroger\s+/i,
  ];
  for (const prefix of brandPrefixes) {
    normalized = normalized.replace(prefix, '');
  }

  // Strip descriptor prefixes
  normalized = normalized.replace(
    /^(organic|premium|fresh|frozen|raw|roasted|sliced|diced|shredded|whole)\s+/i,
    '',
  );

  // Strip pack size suffixes
  normalized = normalized.replace(
    /\s+\d+[\s-]?(pack|pk|count|ct|oz|lb|g|ml|l|liter|gallon|gal)s?$/i,
    '',
  );

  // Plurals → singular
  const singularMap = {
    bananas: 'banana', apples: 'apple', oranges: 'orange',
    strawberries: 'strawberry', blueberries: 'blueberry', raspberries: 'raspberry',
    carrots: 'carrot', tomatoes: 'tomato', potatoes: 'potato',
    lemons: 'lemon', limes: 'lime', eggs: 'egg',
    almonds: 'almond', cashews: 'cashew', walnuts: 'walnut',
    peanuts: 'peanut', mushrooms: 'mushroom', avocados: 'avocado',
    mangoes: 'mango', grapes: 'grapes',
  };

  const lower = normalized.toLowerCase();
  if (singularMap[lower]) return singularMap[lower];

  return normalized.trim();
}

/**
 * Builds TheMealDB ingredient image URL.
 * All lowercase, spaces → underscores, no suffix.
 * e.g. "Coconut Water" → "coconut_water.png"
 *      "Banana" → "banana.png"
 */
function buildIngredientImageUrl(ingredientName) {
  const formatted = ingredientName
    .toLowerCase()
    .replace(/\s+/g, '_');

  return `${THEMEALDB_BASE}/${formatted}.png`;
}

function resolveItemImageUrl(itemName) {
  const normalized = normalizeIngredientName(itemName);
  if (!normalized) return null;
  return buildIngredientImageUrl(normalized);
}

function resolveItemImageUrls(itemNames) {
  const results = new Map();
  for (const name of itemNames) {
    results.set(name, resolveItemImageUrl(name));
  }
  return results;
}

module.exports = { resolveItemImageUrl, resolveItemImageUrls, normalizeIngredientName };