const BASE_URL = "https://taillessly-uncastled-lasonya.ngrok-free.dev";

export async function saveInventory(items: any[]) {
  const response = await fetch(`${BASE_URL}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ items }),
  });

  const text = await response.text();
  console.log("SAVE INVENTORY STATUS:", response.status);
  console.log("SAVE INVENTORY RAW RESPONSE:", text);

  if (!response.ok) {
    throw new Error(`Failed to save inventory: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}