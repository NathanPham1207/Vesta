const express = require("express");
const {
  fetchInventory,
  fetchInventorySummary,
  removeInventoryItem,
  saveInventory,
} = require("../controllers/inventoryController");

const router = express.Router();

// Backward-compatible route kept for existing frontend calls.
router.post("/", saveInventory);
router.get("/", fetchInventory);
router.get("/summary", fetchInventorySummary);

router.post("/test-user", saveInventory);
router.get("/test-user", fetchInventory);
router.get("/test-user/summary", fetchInventorySummary);

// Delete one raw lot document only (never a grouped product).
router.delete("/:userId/:itemId", removeInventoryItem);
router.post("/:userId", saveInventory);
router.get("/:userId", fetchInventory);
router.get("/:userId/summary", fetchInventorySummary);

module.exports = router;