const {
  normalizeNullableString,
  normalizeNullableNumber,
  normalizeTextKey,
} = require("../normalization");
const { classifyReceiptItem } = require("../../services/receiptClassifierService");
const {
  ALLOWED_TYPES,
  ALLOWED_CATEGORIES,
  CATEGORY_ALIASES,
  BRAND_CATEGORY_HINTS,
  normalizeLookupKey,
  expandReceiptTerms,
  resolveCategoryFromText,
} = require("../../constants/scanCategories");

const NON_FOOD_NAME_KEYWORDS =
  /\b(shampoo|soap|toothpaste|toothbrush|detergent|bleach|cleaner|napkin|tissue|diaper|battery|charger|cable|cosmetic|lotion|makeup|conditioner|deodorant|razor|medicine|vitamin|supplement|toy|pet food)\b/i;

const JUNK_ITEM_NAMES = new Set([
  "unknown",
  "item",
  "product",
  "misc",
  "thing",
  "stuff",
  "goods",
]);

function normalizeImageType(rawType) {
  const normalizedType = normalizeNullableString(rawType)?.toLowerCase();

  if (!normalizedType) {
    return "unclear";
  }

  if (
    ALLOWED_TYPES.has(normalizedType) ||
    normalizedType === "non_food" ||
    normalizedType === "unclear"
  ) {
    return normalizedType;
  }

  return "unclear";
}

function normalizeIsFoodRelated(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = normalizeNullableString(value)?.toLowerCase();
  return text === "true";
}

function isLikelyNonFoodName(name) {
  if (!name) {
    return false;
  }

  return NON_FOOD_NAME_KEYWORDS.test(name);
}

function isJunkItemName(name) {
  if (!name) {
    return true;
  }

  return JUNK_ITEM_NAMES.has(normalizeTextKey(name));
}

function getBrandCategoryHint(name) {
  const normalizedName = normalizeLookupKey(name);
  if (!normalizedName) {
    return "Misc";
  }

  for (const [category, brands] of Object.entries(BRAND_CATEGORY_HINTS)) {
    const matched = brands.some((brand) =>
      normalizedName.includes(normalizeLookupKey(brand))
    );

    if (matched) {
      return category;
    }
  }

  return "Misc";
}

function getAliasCategory(value) {
  const normalized = normalizeLookupKey(value);
  if (!normalized) {
    return "Misc";
  }

  return (
    CATEGORY_ALIASES[normalized] ||
    CATEGORY_ALIASES[normalized.replace(/\s+/g, "_")] ||
    CATEGORY_ALIASES[normalized.replace(/\s+/g, "")] ||
    "Misc"
  );
}

function inferCategoryFromProduceName(itemName) {
  const fromName = resolveCategoryFromText(itemName);

  if (fromName === "Fruits" || fromName === "Vegetables") {
    return fromName;
  }

  return "Misc";
}

function normalizeCategory(rawCategory, itemName = null) {
  const categoryFromAi = normalizeNullableString(rawCategory);
  const normalizedItemName = normalizeNullableString(itemName);

  if (categoryFromAi) {
    const normalizedCategoryKey = normalizeLookupKey(categoryFromAi);

    if (normalizedCategoryKey === "produce") {
      const produceCategory = inferCategoryFromProduceName(normalizedItemName);
      if (produceCategory !== "Misc") {
        return produceCategory;
      }
    }

    const directCategory = getAliasCategory(categoryFromAi);
    if (directCategory !== "Misc") {
      return directCategory;
    }

    const resolvedFromRawCategory = resolveCategoryFromText(categoryFromAi);
    if (resolvedFromRawCategory !== "Misc") {
      return resolvedFromRawCategory;
    }
  }

  if (normalizedItemName) {
    const fromName = resolveCategoryFromText(normalizedItemName);
    if (fromName !== "Misc") {
      return fromName;
    }

    const expandedName = expandReceiptTerms(normalizedItemName);
    const fromExpandedName = resolveCategoryFromText(expandedName);
    if (fromExpandedName !== "Misc") {
      return fromExpandedName;
    }

    const brandHint = getBrandCategoryHint(normalizedItemName);
    if (brandHint !== "Misc") {
      return brandHint;
    }

    const classifierGuess = classifyReceiptItem(normalizedItemName);

    const normalizedClassifierGuess = getAliasCategory(classifierGuess);
    if (normalizedClassifierGuess !== "Misc") {
      return normalizedClassifierGuess;
    }

    const resolvedClassifierGuess = resolveCategoryFromText(classifierGuess);
    if (resolvedClassifierGuess !== "Misc") {
      return resolvedClassifierGuess;
    }
  }

  return "Misc";
}

function normalizeItem(rawItem) {
  if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) {
    return null;
  }

  const name = normalizeNullableString(rawItem.name);

  if (!name || isJunkItemName(name) || isLikelyNonFoodName(name)) {
    return null;
  }

  const category = normalizeCategory(rawItem.category, name);

  return {
    name,
    quantity: normalizeNullableNumber(rawItem.quantity),
    unit: normalizeNullableString(rawItem.unit),
    price: normalizeNullableNumber(rawItem.price),
    category: ALLOWED_CATEGORIES.has(category) ? category : "Misc",
  };
}

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map(normalizeItem).filter(Boolean);
}

function normalizeAnalysisResponse(rawResponse) {
  const safeResponse =
    rawResponse && typeof rawResponse === "object" && !Array.isArray(rawResponse)
      ? rawResponse
      : {};

  const imageType = normalizeImageType(safeResponse.imageType || safeResponse.type);
  const isFoodRelated = normalizeIsFoodRelated(safeResponse.isFoodRelated);

  if (!isFoodRelated || imageType === "non_food" || imageType === "unclear") {
    return {
      isFoodRelated: false,
      imageType: imageType === "unclear" ? "unclear" : "non_food",
      storeName: null,
      purchaseDate: null,
      items: [],
    };
  }

  return {
    isFoodRelated: true,
    imageType,
    storeName: normalizeNullableString(safeResponse.storeName),
    purchaseDate: normalizeNullableString(safeResponse.purchaseDate),
    items: normalizeItems(safeResponse.items),
  };
}

module.exports = {
  normalizeCategory,
  normalizeItem,
  normalizeItems,
  normalizeAnalysisResponse,
};