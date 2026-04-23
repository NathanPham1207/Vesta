const {
  deleteInventoryLot,
  getInventorySummary,
  getInventoryItems,
  saveInventoryLots,
} = require("../services/inventoryService");
const { normalizeInventoryName } = require("../utils/normalization");

const ALLOWED_CATEGORIES = new Set([
  "Bakery",
  "Dairy",
  "Fruits",
  "Vegetables",
  "Frozen",
  "Meat",
  "Seafood",
  "Beverages",
  "Pantry",
  "Snacks",
  "Condiments",
  "Misc",
]);

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isValidDateInput(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function validateItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return "Item must be a valid object";
  }

  if (isBlank(item.name)) {
    return "Missing required field: name";
  }

  if (isBlank(item.category)) {
    return "Missing required field: category";
  }

  if (isBlank(item.quantity)) {
    return "Missing required field: quantity";
  }

  const trimmedName = String(item.name).trim();
  if (!trimmedName) {
    return "Invalid name: must not be empty";
  }

  const trimmedCategory = String(item.category).trim();
  if (!ALLOWED_CATEGORIES.has(trimmedCategory)) {
    return `Invalid category: must be one of ${Array.from(ALLOWED_CATEGORIES).join(", ")}`;
  }

  const quantity = Number(item.quantity);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return "Invalid quantity: must be a number greater than 0";
  }

  if (!isValidDateInput(item.expiryDate)) {
    return "Invalid expiryDate: must be a valid date string";
  }

  if (!isValidDateInput(item.purchaseDate)) {
    return "Invalid purchaseDate: must be a valid date string";
  }

  return null;
}

function normalizeDateOnly(input) {
  if (input === undefined || input === null || input === "") {
    return null;
  }

  const raw = String(input).trim();
  if (!raw) {
    return null;
  }

  const parts = raw.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);

    if (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day)
    ) {
      const safeDate = new Date(year, month - 1, day);

      if (!Number.isNaN(safeDate.getTime())) {
        const yyyy = safeDate.getFullYear();
        const mm = String(safeDate.getMonth() + 1).padStart(2, "0");
        const dd = String(safeDate.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }

  const parsedDate = new Date(raw);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const yyyy = parsedDate.getFullYear();
  const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const dd = String(parsedDate.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed || null;
}

function normalizeLot(item) {
  const normalizedName = String(item.name).trim();
  const normalizedCategory = String(item.category).trim();
  const normalizedExpiryDate = normalizeDateOnly(item.expiryDate);
  const normalizedPurchaseDate = normalizeDateOnly(item.purchaseDate);

  return {
    name: normalizedName,
    normalizedName: item.normalizedName || normalizeInventoryName(normalizedName),
    category: normalizedCategory,
    quantity: Number(item.quantity),
    storage: normalizeOptionalString(item.storage),
    unit: normalizeOptionalString(item.unit),
    ruleKey: normalizeOptionalString(item.ruleKey),
    purchaseDate: normalizedPurchaseDate,
    expiryDate: normalizedExpiryDate,
    status: null,
    receiptId: normalizeOptionalString(item.receiptId),
    source: normalizeOptionalString(item.source),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

async function saveInventory(req, res) {
  try {
    const { items } = req.body || {};
    const userId = req.params.userId || "test-user";

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload: items must be an array",
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload: items array must not be empty",
      });
    }

    for (let i = 0; i < items.length; i += 1) {
      const error = validateItem(items[i]);
      if (error) {
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} is invalid: ${error}`,
        });
      }
    }

    const normalizedItems = items.map(normalizeLot);
    const savedItems = await saveInventoryLots(normalizedItems, userId);

    return res.status(200).json({
      success: true,
      message: "Inventory lots saved successfully",
      items: savedItems,
    });
  } catch (error) {
    console.error("Failed to save inventory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save inventory items",
    });
  }
}

async function fetchInventory(req, res) {
  try {
    const userId = req.params.userId || "test-user";
    const items = await getInventoryItems(userId);

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory items",
    });
  }
}

async function fetchInventorySummary(req, res) {
  try {
    const userId = req.params.userId || "test-user";
    const items = await getInventorySummary(userId);

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Failed to fetch inventory summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory summary",
    });
  }
}

async function removeInventoryItem(req, res) {
  try {
    const userId = req.params.userId || "test-user";
    const { itemId } = req.params;

    if (!itemId || typeof itemId !== "string" || itemId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid itemId",
      });
    }

    if (itemId.includes("/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid itemId format",
      });
    }

    const deleted = await deleteInventoryLot(userId, itemId);

    if (!deleted.deleted) {
      return res.status(404).json({
        success: false,
        message: "Inventory lot not found",
        id: deleted.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      id: deleted.id,
    });
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
}

module.exports = {
  saveInventory,
  fetchInventory,
  fetchInventorySummary,
  removeInventoryItem,
};