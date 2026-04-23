const APP_CATEGORIES = Object.freeze([
  "Bakery",
  "Dairy",
  "Fruits",
  "Vegetables",
  "Frozen",
  "Meat",
  "Seafood",
  "Beverages",
  "Pantry",
  "Snacks",
  "Condiments",
  "Misc",
]);

const ALLOWED_CATEGORIES = new Set(APP_CATEGORIES);

const ALLOWED_TYPES = new Set([
  "receipt",
  "pantry",
  "grocery",
  "food_product",
]);

const CATEGORY_GROUPS = Object.freeze({
  Misc: [
    "misc",
    "other",
    "unknown",
    "uncategorized",
  ],

  Fruits: [
    "fruit",
    "fruits",
    "apple",
    "apples",
    "banana",
    "bananas",
    "orange",
    "oranges",
    "grape",
    "grapes",
    "strawberry",
    "strawberries",
    "blueberry",
    "blueberries",
    "mango",
    "pineapple",
    "watermelon",
    "melon",
    "pear",
    "pears",
    "peach",
    "peaches",
    "plum",
    "plums",
    "kiwi",
    "avocado",
    "cherry",
    "cherries",
    "lemon",
    "lemons",
    "lime",
    "limes",
    "raspberry",
    "raspberries",
    "blackberry",
    "blackberries",
  ],

  Vegetables: [
    "vegetable",
    "vegetables",
    "veggie",
    "veggies",
    "lettuce",
    "spinach",
    "broccoli",
    "carrot",
    "carrots",
    "cucumber",
    "cucumbers",
    "tomato",
    "tomatoes",
    "onion",
    "onions",
    "potato",
    "potatoes",
    "corn",
    "pepper",
    "peppers",
    "mushroom",
    "mushrooms",
    "celery",
    "zucchini",
    "cabbage",
    "cauliflower",
    "garlic",
    "ginger",
    "kale",
  ],

  Condiments: [
    "condiment",
    "condiments",
    "sauce",
    "sauces",
    "seasoning",
    "seasonings",
    "spice",
    "spices",
    "dressing",
    "dressings",
    "dip",
    "dips",
    "spread",
    "spreads",
    "ketchup",
    "mustard",
    "mayo",
    "mayonnaise",
    "soy sauce",
    "hot sauce",
    "bbq sauce",
    "barbecue sauce",
    "ranch",
    "salsa",
    "pesto",
    "vinegar",
    "jam",
    "jelly",
    "honey",
    "syrup",
    "peanut butter",
    "salt",
    "black pepper",
    "garlic powder",
    "onion powder",
  ],

  Dairy: [
    "dairy",
    "milk",
    "cheese",
    "yogurt",
    "yoghurt",
    "butter",
    "cream",
    "sour cream",
    "cream cheese",
    "cottage cheese",
    "egg",
    "eggs",
  ],

  Meat: [
    "meat",
    "beef",
    "pork",
    "poultry",
    "chicken",
    "turkey",
    "bacon",
    "sausage",
    "ham",
    "steak",
    "ground beef",
  ],

  Seafood: [
    "seafood",
    "fish",
    "shrimp",
    "salmon",
    "tuna",
    "crab",
    "lobster",
    "tilapia",
    "cod",
  ],

  Bakery: [
    "bakery",
    "bread",
    "pastry",
    "bagel",
    "bagels",
    "croissant",
    "muffin",
    "muffins",
    "cake",
    "cookie",
    "cookies",
    "cracker",
    "crackers",
    "tortilla",
    "wrap",
  ],

  Frozen: [
    "frozen",
    "ice cream",
    "frozen pizza",
    "frozen vegetables",
    "frozen fruit",
    "frozen meal",
    "popsicle",
  ],

  Pantry: [
    "pantry",
    "canned",
    "grocery",
    "dry",
    "rice",
    "pasta",
    "noodles",
    "flour",
    "sugar",
    "oil",
    "cereal",
    "oats",
    "beans",
    "lentils",
    "quinoa",
    "broth",
    "stock",
    "soup",
    "canned tuna",
    "nuts",
  ],

  Beverages: [
    "beverage",
    "beverages",
    "drink",
    "drinks",
    "juice",
    "soda",
    "water",
    "sparkling water",
    "coconut water",
    "coffee",
    "tea",
    "smoothie",
    "sports drink",
    "energy drink",
    "monster",
    "red bull",
    "gatorade",
    "powerade",
    "bodyarmor",
    "celsius",
    "prime",
  ],

  Snacks: [
    "snack",
    "snacks",
    "chips",
    "popcorn",
    "pretzel",
    "pretzels",
    "candy",
    "candies",
    "chocolate",
    "granola bar",
    "protein bar",
    "trail mix",
    "jerky",
    "gummies",
    "biscuit",
    "biscuits",
  ],
});

