export const BASE_URL = "https://steadfast-spoon-credible.ngrok-free.dev";

export const COMMON_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
} as const;

export const JSON_HEADERS = {
  ...COMMON_HEADERS,
  "Content-Type": "application/json",
} as const;
