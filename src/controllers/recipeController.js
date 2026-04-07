const { generateRecipes } = require("../services/recipeService");
const { getInventoryItems } = require("../services/inventoryService");

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
        message: "No pantry items found for this user",
      });
    }

    const result = await generateRecipes(pantryItems);

    return res.status(200).json({
      success: true,
      pantryCount: pantryItems.length,
      ...result,
    });
  } catch (error) {
    console.error("Recipe controller error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate recipe recommendations",
    });
  }
}

module.exports = {
  getRecipeRecommendations,
};