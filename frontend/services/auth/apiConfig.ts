import Constants from "expo-constants";

function getBaseUrl(): string {
  const fromGoConfig = (Constants.expoGoConfig as any)?.hostUri;

  const fromManifest = (Constants.manifest as any)?.debuggerHost;

  const fromExpoConfig = (Constants.expoConfig as any)?.hostUri;

  const hostUri = fromGoConfig ?? fromManifest ?? fromExpoConfig ?? "";
  const host = hostUri.split(":")[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:5000`;
  }

  return "http://192.168.1.199:5000";
}

export const BASE_URL = getBaseUrl();
console.log("[apiConfig] BASE_URL =", BASE_URL);

export const COMMON_HEADERS = {
  Accept: "application/json",
} as const;

export const JSON_HEADERS = {
  ...COMMON_HEADERS,
  "Content-Type": "application/json",
} as const;
