const fs = require("fs/promises");
const OpenAI = require("openai");

// ─── OpenAI client (initialized once) ────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  timeout: parseInt(process.env.AI_TIMEOUT_MS || "30000", 10),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || "1", 10),
});

const AI_MODEL = process.env.AI_MODEL || "gpt-4o";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeDeleteFile(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Failed to delete uploaded file:", error.message);
  }
}

// Map common grocery categories from the receipt to the app's category set.
const VALID_CATEGORIES = new Set([
  "Dairy",
  "Fruits",
  "Vegetables",
  "Meat",
  "Seafood",
  "Bakery",
  "Frozen",
  "Beverages",
  "Condiments",
  "Pantry",
  "Snacks",
  "Misc",
]);

function normalizeCategory(raw) {
  if (!raw) return "Misc";
  const trimmed = raw.trim();
  // Case-insensitive match
  for (const cat of VALID_CATEGORIES) {
    if (cat.toLowerCase() === trimmed.toLowerCase()) return cat;
  }
  return "Misc";
}

function parseAiJson(text) {
  // Strip markdown code fences if the model wraps the JSON in ```json ... ```
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(stripped);
}

// ─── AI receipt analysis ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a receipt and grocery image analyzer.
When given an image, extract ONLY food and beverage items and return ONLY valid JSON in this exact shape:

{
  "isFoodRelated": true,
  "imageType": "receipt" | "pantry" | "grocery" | "food_product",
  "storeName": "<store name or null>",
  "purchaseDate": "<YYYY-MM-DD or null>",
  "items": [
    {
      "name": "<full readable item name>",
      "quantity": <number or null>,
      "unit": "<unit string or null>",
      "price": <number or null>,
      "category": "<one of: Dairy, Fruits, Vegetables, Meat, Seafood, Bakery, Frozen, Beverages, Condiments, Pantry, Snacks, Misc>"
    }
  ]
}

If the image contains no food or beverage items at all, return:
{ "isFoodRelated": false }

Rules:
- Do NOT include markdown, explanation, or extra text — only JSON.
- ONLY include food and beverage items. Exclude non-food products such as
  cleaning supplies, toiletries, paper goods, household items, electronics, etc.
- price must always be the total line price shown on the receipt for that item —
  NOT the unit price, per-lb rate, or per-piece rate.
  Examples:
    "2.5 lb @ $1.99/lb = $4.97"  → price: 4.97  (not 1.99)
  If no line total is visible, set price to null.
- quantity and unit for weighted items: set quantity to the weight value and unit
  to the weight unit (e.g. "2.5 lb" → quantity: 2.5, unit: "lb").
- For regular single items, set quantity to 1 and unit to null.
- Use null for quantity only when it truly cannot be determined.
- Do NOT reject an image just because it is slightly blurry, imperfectly lit, or partially cropped.


## RECEIPT ITEM NAME RESOLUTION

Receipt item names are often abbreviated, truncated, or shown as product codes due to POS system character limits. You MUST resolve every item into a human-readable food name. Never return the raw code as the item name.

### STORE BRAND PREFIXES
- KS / KSKND → Kirkland Signature (Costco)
- MM / MBR → Member's Mark (Sam's Club)
- GV → Great Value (Walmart)
- UP / UPND → Up & Up (Target)
- GG → Good & Gather (Target)
- KR → Kroger brand

### DESCRIPTOR PREFIXES
- OG / ORG / ORG. → Organic
- PREM / PRM → Premium
- LT / LTE → Light
- FF → Fat Free
- LF → Low Fat
- LS → Low Sodium
- GF → Gluten Free
- UNS → Unsweetened
- WHL → Whole
- SLCD → Sliced
- DCED → Diced
- SHRD → Shredded
- RSTD → Roasted
- FRSH → Fresh
- FRZ → Frozen

### QUANTITY / PACK SIZE SUFFIXES
- PK / PCK → Pack (e.g. 40PK = 40-Pack, 24PK = 24-Pack, 12PK = 12-Pack)
- CT → Count
- VTY / VTY PK → Variety Pack
- GAL → Gallon
- QT → Quart
- PT → Pint
- OZ → Ounces
- LB → Pounds

