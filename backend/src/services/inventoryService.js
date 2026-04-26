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

function calculateDaysLeft(expiryDate) {
  const parsed = new Date(expiryDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  return Math.ceil((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateStatusFromDaysLeft(daysLeft) {
  if (typeof daysLeft !== "number") {
    return "fresh";
  }

  if (daysLeft < 0) {
    return "expired";
  }

  if (daysLeft <= 3) {
    return "expiring_soon";
  }

  return "fresh";
}

async function saveInventoryItems(items, userId) {
  if (!db) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }

  const pantryCollectionRef = db
    .collection("users")
    .doc(userId)
    .collection("pantryItems");

  const savePromises = items.map(async (item) => {
    const itemPayload = {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      purchaseDate: item.purchaseDate || null,
      imageUrl: item.imageUrl || null,
      unit: item.unit || null,
      source: item.source || null,
      createdAt: item.createdAt
        ? admin.firestore.Timestamp.fromDate(new Date(item.createdAt))
        : admin.firestore.Timestamp.now(),
    };

    const docRef = await pantryCollectionRef.add(itemPayload);

    return {
      id: docRef.id,
      name: itemPayload.name,
      category: itemPayload.category,
      quantity: itemPayload.quantity,
      expiryDate: itemPayload.expiryDate,
      purchaseDate: itemPayload.purchaseDate,
      imageUrl: itemPayload.imageUrl,
      unit: itemPayload.unit,
      source: itemPayload.source,
      daysLeft: calculateDaysLeft(itemPayload.expiryDate),
      status: calculateStatusFromDaysLeft(
        calculateDaysLeft(itemPayload.expiryDate)
      ),
      createdAt: itemPayload.createdAt.toDate().toISOString(),
    };
  });

  return Promise.all(savePromises);
}

async function getInventoryItems(userId) {
  if (!db) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("pantryItems")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const expiryDate = toIsoDate(data.expiryDate) || data.expiryDate || null;
    const purchaseDate = toIsoDate(data.purchaseDate);
    const createdAt =
      data.createdAt && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().toISOString()
        : data.createdAt || null;
    const daysLeft = calculateDaysLeft(expiryDate);

    return {
      id: doc.id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      expiryDate,
      purchaseDate,
      imageUrl: data.imageUrl || null,
      unit: data.unit || null,
      source: data.source || null,
      daysLeft,
      status: calculateStatusFromDaysLeft(daysLeft),
      createdAt,
    };
  });
}

async function deleteInventoryItem(userId, itemId) {
  if (!db) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }

  await db
    .collection("users")
    .doc(userId)
    .collection("pantryItems")
    .doc(itemId)
    .delete();

  return { id: itemId };
}

module.exports = {
  saveInventoryItems,
  getInventoryItems,
  deleteInventoryItem,
};
