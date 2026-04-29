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

const IMAGE_ALIASES = [
  ["sourdough bread", "bread"],
  ["whole wheat bread", "bread"],
  ["multigrain bread", "bread"],
  ["bagels", "bread"],
  ["english muffins", "bread"],
  ["croissants", "bread"],
  ["dinner rolls", "bread"],
  ["butter rolls", "bread"],
  ["hamburger buns", "bread"],
  ["tortilla wraps", "tortillas"],
  ["sparkling water", "water"],
  ["orange juice", "orange"],
  ["apple juice", "apple"],
  ["cold brew coffee", "coffee"],
  ["premier cafe latte", "coffee"],
  ["green tea", "tea"],
  ["black tea", "tea"],
  ["soda", "cola"],
  ["monster energy", "energy_drink"],
  ["oat milk", "milk"],
  ["coconut water", "coconut"],
  ["lemonade", "lemon"],
  ["barbecue sauce", "ketchup"],
  ["yellow mustard", "mustard"],
  ["mayonnaise", "mayonnaise"],
  ["hot sauce", "chili"],
  ["soy sauce", "soy_sauce"],
  ["sriracha", "chili"],
  ["ranch dressing", "cream"],
  ["italian dressing", "olive_oil"],
  ["pesto", "basil"],
  ["peanut sauce", "peanut_butter"],
  ["honey mustard", "mustard"],
  ["whole milk", "milk"],
  ["greek yogurt", "yogurt"],
  ["cheddar cheese", "cheese"],
  ["mozzarella cheese", "mozzarella"],
  ["parmesan cheese", "parmesan"],
  ["cream cheese", "cheese"],
  ["half and half", "cream"],
  ["sour cream", "cream"],
  ["cottage cheese", "cheese"],
  ["vanilla yogurt", "yogurt"],
  ["bananas", "banana"],
  ["apples", "apple"],
  ["strawberries", "strawberries"],
  ["blueberries", "blueberries"],
  ["grapes", "grapes"],
  ["oranges", "orange"],
  ["lemons", "lemon"],
  ["limes", "lime"],
  ["avocados", "avocado"],
  ["pineapple", "pineapple"],
  ["mangoes", "mango"],
  ["sweet tomatoes", "tomato"],
  ["chicken breast", "chicken"],
  ["ground beef", "beef"],
  ["turkey slices", "turkey"],
  ["breakfast sausage", "sausage"],
  ["pork chops", "pork"],
  ["rotisserie chicken", "chicken"],
  ["deli ham", "ham"],
  ["salami", "salami"],
  ["meatballs", "meatballs"],
  ["thai jasmine rice", "rice"],
  ["basmati rice", "rice"],
  ["penne pasta", "pasta"],
  ["all-purpose flour", "flour"],
  ["brown sugar", "brown_sugar"],
  ["granulated sugar", "sugar"],
  ["sea salt", "salt"],
  ["black pepper", "black_pepper"],
  ["olive oil", "olive_oil"],
  ["sesame oil", "oil"],
  ["kimchi", "cabbage"],
  ["seaweed snacks", "seaweed"],
  ["peanut butter", "peanut_butter"],
  ["rolled oats", "oats"],
  ["chicken broth", "broth"],
  ["canned tomatoes", "tomato"],
  ["salmon fillets", "salmon"],
  ["shrimp", "shrimp"],
  ["tuna steaks", "tuna"],
  ["cod fillets", "cod"],
  ["crab cakes", "crab"],
  ["smoked salmon", "salmon"],
  ["sardines", "sardines"],
  ["seaweed salad", "seaweed"],
  ["pretzels", "bread"],
  ["potato chips", "potato"],
  ["trail mix", "nuts"],
  ["granola bars", "granola"],
  ["crackers", "bread"],
  ["popcorn", "corn"],
  ["dark chocolate", "chocolate"],
  ["rice cakes", "rice"],
  ["mixed nuts", "nuts"],
  ["fruit gummies", "strawberries"],
  ["bell peppers", "green_pepper"],
  ["spinach", "spinach"],
  ["broccoli", "broccoli"],
  ["carrots", "carrot"],
  ["cucumbers", "cucumber"],
  ["yellow onions", "onion"],
  ["green onions", "spring_onion"],
  ["garlic", "garlic"],
  ["potatoes", "potato"],
  ["sweet potatoes", "sweet_potato"],
  ["zucchini", "courgette"],
  ["mushrooms", "mushrooms"],
  ["romaine lettuce", "lettuce"],
  ["celery", "celery"],
  ["cherry tomatoes", "tomato"],
  ["frozen peas", "peas"],
  ["frozen corn", "corn"],
  ["frozen mixed berries", "berries"],
  ["frozen waffles", "bread"],
  ["frozen pizza", "pizza"],
  ["frozen dumplings", "dumplings"],
  ["frozen hash browns", "potato"],
  ["vanilla ice cream", "ice_cream"],
  ["frozen edamame", "soybeans"],
  ["frozen mango", "mango"],
];

