function normalizeNullableString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const cleaned = raw.replace(/[^0-9.-]/g, "");

  if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTextKey(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_\-\/.,()]+/g, " ")
    .replace(/\s+/g, " ");
}

function toUnderscoreKey(value) {
  return normalizeTextKey(value).replace(/\s+/g, "_");
}

function normalizeInventoryName(value) {
  return normalizeTextKey(value);
}

module.exports = {
  normalizeNullableString,
  normalizeNullableNumber,
  normalizeTextKey,
  toUnderscoreKey,
  normalizeInventoryName,
};