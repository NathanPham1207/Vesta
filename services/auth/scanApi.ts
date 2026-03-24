const BASE_URL = "https://taillessly-uncastled-lasonya.ngrok-free.dev";

const COMMON_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

export async function pingBackend() {
  const response = await fetch(`${BASE_URL}/`, {
    method: "GET",
    headers: COMMON_HEADERS,
  });

  const text = await response.text();
  console.log("PING STATUS:", response.status);
  console.log("PING RAW RESPONSE:", text);

  if (!response.ok) {
    throw new Error(`Ping failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function scanReceipt(asset: any) {
  const formData = new FormData();

  formData.append("image", {
    uri: asset.uri,
    name: asset.fileName || "receipt.jpg",
    type: asset.mimeType || "image/jpeg",
  } as any);

  const response = await fetch(`${BASE_URL}/scan/receipt`, {
    method: "POST",
    headers: COMMON_HEADERS,
    body: formData,
  });

  const text = await response.text();
  console.log("SCAN STATUS:", response.status);
  console.log("SCAN RAW RESPONSE:", text);

  if (!response.ok) {
    throw new Error(`Failed to scan receipt: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}