function buildDemoImage(name) {
  const normalized = name.trim().toLowerCase();
  const alias = IMAGE_ALIASES.find(([key]) => key === normalized)?.[1]
    ?? normalized.replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "_");

  return `https://www.themealdb.com/images/ingredients/${alias}-medium.png`;
}

const bakery = [
  ["Sourdough Bread", 1, "loaf", 6],
  ["Whole Wheat Bread", 1, "loaf", 7],
  ["Multigrain Bread", 1, "loaf", 6],
  ["Bagels", 6, "count", 5],
  ["English Muffins", 6, "count", 7],
  ["Croissants", 4, "count", 4],
  ["Dinner Rolls", 8, "count", 5],
  ["Butter Rolls", 8, "count", 5],
  ["Hamburger Buns", 8, "count", 6],
  ["Tortilla Wraps", 10, "count", 10],
];

const beverages = [
  ["Sparkling Water", 12, "cans", 30],
  ["Orange Juice", 1, "carton", 9],
  ["Apple Juice", 1, "carton", 10],
  ["Cold Brew Coffee", 1, "bottle", 14],
  ["Premier Cafe Latte", 4, "bottles", 20],
  ["Green Tea", 12, "bottles", 25],
  ["Black Tea", 12, "bottles", 25],
  ["Soda", 12, "cans", 40],
  ["Monster Energy", 6, "cans", 35],
  ["Oat Milk", 1, "carton", 12],
  ["Coconut Water", 6, "bottles", 25],
  ["Lemonade", 1, "bottle", 10],
];

const condiments = [
  ["Barbecue Sauce", 1, "bottle", 60],
  ["Ketchup", 1, "bottle", 90],
  ["Yellow Mustard", 1, "bottle", 120],
  ["Mayonnaise", 1, "jar", 45],
  ["Hot Sauce", 1, "bottle", 120],
  ["Soy Sauce", 1, "bottle", 180],
  ["Sriracha", 1, "bottle", 150],
  ["Ranch Dressing", 1, "bottle", 35],
  ["Italian Dressing", 1, "bottle", 45],
  ["Pesto", 1, "jar", 25],
  ["Peanut Sauce", 1, "jar", 40],
  ["Honey Mustard", 1, "bottle", 50],
];

const dairy = [
  ["Whole Milk", 1, "gallon", 7],
  ["Greek Yogurt", 4, "cups", 12],
  ["Butter", 1, "box", 45],
  ["Cheddar Cheese", 1, "block", 25],
  ["Mozzarella Cheese", 1, "bag", 18],
  ["Parmesan Cheese", 1, "tub", 30],
  ["Cream Cheese", 2, "blocks", 20],
  ["Eggs", 12, "count", 18],
  ["Half and Half", 1, "carton", 10],
  ["Sour Cream", 1, "tub", 14],
  ["Cottage Cheese", 1, "tub", 12],
  ["Vanilla Yogurt", 6, "cups", 10],
];

const fruits = [
  ["Bananas", 8, "count", 6],
  ["Apples", 10, "count", 18],
  ["Strawberries", 2, "boxes", 6],
  ["Blueberries", 2, "boxes", 8],
  ["Grapes", 1, "bag", 10],
  ["Oranges", 8, "count", 16],
  ["Lemons", 4, "count", 14],
  ["Limes", 4, "count", 14],
  ["Avocados", 4, "count", 7],
  ["Pineapple", 1, "count", 8],
  ["Mangoes", 3, "count", 9],
  ["Sweet Tomatoes", 2, "boxes", 7],
];

const meat = [
  ["Chicken Breast", 4, "pieces", 5],
  ["Ground Beef", 2, "packs", 4],
  ["Turkey Slices", 1, "pack", 7],
  ["Bacon", 1, "pack", 12],
  ["Breakfast Sausage", 1, "pack", 8],
  ["Pork Chops", 4, "pieces", 5],
  ["Rotisserie Chicken", 1, "count", 4],
  ["Deli Ham", 1, "pack", 6],
  ["Salami", 1, "pack", 20],
  ["Meatballs", 1, "bag", 25],
];

