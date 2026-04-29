const express = require("express");
const {
  fetchReceipts,
  saveReceipt,
} = require("../controllers/receiptDataController");

const router = express.Router();

router.get("/", fetchReceipts);
router.post("/", saveReceipt);

router.get("/test-user", fetchReceipts);
router.post("/test-user", saveReceipt);

router.get("/:userId", fetchReceipts);
router.post("/:userId", saveReceipt);

module.exports = router;
