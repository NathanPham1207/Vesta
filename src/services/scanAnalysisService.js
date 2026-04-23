const fs = require("fs/promises");
const { analyzeImageWithProvider } = require("./aiProviderService");
const { FOOD_SCAN_PROMPT } = require("../prompts/foodScanPrompt");
const { resolveItemImageUrls } = require("./imageResolverService");
const {
  parseJsonSafely,
  normalizeAnalysisResponse,
  validateAnalysisResponse,
} = require("../utils/scanAnalysis");

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
]);

function createServiceError({ message, reason, statusCode = 422, details = null }) {
  const error = new Error(message);
  error.reason = reason;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function validateImageFile(file) {
  if (!file || typeof file !== "object") {
    throw createServiceError({ message: "Image file is required.", reason: "missing_image_file", statusCode: 400 });
  }
  if (!file.mimetype || !SUPPORTED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    throw createServiceError({ message: "Only JPG, PNG, and WEBP images are supported.", reason: "invalid_image_type", statusCode: 400 });
  }
  const hasBuffer = Buffer.isBuffer(file.buffer) && file.buffer.length > 0;
  const hasPath = typeof file.path === "string" && file.path.trim().length > 0;
  if (!hasBuffer && !hasPath) {
    throw createServiceError({ message: "Uploaded image file is empty.", reason: "empty_image_file", statusCode: 400 });
  }
}

async function resolveImageBuffer(file) {
  if (Buffer.isBuffer(file.buffer) && file.buffer.length > 0) return file.buffer;
  return fs.readFile(file.path);
}

async function safeDeleteFile(filePath) {
  if (!filePath) return;
  try { await fs.unlink(filePath); } catch (error) { console.error("Failed to delete uploaded file:", error.message); }
}

function enforceFoodScanRules(normalized) {
  if (!normalized || typeof normalized !== "object") {
    throw createServiceError({ message: "Invalid scan analysis result.", reason: "invalid_analysis_result", statusCode: 502 });
  }
  if (normalized.imageType === "unclear") {
    throw createServiceError({ message: "The image is unclear. Please try again with a clearer food-related photo.", reason: "unclear_image", statusCode: 422 });
  }
  if (normalized.isFoodRelated !== true || normalized.imageType === "non_food") {
    throw createServiceError({ message: "Only food, drink, and grocery-related images are supported.", reason: "non_food_image", statusCode: 422 });
  }
  if (!Array.isArray(normalized.items) || normalized.items.length === 0) {
    throw createServiceError({ message: "We couldn't detect any valid food items from this image.", reason: "no_food_items_detected", statusCode: 422 });
  }
}

async function enrichItemsWithImages(result) {
  if (!Array.isArray(result.items) || result.items.length === 0) return result;
  const itemNames = result.items.map((item) => item.name);
  const imageUrlMap = await resolveItemImageUrls(itemNames);
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      imageUrl: imageUrlMap.get(item.name) ?? null,
    })),
  };
}

async function analyzeGroceryImage(file) {
  validateImageFile(file);
  try {
    const imageBuffer = await resolveImageBuffer(file);
    const rawAiText = await analyzeImageWithProvider({ prompt: FOOD_SCAN_PROMPT, imageBuffer, mimeType: file.mimetype });
    const { value, error } = parseJsonSafely(rawAiText);
    if (error || !value) {
      throw createServiceError({ message: "Failed to parse AI analysis response.", reason: "invalid_ai_json", statusCode: 502, details: error?.message || null });
    }
    const normalized = normalizeAnalysisResponse(value);
    const validationError = validateAnalysisResponse(normalized);
    if (validationError) {
      throw createServiceError({ message: validationError.message, reason: validationError.reason, statusCode: validationError.statusCode || 422 });
    }
    enforceFoodScanRules(normalized);
    const enriched = await enrichItemsWithImages(normalized);
    return enriched;
  } finally {
    await safeDeleteFile(file?.path);
  }
}

const analyzeScanImage = analyzeGroceryImage;
module.exports = { analyzeGroceryImage, analyzeScanImage };