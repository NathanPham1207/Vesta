const express = require("express");
const multer = require("multer");
const { scanReceipt } = require("../controllers/receiptController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Route: POST /scan/analyze-image
// Field name "image" must match what the frontend sends via FormData
router.post("/analyze-image", upload.single("image"), scanReceipt);

module.exports = router;
