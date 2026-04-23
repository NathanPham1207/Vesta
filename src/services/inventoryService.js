const { admin, db } = require("../config/firebase");
const { normalizeInventoryName } = require("../utils/normalization");
const { calculateItemStatus, resolveStorage } = require("../utils/calculateItemStatus");

function toDateOnly(dateInput) {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
}

function getExpiryMeta(expiryDate, expiringSoonThreshold = 3) {
  const expiry = toDateOnly(expiryDate);

  if (!expiry) {
    return {
      expiryDate: null,
      daysUntilExpiry: null,
      status: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let status = "fresh";
  if (daysUntilExpiry < 0) {
    status = "expired";
  } else if (daysUntilExpiry <= expiringSoonThreshold) {
    status = "expiring_soon";
  }

  return {
    expiryDate: expiry.toISOString().split("T")[0],
    daysUntilExpiry,
    status,
  };
}

function getEarlierDate(dateA, dateB) {
  if (!dateA) return dateB || null;
  if (!dateB) return dateA || null;

  return new Date(dateA) <= new Date(dateB) ? dateA : dateB;
}

function getComputedMeta(itemLikeDoc) {
  const hasUsdaInputs =
    (itemLikeDoc.purchaseDate || itemLikeDoc.createdAt) &&
    (itemLikeDoc.ruleKey || itemLikeDoc.name || itemLikeDoc.category);

  if (hasUsdaInputs) {
    return calculateItemStatus(itemLikeDoc);
  }

  const expiryMeta = getExpiryMeta(itemLikeDoc.expiryDate);

  return {
    status: expiryMeta.status || "fresh",
    daysLeft: expiryMeta.daysUntilExpiry,
    shelfLifeDays: null,
    matchedRuleKey: itemLikeDoc.ruleKey || null,
    reason: "Computed from expiryDate fallback",
    source: "expiryDate",
  };
}

function mapInventoryDoc(doc) {
  const data = doc.data();

  const createdAt =
    data.createdAt && typeof data.createdAt.toDate === "function"
      ? data.createdAt.toDate().toISOString()
      : data.createdAt || null;

  const normalizedName = data.normalizedName || normalizeInventoryName(data.name);

  const baseItem = {
    id: doc.id,
    name: data.name,
    normalizedName,
    category: data.category,
    storage: data.storage || null,
    quantity: Number(data.quantity) || 0,
    unit: data.unit || null,
    purchaseDate: data.purchaseDate || null,
    expiryDate: data.expiryDate || null,
    ruleKey: data.ruleKey || null,
    receiptId: data.receiptId || null,
    createdAt,
  };

  const computed = getComputedMeta(baseItem);
  const expiryMeta = getExpiryMeta(data.expiryDate);

  return {
    ...baseItem,
    storage: resolveStorage(baseItem),
    expiryDate: expiryMeta.expiryDate,
    legacyStatus: data.status || expiryMeta.status || null,
    status: computed.status,
    daysLeft: computed.daysLeft,
    shelfLifeDays: computed.shelfLifeDays,
    matchedRuleKey: computed.matchedRuleKey,
    statusReason: computed.reason,
    statusSource: computed.source,
  };
}

async function saveInventoryLots(items, userId) {
  if (!db) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }

  const pantryCollectionRef = db
    .collection("users")
    .doc(userId)
    .collection("pantryItems");

  const savePromises = items.map(async (item) => {
    const createdAt = item.createdAt
      ? admin.firestore.Timestamp.fromDate(new Date(item.createdAt))
      : admin.firestore.Timestamp.now();

    const lotPayload = {
      name: item.name,
      normalizedName: item.normalizedName || normalizeInventoryName(item.name),
      category: item.category,
      storage: item.storage || null,
      quantity: Number(item.quantity) || 0,
      unit: item.unit || null,
      purchaseDate: item.purchaseDate || null,
      ruleKey: item.ruleKey || null,
      expiryDate: item.expiryDate || null, // legacy fallback
      receiptId: item.receiptId || null,
      source: item.source || null,
      createdAt: createdAt.toDate().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await pantryCollectionRef.add(lotPayload);

    const computed = getComputedMeta(lotPayload);
    const expiryMeta = getExpiryMeta(lotPayload.expiryDate);

    return {
      id: docRef.id,
      ...lotPayload,
      storage: resolveStorage(lotPayload),
      expiryDate: expiryMeta.expiryDate,
      status: computed.status,
      daysLeft: computed.daysLeft,
      shelfLifeDays: computed.shelfLifeDays,
      matchedRuleKey: computed.matchedRuleKey,
      statusReason: computed.reason,
      statusSource: computed.source,
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
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(mapInventoryDoc);
}

function pickWorseStatus(currentStatus, nextStatus) {
  const priority = {
    fresh: 1,
    "expiring_soon": 2,
    expired: 3,
  };

  return (priority[nextStatus] || 0) > (priority[currentStatus] || 0)
    ? nextStatus
    : currentStatus;
}

async function getInventorySummary(userId) {
  const lots = await getInventoryItems(userId);
  const grouped = new Map();

  for (const lot of lots) {
    const key = `${lot.normalizedName}::${String(lot.category || "").toLowerCase()}`;
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        normalizedName: lot.normalizedName,
        name: lot.name,
        category: lot.category,
        storage: lot.storage,
        totalQuantity: Number(lot.quantity) || 0,
        lotCount: 1,
        purchaseDate: lot.purchaseDate || null,
        nearestExpiryDate: lot.expiryDate || null,
        status: lot.status || "fresh",
        daysLeft: lot.daysLeft,
      });
      continue;
    }

    const nearestExpiryDate = getEarlierDate(
      lot.expiryDate,
      current.nearestExpiryDate || null
    );

    const nextDaysLeft =
      current.daysLeft == null
        ? lot.daysLeft
        : lot.daysLeft == null
        ? current.daysLeft
        : Math.min(current.daysLeft, lot.daysLeft);

    grouped.set(key, {
      ...current,
      totalQuantity: current.totalQuantity + (Number(lot.quantity) || 0),
      lotCount: current.lotCount + 1,
      nearestExpiryDate,
      status: pickWorseStatus(current.status, lot.status || "fresh"),
      daysLeft: nextDaysLeft,
    });
  }

  return Array.from(grouped.values());
}

async function deleteInventoryLot(userId, lotId) {
  if (!db) {
    throw new Error("Firestore is not initialized. Check Firebase credentials.");
  }

  const lotRef = db
    .collection("users")
    .doc(userId)
    .collection("pantryItems")
    .doc(lotId);

  const lotSnapshot = await lotRef.get();
  if (!lotSnapshot.exists) {
    return { id: lotId, deleted: false };
  }

  await lotRef.delete();

  return { id: lotId, deleted: true };
}

const saveInventoryItems = saveInventoryLots;
const deleteInventoryItem = deleteInventoryLot;

module.exports = {
  saveInventoryLots,
  saveInventoryItems,
  getInventoryItems,
  getInventorySummary,
  deleteInventoryLot,
  deleteInventoryItem,
};