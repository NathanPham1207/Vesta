const admin = require("../node_modules/firebase-admin");
const serviceAccount = require("../src/config/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const USER_ID = "user_jack_testing1";
const PANTRY_COLLECTION = "pantryItems";

const TARGET_ITEM_NAMES = [
  "Bagels",
  "English Muffins",
  "Dinner Rolls",
  "Butter Rolls",
  "Croissants",
  "Barbecue Sauce",
  "Sparkling Water",
  "Premier Cafe Latte",
  "Green Tea",
  "Black Tea",
  "Soda",
  "Monster Energy",
  "Thai Jasmine Rice",
  "Penne Pasta",
  "Sesame Oil",
  "Kimchi",
  "Seaweed Snacks",
  "Bell Peppers",
  "Sweet Tomatoes",
];

function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values)];
}

function buildSearchTerms(itemName) {
  const normalized = normalizeName(itemName);
  const baseTerms = [normalized];

  const synonyms = {
    bagels: ["bagel"],
    "english muffins": ["english muffin"],
    "dinner rolls": ["dinner roll"],
    "butter rolls": ["butter roll"],
    croissants: ["croissant"],
    "barbecue sauce": ["bbq sauce"],
    "sparkling water": ["sparkling water can", "carbonated water"],
    "premier cafe latte": ["premier protein cafe latte", "bottled latte"],
    "green tea": ["green tea bottle", "green tea drink"],
    "black tea": ["black tea bottle", "black tea drink"],
    soda: ["cola", "soft drink"],
    "monster energy": ["monster energy drink", "energy drink can"],
    "thai jasmine rice": ["jasmine rice", "thai rice"],
    "penne pasta": ["penne", "boxed pasta"],
    "sesame oil": ["toasted sesame oil"],
    kimchi: ["kimchi jar", "kimchi cabbage"],
    "seaweed snacks": ["seaweed snack", "roasted seaweed"],
    "bell peppers": ["bell pepper", "sweet pepper"],
    "sweet tomatoes": ["grape tomatoes", "cherry tomatoes"],
  };

  return unique(baseTerms.concat(synonyms[normalized] ?? []));
}

function getProductImage(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  if (typeof product.image_front_url === "string" && product.image_front_url.trim()) {
    return product.image_front_url.trim();
  }

  if (typeof product.image_url === "string" && product.image_url.trim()) {
    return product.image_url.trim();
  }

  const front = product.selected_images?.front;
  const display = front?.display;
  if (display && typeof display === "object") {
    const languageCandidates = Object.values(display);
    for (const candidate of languageCandidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return null;
}

function scoreProduct(product, itemName) {
  const target = normalizeName(itemName);
  const productName = normalizeName(product?.product_name);
  const genericName = normalizeName(product?.generic_name);
  const combined = `${productName} ${genericName}`.trim();

  let score = 0;

  if (!combined) {
    return score;
  }

  if (combined === target) score += 120;
  if (combined.includes(target)) score += 80;

  const targetParts = target.split(" ");
  for (const part of targetParts) {
    if (part && combined.includes(part)) {
      score += 12;
    }
  }

  const categories = Array.isArray(product?.categories_tags)
    ? product.categories_tags.join(" ").toLowerCase()
    : "";

  if (target.includes("tea") && categories.includes("tea")) score += 20;
  if (target.includes("rice") && categories.includes("rice")) score += 20;
  if (target.includes("pasta") && categories.includes("pasta")) score += 20;
  if (target.includes("oil") && categories.includes("oil")) score += 20;
  if (target.includes("seaweed") && categories.includes("seaweed")) score += 20;
  if (target.includes("kimchi") && categories.includes("kimchi")) score += 20;
  if (target.includes("soda") && categories.includes("soda")) score += 20;
  if (target.includes("water") && categories.includes("water")) score += 20;

  return score;
}

async function searchOpenFoodFacts(term) {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(term)}` +
    `&search_simple=1` +
    `&action=process` +
    `&json=1` +
    `&page_size=12` +
    `&fields=product_name,generic_name,image_front_url,image_url,selected_images,categories_tags`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "VestaDemoImageUpdater/1.0 (presentation support)",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts request failed with ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.products) ? data.products : [];
}

async function resolveImageUrl(itemName) {
  const searchTerms = buildSearchTerms(itemName);
  let bestMatch = null;
  let bestScore = -1;

  for (const term of searchTerms) {
    const products = await searchOpenFoodFacts(term);

    for (const product of products) {
      const imageUrl = getProductImage(product);
      if (!imageUrl) continue;

      const score = scoreProduct(product, itemName);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          imageUrl,
          searchTerm: term,
          productName: product?.product_name ?? null,
          score,
        };
      }
    }
  }

  return bestMatch;
}

async function fetchTargetDocs(userId) {
  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection(PANTRY_COLLECTION)
    .where("name", "in", TARGET_ITEM_NAMES.slice(0, 10))
    .get();

  const remainingSnapshot = await db
    .collection("users")
    .doc(userId)
    .collection(PANTRY_COLLECTION)
    .where("name", "in", TARGET_ITEM_NAMES.slice(10))
    .get();

  return [...snapshot.docs, ...remainingSnapshot.docs];
}

async function main() {
  const pantryDocs = await fetchTargetDocs(USER_ID);
  const docsByName = new Map();

  for (const doc of pantryDocs) {
    const name = doc.get("name");
    if (typeof name !== "string") continue;
    const list = docsByName.get(name) ?? [];
    list.push(doc);
    docsByName.set(name, list);
  }

  const results = [];
  let batch = db.batch();
  let batchCount = 0;

  for (const itemName of TARGET_ITEM_NAMES) {
    const docs = docsByName.get(itemName) ?? [];
    if (docs.length === 0) {
      results.push({
        itemName,
        updated: 0,
        imageUrl: null,
        note: "No pantryItems found with this name.",
      });
      continue;
    }

    let resolved = null;
    try {
      resolved = await resolveImageUrl(itemName);
    } catch (error) {
      results.push({
        itemName,
        updated: 0,
        imageUrl: null,
        note: error instanceof Error ? error.message : "Image lookup failed.",
      });
      continue;
    }

    if (!resolved?.imageUrl) {
      results.push({
        itemName,
        updated: 0,
        imageUrl: null,
        note: "No suitable Open Food Facts image found.",
      });
      continue;
    }

    for (const doc of docs) {
      batch.update(doc.ref, { imageUrl: resolved.imageUrl });
      batchCount += 1;

      if (batchCount === 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    results.push({
      itemName,
      updated: docs.length,
      imageUrl: resolved.imageUrl,
      matchedProduct: resolved.productName,
      searchTerm: resolved.searchTerm,
      score: resolved.score,
    });
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(
    JSON.stringify(
      {
        userId: USER_ID,
        updatedItemTypes: results.filter((entry) => entry.updated > 0).length,
        targetItemTypes: TARGET_ITEM_NAMES.length,
        results,
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