const RECEIPT_TERM_ALIASES = Object.freeze({
  wtr: "water",
  watr: "water",
  cocnt: "coconut",
  coco: "coconut",
  enrg: "energy",
  drv: "drink",
  drk: "drink",
  jce: "juice",
  veg: "vegetable",
  chk: "chicken",
  chkn: "chicken",
  bf: "beef",
  bbq: "barbecue",
  frz: "frozen",
  orgnc: "organic",
});

const BRAND_CATEGORY_HINTS = Object.freeze({
  Beverages: [
    "monster",
    "red bull",
    "celsius",
    "gatorade",
    "powerade",
    "bodyarmor",
    "prime",
    "coke",
    "coca cola",
    "pepsi",
    "sprite",
    "dr pepper",
    "starbucks",
    "la croix",
    "perrier",
  ],
  Snacks: [
    "lays",
    "doritos",
    "cheetos",
    "pringles",
    "oreo",
    "ritz",
    "hershey",
    "snickers",
  ],
  Condiments: [
    "heinz",
    "hellmanns",
    "hidden valley",
    "tabasco",
    "kikkoman",
  ],
  Dairy: [
    "chobani",
    "yoplait",
    "fairlife",
    "kraft",
    "sargento",
  ],
});

function normalizeLookupKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\-\/.,()]+/g, " ")
    .replace(/\s+/g, " ");
}

function buildCategoryAliases(groups) {
  const aliases = {};

  for (const [category, values] of Object.entries(groups)) {
    for (const value of values) {
      const normalized = normalizeLookupKey(value);
      if (!normalized) {
        continue;
      }

      aliases[normalized] = category;
      aliases[normalized.replace(/\s+/g, "_")] = category;
      aliases[normalized.replace(/\s+/g, "")] = category;
    }
  }

  return aliases;
}

const CATEGORY_ALIASES = Object.freeze(buildCategoryAliases(CATEGORY_GROUPS));

function expandReceiptTerms(text) {
  const normalized = normalizeLookupKey(text);
  if (!normalized) {
    return "";
  }

  return normalized
    .split(" ")
    .map((token) => RECEIPT_TERM_ALIASES[token] || token)
    .join(" ");
}

function resolveCategoryFromText(text) {
  const normalized = normalizeLookupKey(text);
  if (!normalized) {
    return "Misc";
  }

  const expanded = expandReceiptTerms(normalized);

  return (
    CATEGORY_ALIASES[normalized] ||
    CATEGORY_ALIASES[expanded] ||
    CATEGORY_ALIASES[expanded.replace(/\s+/g, "")] ||
    "Misc"
  );
}

module.exports = {
  APP_CATEGORIES,
  ALLOWED_CATEGORIES,
  ALLOWED_TYPES,
  CATEGORY_GROUPS,
  CATEGORY_ALIASES,
  RECEIPT_TERM_ALIASES,
  BRAND_CATEGORY_HINTS,
  normalizeLookupKey,
  expandReceiptTerms,
  resolveCategoryFromText,
};