const express = require("express");
const multer = require("multer");
const { analyzeScan } = require("../controllers/scanController");

const router = express.Router();

function imageFileFilter(req, file, cb) {
  if (file?.mimetype?.startsWith("image/")) {
    return cb(null, true);
  }

  const error = new Error("Only image files are allowed");
  error.statusCode = 400;
  return cb(error);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

router.post("/analyze-image", upload.single("image"), analyzeScan);

module.exports = router;