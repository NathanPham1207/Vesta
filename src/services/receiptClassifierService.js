const {
  CATEGORY_GROUPS,
  BRAND_CATEGORY_HINTS,
  normalizeLookupKey,
  expandReceiptTerms,
  resolveCategoryFromText,
} = require("../constants/scanCategories");
const { normalizeNullableString } = require("../utils/normalization");

function normalizeReceiptItemName(name) {
  const raw = normalizeNullableString(name);
  if (!raw) {
    return "";
  }

  return expandReceiptTerms(normalizeLookupKey(raw));
}

function scoreMatches(text, keywords) {
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeLookupKey(keyword);
    if (!normalizedKeyword) {
      continue;
    }

    if (text.includes(normalizedKeyword)) {
      score += normalizedKeyword.includes(" ") ? 3 : 2;
    }
  }

  return score;
}

function scoreBrandHints(text) {
  const scores = {};

  for (const [category, brands] of Object.entries(BRAND_CATEGORY_HINTS)) {
    for (const brand of brands) {
      const normalizedBrand = normalizeLookupKey(brand);
      if (!normalizedBrand) {
        continue;
      }

      if (text.includes(normalizedBrand)) {
        scores[category] = (scores[category] || 0) + 4;
      }
    }
  }

  return scores;
}

function classifyReceiptItem(name) {
  const text = normalizeReceiptItemName(name);

  if (!text) {
    return "Misc";
  }

  const directCategory = resolveCategoryFromText(text);
  if (directCategory !== "Misc") {
    return directCategory;
  }

  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_GROUPS)) {
    scores[category] = scoreMatches(text, keywords);
  }

  const brandScores = scoreBrandHints(text);
  for (const [category, score] of Object.entries(brandScores)) {
    scores[category] = (scores[category] || 0) + score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestCategory, bestScore] = sorted[0] || ["Misc", 0];

  return bestScore > 0 ? bestCategory : "Misc";
}

module.exports = {
  normalizeReceiptItemName,
  classifyReceiptItem,
};