### COMMON FOOD ABBREVIATIONS

Proteins:
- CHKN / CHICK → Chicken
- CHKN BRS / CHKN BRST → Chicken Breast
- CHKN THGH → Chicken Thighs
- GRND BF / GRND BEEF → Ground Beef
- SLMN / SLMN FILT → Salmon Fillet
- SHRMP → Shrimp
- TRK / TRKRY → Turkey
- BCON → Bacon
- SAUS / SSGE → Sausage
- EGG WHTS → Egg Whites
- TILAPIA / TLPA → Tilapia
- CN TNA → Canned Tuna

Dairy:
- MLK → Milk
- HLGLN MLK → Half Gallon Milk
- BTR / BTTR → Butter
- YGT / YOGT / YGRT → Yogurt
- GRK YGT → Greek Yogurt
- CHZ / CHDR → Cheddar Cheese
- MOZZ → Mozzarella
- PARM / PRMGNO → Parmesan
- CRM CHS → Cream Cheese
- SOUR CRM → Sour Cream
- HVY CRM → Heavy Cream
- HLF&HLF → Half and Half

Beverages:
- WTR / WATR → Water
- KSWTR / KSWTR40PK → Kirkland Signature Water 40-Pack
- SPRKL WTR → Sparkling Water
- CNUT WTR / COCO WTR → Coconut Water
- OJ → Orange Juice
- APL JC → Apple Juice
- MNSTR / MNSTER → Monster Energy Drink
- REDBLL → Red Bull
- GAT / GTRDE / GCDE → Gatorade
- GAT VTY → Gatorade Variety Pack
- PWRD / PWRD ADE → Powerade
- LMND → Lemonade
- KOMBU → Kombucha
- COFF / KSCOFF → Coffee / Kirkland Signature Coffee
- ALMD MLK → Almond Milk
- OAT MLK → Oat Milk
- SOY MLK → Soy Milk

Produce:
- BAN / BNAN / OG BNAN → (Organic) Bananas
- APPL / APLS → Apples
- STRWB / STRAW → Strawberries
- BLUB / BLUBRY → Blueberries
- RASPB → Raspberries
- AVCD / AVO → Avocado
- PLUM / PREM PLUM → Premium Plums
- SPIN / SPNCH → Spinach
- BRCL / BRCLI → Broccoli
- CLFLWR → Cauliflower
- CRRT / CRT → Carrots
- LTCE / LTC → Lettuce
- ROM LTC → Romaine Lettuce
- SPNG MX / ORG SPNG MX → (Organic) Spring Mix
- BELL PP / BELL PEP → Bell Peppers
- ONON / YLLW ON → Yellow Onion
- GRLIC / GRLC → Garlic
- TMAT / TMT → Tomatoes
- CHRY TMT → Cherry Tomatoes
- PTTO / PTAT → Potato
- SW PTTO → Sweet Potato
- MUSHR → Mushrooms
- EDAMM → Edamame

Pantry / Dry Goods:
- RCE / RICE → Rice
- QNA / QNOA → Quinoa
- PST / PAST → Pasta
- OTS / OTML → Oatmeal
- GRNLA → Granola
- FLOR / FLR → Flour
- SGR / SUGR → Sugar
- OLVOL / OLV OL → Olive Oil
- VNGR / ACVNGR → Vinegar / Apple Cider Vinegar
- SOY SC → Soy Sauce
- KTCHP → Ketchup
- MSTRD → Mustard
- MAYO / MAYNS → Mayonnaise
- PNUT BT / PB → Peanut Butter
- ALMD BT → Almond Butter
- HNY → Honey
- MAP SYP → Maple Syrup
- VIC2PKSAUCE → Victoria Marinara Sauce 2-Pack
- HMUS → Hummus
- GUAC → Guacamole
- TRTLA CHP → Tortilla Chips
- PPCORN → Popcorn
- ALMND → Almonds
- CSEW → Cashews
- WLNT → Walnuts
- PNUT / PNUTS → Peanuts
- BLCK BNS → Black Beans
- CHKPE / GBNZO → Chickpeas
- CN TOM → Canned Tomatoes
- CHKN BRTH → Chicken Broth
- VEG BRTH → Vegetable Broth

