const DEFAULT_DEMO_USER_ID = (
  process.env.DEFAULT_DEMO_USER_ID ||
  process.env.DEMO_USER_ID ||
  ""
).trim();

const PLACEHOLDER_ALIASES = new Set(
  (process.env.DEMO_USER_ALIASES || "test-user")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

function normalizeUserId(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getRequestUserId(req) {
  return normalizeUserId(
    req?.params?.userId ||
      req?.query?.userId ||
      req?.body?.userId ||
      req?.headers?.["x-user-id"]
  );
}

function resolveUserId(userId, options = {}) {
  const normalized = normalizeUserId(userId);
  const allowDefault = options.allowDefault !== false;

  if (!normalized) {
    return allowDefault ? DEFAULT_DEMO_USER_ID : "";
  }

  if (PLACEHOLDER_ALIASES.has(normalized) && DEFAULT_DEMO_USER_ID) {
    return DEFAULT_DEMO_USER_ID;
  }

  return normalized;
}

function resolveRequestUserId(req, options = {}) {
  return resolveUserId(getRequestUserId(req), options);
}

module.exports = {
  DEFAULT_DEMO_USER_ID,
  getRequestUserId,
  resolveUserId,
  resolveRequestUserId,
};
