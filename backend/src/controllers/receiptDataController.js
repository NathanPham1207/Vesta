const { resolveRequestUserId } = require("../config/userContext");
const {
  getReceiptItems,
  saveReceiptItem,
} = require("../services/receiptService");

function normalizeReceiptPayload(receipt) {
  const storeName =
    typeof receipt.storeName === "string" && receipt.storeName.trim()
      ? receipt.storeName.trim()
      : "Unknown store";
  const purchaseDate =
    typeof receipt.purchaseDate === "string" && !Number.isNaN(new Date(receipt.purchaseDate).getTime())
      ? new Date(receipt.purchaseDate).toISOString()
      : new Date().toISOString();

  return {
    storeName,
    purchaseDate,
    totalAmount:
      typeof receipt.totalAmount === "number" && Number.isFinite(receipt.totalAmount)
        ? receipt.totalAmount
        : undefined,
    itemCount:
      typeof receipt.itemCount === "number" && Number.isFinite(receipt.itemCount)
        ? receipt.itemCount
        : undefined,
    imageType: typeof receipt.imageType === "string" ? receipt.imageType : "receipt",
    items: Array.isArray(receipt.items) ? receipt.items : [],
  };
}

async function fetchReceipts(req, res) {
  try {
    const userId = resolveRequestUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const receipts = await getReceiptItems(userId);

    return res.status(200).json({
      success: true,
      receipts,
    });
  } catch (error) {
    console.error("Failed to fetch receipts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch receipts",
    });
  }
}

async function saveReceipt(req, res) {
  try {
    const userId = resolveRequestUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const payload = normalizeReceiptPayload(req.body || {});

    if (!payload.items.length) {
      return res.status(400).json({
        success: false,
        message: "Receipt items are required",
      });
    }

    const savedReceipt = await saveReceiptItem(payload, userId);

    return res.status(200).json({
      success: true,
      receipt: savedReceipt,
    });
  } catch (error) {
    console.error("Failed to save receipt:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save receipt",
    });
  }
}

module.exports = {
  fetchReceipts,
  saveReceipt,
};
