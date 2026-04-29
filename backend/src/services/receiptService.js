const { admin, db } = require("../config/firebase");

function toIsoDate(value) {
  if (!value) return null;

  const date =
    typeof value?.toDate === "function" ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeReceiptItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    name: typeof item?.name === "string" ? item.name : "Unknown",
    quantity:
      typeof item?.quantity === "number" && Number.isFinite(item.quantity)
        ? item.quantity
        : null,
    unit: typeof item?.unit === "string" ? item.unit : null,
    price:
      typeof item?.price === "number" && Number.isFinite(item.price)
        ? item.price
        : null,
    category: typeof item?.category === "string" ? item.category : "Misc",
  }));
}

function calculateTotalAmount(items) {
  return items.reduce(
    (sum, item) => sum + (typeof item.price === "number" ? item.price : 0),
    0
  );
}

async function saveReceiptItem(receipt, userId) {
  if (!db) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }

  const receiptCollectionRef = db
    .collection("users")
    .doc(userId)
    .collection("receipts");

  const items = normalizeReceiptItems(receipt.items);
  const totalAmount =
    typeof receipt.totalAmount === "number" && Number.isFinite(receipt.totalAmount)
      ? receipt.totalAmount
      : calculateTotalAmount(items);

  const itemCount =
    typeof receipt.itemCount === "number" && Number.isFinite(receipt.itemCount)
      ? receipt.itemCount
      : items.length;

  const payload = {
    storeName: receipt.storeName,
    purchaseDate: receipt.purchaseDate,
    totalAmount,
    itemCount,
    imageType: receipt.imageType || "receipt",
    items,
    createdAt: admin.firestore.Timestamp.now(),
  };

  const docRef = await receiptCollectionRef.add(payload);

  return {
    id: docRef.id,
    ...payload,
    createdAt: payload.createdAt.toDate().toISOString(),
  };
}

async function getReceiptItems(userId) {
  if (!db) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("receipts")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const purchaseDate =
        typeof data.purchaseDate === "string"
          ? data.purchaseDate
          : toIsoDate(data.purchaseDate);

      if (!purchaseDate) {
        return null;
      }

      return {
        id: doc.id,
        storeName:
          typeof data.storeName === "string" && data.storeName.trim()
            ? data.storeName.trim()
            : "Unknown store",
        purchaseDate,
        totalAmount:
          typeof data.totalAmount === "number" && Number.isFinite(data.totalAmount)
            ? data.totalAmount
            : 0,
        itemCount:
          typeof data.itemCount === "number" && Number.isFinite(data.itemCount)
            ? data.itemCount
            : 0,
        imageType: typeof data.imageType === "string" ? data.imageType : "receipt",
        items: normalizeReceiptItems(data.items),
        createdAt: toIsoDate(data.createdAt),
      };
    })
    .filter(Boolean);
}

module.exports = {
  getReceiptItems,
  saveReceiptItem,
};
