const express = require("express");
const router = express.Router();

const { getRecipeRecommendations } = require("../controllers/recipeController");

router.get("/recommend", getRecipeRecommendations);

module.exports = router;