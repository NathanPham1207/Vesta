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
    "Bakery",
    [
      ["Bread", 1, "loaf", 6, "Bread"],
      ["Baguette", 1, "loaf", 4, "Baguette"],
      ["Tortillas", 10, "count", 12, "Tortillas"],
      ["Pita", 6, "count", 7, "Pita"],
      ["Flour Tortilla", 8, "count", 10, "Flour Tortilla"],
      ["Breadcrumbs", 1, "box", 60, "Breadcrumbs"],
    ],
  ],
  [
    "Dairy",
    [
      ["Milk", 1, "carton", 8, "Milk"],
      ["Egg", 12, "count", 18, "Egg"],
      ["Butter", 1, "box", 45, "Butter"],
      ["Cheese", 1, "block", 20, "Cheese"],
      ["Yogurt", 6, "cups", 12, "Yogurt"],
      ["Cream", 1, "carton", 10, "Cream"],
      ["Mozzarella", 1, "bag", 18, "Mozzarella"],
      ["Parmesan", 1, "tub", 30, "Parmesan"],
      ["Goat Cheese", 1, "pack", 20, "Goat Cheese"],
      ["Cheddar Cheese", 1, "block", 25, "Cheddar Cheese"],
    ],
  ],
  [
    "Fruits",
    [
      ["Apple", 8, "count", 18, "Apple"],
      ["Banana", 8, "count", 6, "Banana"],
      ["Orange", 8, "count", 16, "Orange"],
      ["Lemon", 4, "count", 14, "Lemon"],
      ["Lime", 4, "count", 14, "Lime"],
      ["Avocado", 4, "count", 7, "Avocado"],
      ["Mango", 3, "count", 9, "Mango"],
      ["Pineapple", 1, "count", 8, "Pineapple"],
      ["Strawberries", 2, "boxes", 6, "Strawberries"],
      ["Blueberries", 2, "boxes", 8, "Blueberries"],
      ["Grapes", 1, "bag", 10, "Grapes"],
      ["Peach", 4, "count", 8, "Peach"],
    ],
  ],
  [
    "Vegetables",
    [
      ["Tomato", 8, "count", 7, "Tomato"],
      ["Onion", 6, "count", 25, "Onion"],
      ["Garlic", 3, "bulbs", 30, "Garlic"],
      ["Potato", 8, "count", 30, "Potato"],
      ["Carrot", 1, "bag", 20, "Carrot"],
      ["Broccoli", 2, "heads", 8, "Broccoli"],
      ["Spinach", 1, "box", 6, "Spinach"],
      ["Lettuce", 2, "heads", 6, "Lettuce"],
      ["Cucumber", 3, "count", 9, "Cucumber"],
      ["Courgette", 4, "count", 8, "Courgette"],
      ["Celery", 1, "bundle", 10, "Celery"],
      ["Corn", 4, "count", 7, "Corn"],
      ["Peas", 1, "bag", 10, "Peas"],
      ["Cabbage", 1, "head", 14, "Cabbage"],
      ["Mushrooms", 2, "packs", 7, "Mushrooms"],
      ["Green Pepper", 6, "count", 10, "Green Pepper"],
      ["Spring Onions", 2, "bundles", 7, "Spring Onions"],
      ["Sweet Potato", 4, "count", 25, "Sweet Potato"],
      ["Aubergine", 2, "count", 7, "Aubergine"],
      ["Asparagus", 1, "bundle", 5, "Asparagus"],
    ],
  ],
  [
    "Meat",
    [
      ["Chicken", 4, "pieces", 5, "Chicken"],
      ["Beef", 2, "packs", 4, "Beef"],
      ["Pork", 4, "pieces", 5, "Pork"],
      ["Bacon", 1, "pack", 12, "Bacon"],
      ["Ham", 1, "pack", 8, "Ham"],
      ["Sausage", 1, "pack", 8, "Sausage"],
      ["Turkey", 1, "pack", 7, "Turkey"],
      ["Duck", 2, "pieces", 5, "Duck"],
      ["Lamb", 2, "pieces", 5, "Lamb"],
    ],
  ],
  [
    "Seafood",
    [
      ["Salmon", 4, "pieces", 4, "Salmon"],
      ["Tuna", 2, "pieces", 3, "Tuna"],
      ["Shrimp", 1, "bag", 6, "Shrimp"],
      ["Cod", 2, "pieces", 4, "Cod"],
      ["Crab", 1, "pack", 5, "Crab"],
      ["Sardines", 4, "cans", 180, "Sardines"],
      ["Mackerel", 2, "pieces", 4, "Mackerel"],
      ["Mussels", 1, "bag", 4, "Mussels"],
      ["Squid", 1, "bag", 4, "Squid"],
    ],
  ],
  [
    "Pantry",
    [
      ["Rice", 1, "bag", 180, "Rice"],
      ["Pasta", 2, "boxes", 180, "Pasta"],
      ["Flour", 1, "bag", 180, "Flour"],
      ["Sugar", 1, "bag", 180, "Sugar"],
      ["Salt", 1, "canister", 365, "Salt"],
      ["Black Pepper", 1, "jar", 365, "Black Pepper"],
      ["Honey", 1, "bottle", 180, "Honey"],
      ["Oats", 1, "container", 180, "Oats"],
      ["Lentils", 1, "bag", 180, "Lentils"],
      ["Chickpeas", 2, "cans", 240, "Chickpeas"],
      ["Tomato Puree", 2, "cans", 240, "Tomato Puree"],
      ["Coconut Milk", 2, "cans", 240, "Coconut Milk"],
      ["Olive Oil", 1, "bottle", 180, "Olive Oil"],
      ["Peanut Butter", 1, "jar", 120, "Peanut Butter"],
      ["Kidney Beans", 2, "cans", 240, "Kidney Beans"],
      ["Cannellini Beans", 2, "cans", 240, "Cannellini Beans"],
      ["Brown Lentils", 1, "bag", 180, "Brown Lentils"],
      ["Red Pepper", 4, "count", 10, "Red Pepper"],
    ],
  ],
  [
    "Snacks",
    [
      ["Peanuts", 1, "bag", 90, "Peanuts"],
      ["Almonds", 1, "bag", 90, "Almonds"],
      ["Walnuts", 1, "bag", 90, "Walnuts"],
      ["Pecan Nuts", 1, "bag", 90, "Pecan Nuts"],
      ["Hazlenuts", 1, "bag", 90, "Hazlenuts"],
      ["Chocolate Chips", 1, "bag", 120, "Chocolate Chips"],
      ["Dark Brown Sugar", 1, "bag", 180, "Dark Brown Sugar"],
      ["Dried Oregano", 1, "jar", 365, "Dried Oregano"],
    ],
  ],
  [
    "Frozen",
    [
      ["Frozen Peas", 1, "bag", 120, "Peas"],
      ["Frozen Corn", 1, "bag", 120, "Corn"],
      ["Frozen Spinach", 1, "bag", 120, "Spinach"],
      ["Frozen Blueberries", 1, "bag", 150, "Blueberries"],
      ["Frozen Strawberries", 1, "bag", 150, "Strawberries"],
      ["Frozen Mango", 1, "bag", 120, "Mango"],
      ["Frozen Broccoli", 1, "bag", 120, "Broccoli"],
      ["Frozen Shrimp", 1, "bag", 120, "Shrimp"],
    ],
  ],
];

