const { analyzeGroceryImage } = require("../services/scanAnalysisService");

/**
 * Handle grocery image analysis requests.
 *
 * Expected input:
 * - req.file: uploaded image file from multer
 * Success response:
 * - 200 { success: true, data: ... }
 *
 * Client error response:
 * - 4xx { success: false, message: ... }
 *
 * Unexpected errors are forwarded to Express error middleware.
 */
async function analyzeScan(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
        reason: "missing_image_file",
      });
    }
    const result = await analyzeGroceryImage(req.file);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        reason: error.reason || "validation_error",
      });
    }

    if (error.reason && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        reason: error.reason,
      });
    }

    next(error);
  }
}

module.exports = {
  analyzeScan,
};