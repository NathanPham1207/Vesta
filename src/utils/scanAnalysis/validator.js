const { normalizeTextKey } = require("../normalization");
const {
  ALLOWED_TYPES,
  ALLOWED_CATEGORIES,
} = require("../../constants/scanCategories");

const JUNK_ITEM_NAMES = new Set([
  "unknown",
  "item",
  "product",
  "misc",
  "thing",
  "stuff",
  "goods",
]);

const GENERIC_NO_ITEMS_MESSAGE =
  "We couldn't detect any valid food items from this image.";

function buildValidationFailure(message, reason, statusCode = 422) {
  return { message, reason, statusCode };
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidOptionalNumber(value) {
  return (
    value == null ||
    (typeof value === "number" && Number.isFinite(value) && value >= 0)
  );
}

function isValidOptionalString(value) {
  return value == null || typeof value === "string";
}

function validateTopLevelResponse(data) {
  if (!isPlainObject(data)) {
    return buildValidationFailure(
      "Failed to validate AI output.",
      "invalid_ai_response",
      502
    );
  }

  if (
    !ALLOWED_TYPES.has(data.imageType) &&
    data.imageType !== "non_food" &&
    data.imageType !== "unclear"
  ) {
    return buildValidationFailure(
      "The image is unclear. Please try again with a clearer food-related photo.",
      "unclear_image"
    );
  }

  if (data.isFoodRelated !== true) {
    if (data.imageType === "unclear") {
      return buildValidationFailure(
        "The image is unclear. Please try again with a clearer food-related photo.",
        "unclear_image"
      );
    }

    return buildValidationFailure(
      "Only food, drink, and grocery-related images are supported.",
      "non_food_image"
    );
  }

  if (data.imageType === "non_food" || data.imageType === "unclear") {
    return buildValidationFailure(
      data.imageType === "unclear"
        ? "The image is unclear. Please try again with a clearer food-related photo."
        : "Only food, drink, and grocery-related images are supported.",
      data.imageType === "unclear" ? "unclear_image" : "non_food_image"
    );
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  return null;
}

function validateItem(item) {
  if (!isPlainObject(item)) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  if (!isNonEmptyString(item.name)) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  const normalizedNameKey = normalizeTextKey(item.name);
  if (JUNK_ITEM_NAMES.has(normalizedNameKey)) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  if (!ALLOWED_CATEGORIES.has(item.category)) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  if (!isValidOptionalNumber(item.quantity)) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  if (!isValidOptionalNumber(item.price)) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  if (!isValidOptionalString(item.unit)) {
    return buildValidationFailure(
      GENERIC_NO_ITEMS_MESSAGE,
      "no_food_items_detected"
    );
  }

  return null;
}

function validateAnalysisResponse(data) {
  const topLevelError = validateTopLevelResponse(data);
  if (topLevelError) {
    return topLevelError;
  }

  for (const item of data.items) {
    const itemError = validateItem(item);
    if (itemError) {
      return itemError;
    }
  }

  return null;
}

module.exports = {
  validateAnalysisResponse,
};