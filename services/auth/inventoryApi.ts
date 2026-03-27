import { BASE_URL, COMMON_HEADERS } from "./apiConfig";

export type InventoryItem = {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
  status?: "fresh" | "expiring soon" | "expired";
  createdAt?: string;
};

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await fetch(`${BASE_URL}/inventory/test-user`, {
    method: "GET",
    headers: COMMON_HEADERS,
  });

  const text = await response.text();
  console.log("GET INVENTORY STATUS:", response.status);
  console.log("GET INVENTORY RAW RESPONSE:", text);

  if (!response.ok) {
    throw new Error(`Failed to load inventory: ${response.status} - ${text}`);
  }

  const data = JSON.parse(text);
  return Array.isArray(data.items) ? data.items : [];
}

export async function saveInventory(items: InventoryItem[]) {
  const response = await fetch(`${BASE_URL}/inventory/test-user`, {
    method: "POST",
    headers: {
      ...COMMON_HEADERS,
      "Content-Type": "application/json",
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
export async function deleteInventory(itemId: string) {
  const response = await fetch(`${BASE_URL}/inventory/test-user/${itemId}`, {
    method: "DELETE",
    headers: COMMON_HEADERS,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Failed to delete inventory item: ${response.status} - ${text}`,
    );
  }

  return JSON.parse(text);
}
