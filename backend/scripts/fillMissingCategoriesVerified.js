const admin = require("../node_modules/firebase-admin");
const serviceAccount = require("../src/config/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const USER_ID = "user_jack_testing1";

function getTomorrowAtNoon() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  value.setHours(12, 0, 0, 0);
  return value;
}

function addDays(baseDate, days) {
  const value = new Date(baseDate);
  value.setDate(value.getDate() + days);
  return value;
}

function buildImageUrl(imageKey) {
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(imageKey)}-medium.png`;
}

const categoryMap = [
  [
    "Beverages",
    [
      ["Orange Juice", 2, "bottles", 10, "Orange"],
      ["Apple Juice", 2, "bottles", 10, "Apple"],
      ["Lemonade", 2, "bottles", 10, "Lemon"],
      ["Mango Smoothie", 2, "bottles", 7, "Mango"],
      ["Berry Smoothie", 2, "bottles", 7, "Blueberries"],
      ["Coconut Water", 3, "bottles", 20, "Coconut Milk"],
      ["Pineapple Juice", 2, "bottles", 10, "Pineapple"],
      ["Lime Soda", 3, "cans", 20, "Lime"],
    ],
  ],
  [
    "Condiments",
    [
      ["Mayonnaise", 1, "jar", 45, "Mayonnaise"],
      ["Mustard", 1, "bottle", 90, "Mustard"],
      ["Mint Sauce", 1, "jar", 60, "Mint"],
      ["Chilli Sauce", 1, "bottle", 90, "Chilli"],
      ["Tomato Sauce", 1, "bottle", 60, "Tomato"],
      ["Garlic Sauce", 1, "jar", 45, "Garlic"],
      ["Pesto Sauce", 1, "jar", 30, "Basil"],
      ["Honey Drizzle", 1, "bottle", 90, "Honey"],
    ],
  ],
  [
    "Misc",
    [
      ["Paprika", 1, "jar", 365, "Paprika"],
      ["Cinnamon", 1, "jar", 365, "Cinnamon"],
      ["Nutmeg", 1, "jar", 365, "Nutmeg"],
      ["Turmeric", 1, "jar", 365, "Turmeric"],
      ["Curry Powder", 1, "jar", 365, "Curry"],
      ["Bay Leaves", 1, "jar", 365, "Bay Leaf"],
      ["Rosemary", 1, "jar", 365, "Rosemary"],
      ["Thyme", 1, "jar", 365, "Thyme"],
    ],
  ],
];

async function verifyImageUrl(url) {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";
  return response.ok && contentType.startsWith("image/");
}

async function buildVerifiedItems() {
  const purchaseDate = getTomorrowAtNoon();
  const purchaseDateIso = purchaseDate.toISOString();
  const createdAtBase = new Date(purchaseDate);
  const verifiedItems = [];

  for (const [category, entries] of categoryMap) {
    for (const [name, quantity, unit, shelfLifeDays, imageKey] of entries) {
      const imageUrl = buildImageUrl(imageKey);
      const isValid = await verifyImageUrl(imageUrl);
      if (!isValid) {
        continue;
      }

      const createdAt = new Date(createdAtBase);
      createdAt.setMinutes(createdAt.getMinutes() + verifiedItems.length + 300);

      verifiedItems.push({
        name,
        category,
        quantity,
        unit,
        source: "manual",
        purchaseDate: purchaseDateIso,
        expiryDate: addDays(purchaseDate, shelfLifeDays).toISOString(),
        imageUrl,
        createdAt: createdAt.toISOString(),
      });
    }
  }

  return verifiedItems;
}

async function deleteExistingCategories(userId) {
  const pantryRef = db.collection("users").doc(userId).collection("pantryItems");
  const snapshot = await pantryRef.get();

  let batch = db.batch();
  let operationCount = 0;
  let deletedCount = 0;

  for (const doc of snapshot.docs) {
    const category = doc.get("category");
    if (!["Beverages", "Condiments", "Misc"].includes(category)) {
      continue;
    }

    batch.delete(doc.ref);
    operationCount += 1;
    deletedCount += 1;

    if (operationCount === 400) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }

  return deletedCount;
}

async function insertItems(userId, items) {
  const pantryRef = db.collection("users").doc(userId).collection("pantryItems");
  let batch = db.batch();
  let operationCount = 0;

  for (const item of items) {
    const docRef = pantryRef.doc();
    batch.set(docRef, {
      ...item,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(item.createdAt)),
    });
    operationCount += 1;

    if (operationCount === 400) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }
}

async function main() {
  const items = await buildVerifiedItems();
  const deletedCount = await deleteExistingCategories(USER_ID);
  await insertItems(USER_ID, items);

  console.log(
    JSON.stringify(
      {
        userId: USER_ID,
        deletedCount,
        insertedCount: items.length,
        categories: {
          Beverages: items.filter((item) => item.category === "Beverages").length,
          Condiments: items.filter((item) => item.category === "Condiments").length,
          Misc: items.filter((item) => item.category === "Misc").length,
        },
        itemNames: items.map((item) => `${item.category}: ${item.name}`),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
