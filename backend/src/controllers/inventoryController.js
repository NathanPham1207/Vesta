const {
  deleteInventoryItem,
  getInventoryItems,
  saveInventoryItems,
} = require("../services/inventoryService");
const { resolveRequestUserId } = require("../config/userContext");

function validateItem(item) {
  const requiredFields = ["name", "category", "quantity", "expiryDate"];

  for (const field of requiredFields) {
    if (
      item[field] === undefined ||
      item[field] === null ||
      item[field] === ""
    ) {
      return `Missing required field: ${field}`;
    }
  }

  const quantity = Number(item.quantity);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return "Invalid quantity: must be a number greater than 0";
  }

  if (Number.isNaN(new Date(item.expiryDate).getTime())) {
    return "Invalid expiryDate: must be a valid date string";
  }

  return null;
}

function calculateStatus(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "expired";
  }

  if (diffDays <= 3) {
    return "expiring soon";
  }

  return "fresh";
}

function normalizeItem(item) {
  const normalizedExpiryDate = new Date(item.expiryDate)
    .toISOString()
    .split("T")[0];

  return {
    name: String(item.name).trim(),
    category: String(item.category).trim(),
    quantity: Number(item.quantity),
    expiryDate: normalizedExpiryDate,
    status: calculateStatus(normalizedExpiryDate),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

async function saveInventory(req, res) {
  try {
    const { items } = req.body || {};
    const userId = resolveRequestUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload: items must be an array",
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

    const normalizedItems = items.map(normalizeItem);
    const savedItems = await saveInventoryItems(normalizedItems, userId);

    return res.status(200).json({
      success: true,
      message: "Items saved successfully",
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
    const userId = resolveRequestUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

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

async function removeInventoryItem(req, res) {
  try {
    const userId = resolveRequestUserId(req);
    const { itemId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Missing itemId",
      });
    }

    const deleted = await deleteInventoryItem(userId, itemId);

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
  removeInventoryItem,
};
