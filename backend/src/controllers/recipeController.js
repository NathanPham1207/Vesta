const { generateRecipes } = require("../services/recipeService");
const { getInventoryItems } = require("../services/inventoryService");
const { db, admin } = require("../config/firebase");

async function getRecipeRecommendations(req, res) {
  try {
    const userId = req.query.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const pantryItems = await getInventoryItems(userId);

    if (!Array.isArray(pantryItems) || pantryItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pantry items found",
      });
    }

    const pantryKey = JSON.stringify(
      pantryItems
        .map((i) => ({
          name: i.name,
          status: i.status,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    if (db) {
      const cacheRef = db
        .collection("users")
        .doc(userId)
        .collection("recipeCache")
        .doc("current");

      const cacheSnap = await cacheRef.get();

      if (cacheSnap.exists) {
        const data = cacheSnap.data();

        if (data.pantryKey === pantryKey) {
          return res.status(200).json({
            success: true,
            cached: true,
            recipes: data.recipes,
            source: data.source || "cache",
            fallback: Boolean(data.fallback),
            generatedAt: data.generatedAt || null,
            message: data.message || undefined,
          });
        }
      }
    }

    const result = await generateRecipes(pantryItems);

    if (db) {
      const cacheRef = db
        .collection("users")
        .doc(userId)
        .collection("recipeCache")
        .doc("current");

      await cacheRef.set({
        pantryKey,
        recipes: result.recipes,
        source: result.source,
        fallback: Boolean(result.fallback),
        message: result.message || null,
        generatedAt: result.generatedAt || new Date().toISOString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({
      success: true,
      cached: false,
      ...result,
    });
  } catch (error) {
    console.error("Recipe controller error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate recipes",
    });
  }
}

module.exports = {
  getRecipeRecommendations,
};
