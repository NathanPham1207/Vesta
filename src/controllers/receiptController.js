const { analyzeGroceryImage } = require("../services/scanAnalysisService");

function sendScanSuccess(res, data) {
  return res.status(200).json({
    success: true,
    data,
  });
}

function sendScanFailure(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

async function scanReceipt(req, res) {
  try {
    if (!req.file) {
      return sendScanFailure(res, 400, "No receipt image uploaded");
    }

    const analysis = await analyzeGroceryImage(req.file);
    console.log("=== FINAL ANALYSIS SENT TO FRONTEND ===");
    console.log("=== ANALYSIS ===");
    console.log(JSON.stringify(analysis, null, 2));
    return sendScanSuccess(res, analysis);
  } catch (error) {
    console.error("Failed to scan receipt:", error);

    return sendScanFailure(
      res,
      error.statusCode || 500,
      error.message || "Failed to scan receipt"
    );
  }
}

module.exports = {
  scanReceipt,
};