const fs = require("fs/promises");

async function safeDeleteFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Failed to delete uploaded file:", error.message);
  }
}

async function scanReceipt(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No receipt image uploaded",
      });
    }

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      await safeDeleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Please upload a JPG or PNG image.",
      });
    }

    console.log("Uploaded file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    // TODO: Replace this mock with real OCR/AI parsing later.
    const parsedItems = [
      {
        name: "Milk",
        category: "Dairy",
        quantity: 1,
        expiryDate: "2026-03-30",
        status: "fresh",
      },
      {
        name: "Banana",
        category: "Fruits",
        quantity: 6,
        expiryDate: "2026-03-28",
        status: "expiring soon",
      },
    ];

    await safeDeleteFile(req.file.path);

    return res.status(200).json({
      success: true,
      items: parsedItems,
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
