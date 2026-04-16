const express = require("express");
const {
  fetchInventory,
  removeInventoryItem,
  saveInventory,
} = require("../controllers/inventoryController");

const router = express.Router();

// Backward-compatible route kept for existing frontend calls.
router.post("/", saveInventory);
router.get("/", fetchInventory);

router.post("/test-user", saveInventory);
router.get("/test-user", fetchInventory);

router.delete("/:userId/:itemId", removeInventoryItem);
router.post("/:userId", saveInventory);
router.get("/:userId", fetchInventory);

module.exports = router;