const pantry = [
  ["Thai Jasmine Rice", 1, "bag", 180],
  ["Basmati Rice", 1, "bag", 180],
  ["Penne Pasta", 2, "boxes", 180],
  ["Spaghetti", 2, "boxes", 180],
  ["Macaroni", 2, "boxes", 180],
  ["All-Purpose Flour", 1, "bag", 180],
  ["Brown Sugar", 1, "bag", 180],
  ["Granulated Sugar", 1, "bag", 180],
  ["Sea Salt", 1, "canister", 365],
  ["Black Pepper", 1, "jar", 365],
  ["Olive Oil", 1, "bottle", 180],
  ["Sesame Oil", 1, "bottle", 180],
  ["Kimchi", 1, "jar", 25],
  ["Seaweed Snacks", 6, "packs", 120],
  ["Peanut Butter", 1, "jar", 120],
  ["Rolled Oats", 1, "container", 180],
  ["Chicken Broth", 2, "cartons", 60],
  ["Canned Tomatoes", 4, "cans", 240],
];

const seafood = [
  ["Salmon Fillets", 4, "pieces", 4],
  ["Shrimp", 1, "bag", 6],
  ["Tuna Steaks", 2, "pieces", 3],
  ["Cod Fillets", 2, "pieces", 4],
  ["Crab Cakes", 1, "box", 10],
  ["Smoked Salmon", 1, "pack", 9],
  ["Sardines", 4, "cans", 180],
  ["Seaweed Salad", 1, "tub", 8],
];

const snacks = [
  ["Pretzels", 1, "bag", 45],
  ["Potato Chips", 2, "bags", 40],
  ["Trail Mix", 1, "bag", 60],
  ["Granola Bars", 1, "box", 90],
  ["Crackers", 2, "boxes", 80],
  ["Popcorn", 1, "box", 120],
  ["Dark Chocolate", 3, "bars", 120],
  ["Rice Cakes", 1, "bag", 60],
  ["Mixed Nuts", 1, "jar", 90],
  ["Fruit Gummies", 1, "bag", 75],
];

const vegetables = [
  ["Bell Peppers", 6, "count", 10],
  ["Spinach", 1, "box", 6],
  ["Broccoli", 2, "heads", 8],
  ["Carrots", 1, "bag", 20],
  ["Cucumbers", 3, "count", 9],
  ["Yellow Onions", 4, "count", 25],
  ["Green Onions", 2, "bundles", 7],
  ["Garlic", 2, "bulbs", 30],
  ["Potatoes", 1, "bag", 30],
  ["Sweet Potatoes", 4, "count", 25],
  ["Zucchini", 4, "count", 8],
  ["Mushrooms", 2, "packs", 7],
  ["Romaine Lettuce", 2, "heads", 6],
  ["Celery", 1, "bundle", 10],
  ["Cherry Tomatoes", 2, "boxes", 7],
];

const frozen = [
  ["Frozen Peas", 1, "bag", 120],
  ["Frozen Corn", 1, "bag", 120],
  ["Frozen Mixed Berries", 1, "bag", 150],
  ["Frozen Waffles", 1, "box", 90],
  ["Frozen Pizza", 2, "boxes", 60],
  ["Frozen Dumplings", 1, "bag", 120],
  ["Frozen Hash Browns", 1, "bag", 90],
  ["Vanilla Ice Cream", 1, "tub", 45],
  ["Frozen Edamame", 1, "bag", 120],
  ["Frozen Mango", 1, "bag", 120],
];

const categoryMap = [
  ["Bakery", bakery],
  ["Beverages", beverages],
  ["Condiments", condiments],
  ["Dairy", dairy],
  ["Fruits", fruits],
  ["Meat", meat],
  ["Pantry", pantry],
  ["Seafood", seafood],
  ["Snacks", snacks],
  ["Vegetables", vegetables],
  ["Frozen", frozen],
];

function buildSeedItems() {
  const purchaseDate = getTomorrowAtNoon();
  const purchaseDateIso = purchaseDate.toISOString();
  const createdAtBase = new Date(purchaseDate);

  const items = [];

  for (const [category, entries] of categoryMap) {
    for (const [name, quantity, unit, shelfLifeDays] of entries) {
      const createdAt = new Date(createdAtBase);
      createdAt.setMinutes(createdAt.getMinutes() + items.length);

      items.push({
        name,
        category,
        quantity,
        unit,
        source: "manual",
        purchaseDate: purchaseDateIso,
        expiryDate: addDays(purchaseDate, shelfLifeDays).toISOString(),
        imageUrl: buildDemoImage(name),
        createdAt: createdAt.toISOString(),
      });
    }
  }

  return items;
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
  const items = buildSeedItems();
  const deletedCount = await deleteExistingPantryItems(USER_ID);
  await insertPantryItems(USER_ID, items);

  console.log(
    JSON.stringify(
      {
        userId: USER_ID,
        deletedCount,
        insertedCount: items.length,
        purchaseDate: items[0]?.purchaseDate ?? null,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