Bakery:
- WHL WHT BRD → Whole Wheat Bread
- SRDGH → Sourdough
- CRKSSNT / CRSSNT → Croissant
- TRTLA / TORTLA → Tortilla

Frozen:
- FRZ BERR → Frozen Berries
- FRZ EDAMM → Frozen Edamame
- ICE CRM → Ice Cream

### RESOLUTION RULES

1. Always resolve codes to human-readable names. Never return raw codes.
2. Combine prefix + product: KS OG BNAN → Kirkland Signature Organic Bananas, KSWTR40PK → Kirkland Signature Water 40-Pack.
3. Use store context: at Costco, KS = Kirkland Signature; at Sam's Club, MM = Member's Mark.
4. Use price as a hint: a $38.99 item labeled MNSTR at Costco is a Monster Energy multipack.
5. When uncertain, make your best inference. Do not omit the item.
6. Exclude items that are clearly non-food after resolution (paper towels, detergent, batteries, etc.).
`.trim();

async function analyzeReceiptImage(imageBuffer, mimeType) {
  // Normalize HEIC/HEIF to jpeg for the base64 label (OpenAI accepts the raw bytes)
  const imageMime =
    mimeType === "image/heic" || mimeType === "image/heif"
      ? "image/jpeg"
      : mimeType;

  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:${imageMime};base64,${base64Image}`;

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          {
            type: "text",
            text: "Extract all food/grocery items from this image.",
          },
        ],
      },
    ],
    max_tokens: 1500,
    temperature: 0,
  });

  const raw = completion.choices?.[0]?.message?.content || "";
  return parseAiJson(raw);
}

// ─── Controller ───────────────────────────────────────────────────────────────

async function scanReceipt(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No receipt image uploaded",
      });
    }

    // Accept common image formats including HEIC/HEIF from iOS gallery
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/heif",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      await safeDeleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Unsupported image format. Please use JPG, PNG, or HEIC.",
      });
    }

    console.log("Uploaded file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Read the uploaded image into memory then delete the temp file
    const imageBuffer = await fs.readFile(req.file.path);
    await safeDeleteFile(req.file.path);

    // Send the image to the AI for analysis
    let analysisResult;
    try {
      analysisResult = await analyzeReceiptImage(
        imageBuffer,
        req.file.mimetype,
      );
    } catch (aiError) {
      console.error("AI analysis failed:", aiError?.message || aiError);
      return res.status(500).json({
        success: false,
        message: "Failed to analyze the image. Please try again.",
      });
    }

    // If the image has no food content, return a structured failure
    if (!analysisResult?.isFoodRelated) {
      return res.status(200).json({
        success: false,
        reason: "non_food_image",
      });
    }

    // Normalize items to match the ScanItem shape expected by the frontend
    const items = Array.isArray(analysisResult.items)
      ? analysisResult.items.map((item) => ({
          name: typeof item.name === "string" ? item.name.trim() : "Unknown",
          quantity:
            typeof item.quantity === "number" && Number.isFinite(item.quantity)
              ? item.quantity
              : null,
          unit: typeof item.unit === "string" ? item.unit : null,
          price:
            typeof item.price === "number" && Number.isFinite(item.price)
              ? item.price
              : null,
          category: normalizeCategory(item.category),
          imageUrl: null,
        }))
      : [];

    if (items.length === 0) {
      return res.status(200).json({
        success: false,
        reason: "no_food_items_detected",
      });
    }

    // Response wrapped in "data" so frontend isApiSuccess() check passes
    return res.status(200).json({
      success: true,
      data: {
        isFoodRelated: true,
        imageType: analysisResult.imageType || "receipt",
        storeName:
          typeof analysisResult.storeName === "string"
            ? analysisResult.storeName
            : null,
        purchaseDate:
          typeof analysisResult.purchaseDate === "string"
            ? analysisResult.purchaseDate
            : null,
        items,
      },
    });
  } catch (error) {
    console.error("Failed to scan receipt:", error);
    await safeDeleteFile(req.file?.path);
    return res.status(500).json({
      success: false,
      message: "Failed to scan receipt",
    });
  }
}

module.exports = {
  scanReceipt,
};
