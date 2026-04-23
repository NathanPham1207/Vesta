const { FOOD_RULES, CATEGORY_FALLBACK_RULES } = require("../constants/foodRules");

function normalizeFoodName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[0-9]+(\.[0-9]+)?\s?(oz|lb|lbs|ct|count|gal|gallon|pack)?/g, " ")
    .replace(/\b(organic|fresh|premium|grade a|family pack|value pack)\b/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findRuleByKey(ruleKey) {
  if (!ruleKey) return null;
  return FOOD_RULES.find((rule) => rule.key === ruleKey) || null;
}

function findRuleByName(name) {
  const normalized = normalizeFoodName(name);

  return (
    FOOD_RULES.find((rule) =>
      rule.aliases.some((alias) =>
        normalized.includes(normalizeFoodName(alias))
      )
    ) || null
  );
}

function getFallbackRule(category) {
  if (!category) return null;
  return CATEGORY_FALLBACK_RULES[String(category).toLowerCase()] || null;
}

function resolveStorage(item) {
  if (item.storage) return item.storage;

  switch (item.category) {
    case "Dairy":
    case "Meat":
    case "Seafood":
    case "Vegetables":
      return "fridge";
    case "Frozen":
      return "freezer";
    case "Fruits":
      return "pantry";
    case "Bakery":
    case "Beverages":
    case "Condiments":
    case "Pantry":
    case "Snacks":
    case "Misc":
    default:
      return "pantry";
  }
}

function resolveStartDate(item) {
  return item.purchaseDate || item.createdAt || null;
}

function getShelfLifeDays(storage, rule) {
  if (!rule || !rule.shelfLife) return null;
  if (storage === "fridge") return rule.shelfLife.fridgeDays || null;
  if (storage === "freezer") return rule.shelfLife.freezerDays || null;
  return rule.shelfLife.pantryDays || null;
}

function getDaysBetween(now, startDate) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  return Math.floor((now.getTime() - startDate.getTime()) / DAY_MS);
}

function getExpiringSoonThreshold(rule, shelfLifeDays) {
  if (rule && rule.expiringSoonDays) return rule.expiringSoonDays;
  return Math.max(1, Math.ceil(shelfLifeDays * 0.2));
}

function calculateItemStatus(item, now = new Date()) {
  const matchedRule =
    findRuleByKey(item.ruleKey) ||
    findRuleByName(item.name) ||
    getFallbackRule(item.category);

  if (!matchedRule) {
    return {
      status: "fresh",
      daysLeft: null,
      shelfLifeDays: null,
      matchedRuleKey: null,
      reason: "No USDA/FoodKeeper rule match found",
      source: "fallback",
    };
  }

  const storage = resolveStorage(item);
  const startDateValue = resolveStartDate(item);

  if (!startDateValue) {
    return {
      status: "fresh",
      daysLeft: null,
      shelfLifeDays: null,
      matchedRuleKey: matchedRule.key || null,
      reason: "Missing purchaseDate/createdAt",
      source: matchedRule.source || "USDA/FoodKeeper",
    };
  }

  const shelfLifeDays = getShelfLifeDays(storage, matchedRule);

  if (!shelfLifeDays) {
    return {
      status: "fresh",
      daysLeft: null,
      shelfLifeDays: null,
      matchedRuleKey: matchedRule.key || null,
      reason: "No shelf-life rule for this storage type",
      source: matchedRule.source || "USDA/FoodKeeper",
    };
  }

  const usedDays = getDaysBetween(now, new Date(startDateValue));
  const daysLeft = shelfLifeDays - usedDays;
  const soonThreshold = getExpiringSoonThreshold(matchedRule, shelfLifeDays);

  let status = "fresh";
  if (daysLeft < 0) {
    status = "expired";
  } else if (daysLeft <= soonThreshold) {
    status = "use-soon";
  }

  return {
    status,
    daysLeft,
    shelfLifeDays,
    matchedRuleKey: matchedRule.key || null,
    reason: "Computed from USDA/FoodKeeper rule and purchase date",
    source: matchedRule.source || "USDA/FoodKeeper",
  };
}

module.exports = {
  calculateItemStatus,
  resolveStorage,
};