async function verifyImageUrl(url) {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";
  return response.ok && contentType.startsWith("image/");
}

async function buildSeedItems() {
  const purchaseDate = getTomorrowAtNoon();
  const purchaseDateIso = purchaseDate.toISOString();
  const createdAtBase = new Date(purchaseDate);
  const allCandidates = [];

  for (const [category, entries] of categoryMap) {
    for (const [name, quantity, unit, shelfLifeDays, imageKey] of entries) {
      allCandidates.push({
        name,
        category,
        quantity,
        unit,
        source: "manual",
        purchaseDate: purchaseDateIso,
        expiryDate: addDays(purchaseDate, shelfLifeDays).toISOString(),
        imageUrl: buildImageUrl(imageKey),
        imageKey,
        createdAt: null,
      });
    }
  }

  const verifiedItems = [];

  for (const candidate of allCandidates) {
    const isValid = await verifyImageUrl(candidate.imageUrl);
    if (!isValid) {
      continue;
    }

    const createdAt = new Date(createdAtBase);
    createdAt.setMinutes(createdAt.getMinutes() + verifiedItems.length);

    verifiedItems.push({
      ...candidate,
      createdAt: createdAt.toISOString(),
    });
  }

  return verifiedItems;
}

async function deleteExistingPantryItems(userId) {
  const pantryRef = db.collection("users").doc(userId).collection("pantryItems");
  const snapshot = await pantryRef.get();

  let batch = db.batch();
  let operationCount = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
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

  return snapshot.size;
}

async function insertPantryItems(userId, items) {
  const pantryRef = db.collection("users").doc(userId).collection("pantryItems");
  let batch = db.batch();
  let operationCount = 0;

  for (const item of items) {
    const docRef = pantryRef.doc();
    batch.set(docRef, {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      source: item.source,
      purchaseDate: item.purchaseDate,
      expiryDate: item.expiryDate,
      imageUrl: item.imageUrl,
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
  const items = await buildSeedItems();
  const deletedCount = await deleteExistingPantryItems(USER_ID);
  await insertPantryItems(USER_ID, items);

  console.log(
    JSON.stringify(
      {
        userId: USER_ID,
        deletedCount,
        insertedCount: items.length,
        purchaseDate: items[0]?.purchaseDate ?? null,
        itemNames: items.map((item) => item.name),
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
