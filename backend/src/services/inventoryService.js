const { admin, db } = require("../config/firebase");

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
      status: item.status,
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
      status: itemPayload.status,
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

    return {
      id: doc.id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      expiryDate: data.expiryDate,
      status: data.status,
      createdAt:
        data.createdAt && typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || null,
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