const DEFAULT_PROVIDER = "openai_compatible";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RETRIES = 1;
const ERROR_BODY_PREVIEW_LIMIT = 500;

function createProviderError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw createProviderError(`${name} is not configured`, 500);
  }

  return value;
}

function truncateText(text, maxLength = ERROR_BODY_PREVIEW_LIMIT) {
  if (typeof text !== "string") {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateAnalyzeInput({ prompt, imageBuffer, mimeType }) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw createProviderError("prompt must be a non-empty string", 400);
  }

  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw createProviderError("imageBuffer must be a non-empty Buffer", 400);
  }

  if (typeof mimeType !== "string" || !mimeType.trim()) {
    throw createProviderError("mimeType must be a non-empty string", 400);
  }
}

function getTimeoutMs() {
  const raw = process.env.AI_TIMEOUT_MS;
  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function getMaxRetries() {
  const raw = process.env.AI_MAX_RETRIES;
  const parsed = Number(raw);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : DEFAULT_MAX_RETRIES;
}

function getProviderName() {
  return (process.env.AI_PROVIDER || DEFAULT_PROVIDER).toLowerCase();
}

function isRetryableError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  if (error.name === "AbortError") {
    return true;
  }

  if (typeof error.message === "string") {
    const message = error.message.toLowerCase();

    if (
      message.includes("network") ||
      message.includes("fetch failed") ||
      message.includes("timed out")
    ) {
      return true;
    }
  }

  return Number.isInteger(error.statusCode) && error.statusCode >= 500;
}

async function parseJsonResponse(response) {
  const rawText = await response.text();

  if (!response.ok) {
    throw createProviderError(
      `AI provider request failed with status ${response.status}: ${truncateText(rawText)}`,
      response.status
    );
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw createProviderError(
      `AI provider returned non-JSON response: ${truncateText(rawText)}`,
      502
    );
  }
}

async function postJson(url, { headers = {}, body, timeoutMs = getTimeoutMs() }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    return await parseJsonResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      throw createProviderError(
        `AI provider request timed out after ${timeoutMs}ms`,
        504
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function withRetry(operation, maxRetries = getMaxRetries()) {
  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const shouldRetry = attempt < maxRetries && isRetryableError(error);
      if (!shouldRetry) {
        throw error;
      }

      await delay(500 * (attempt + 1));
      attempt += 1;
    }
  }

  throw lastError;
}

function extractOpenAiCompatibleContent(responseJson) {
  const firstChoice = responseJson?.choices?.[0];
  const content = firstChoice?.message?.content;

  if (typeof content === "string" && content.trim()) {
    return content;
  }

  if (Array.isArray(content)) {
    const textPart = content.find(
      (part) => part?.type === "text" && typeof part?.text === "string" && part.text.trim()
    );

    if (textPart) {
      return textPart.text;
    }
  }

  throw createProviderError("AI provider did not return text content", 502);
}

function buildOpenAiCompatibleVisionPayload({ prompt, base64Image, mimeType }) {
  return {
    model: process.env.AI_MODEL || DEFAULT_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  };
}

async function callOpenAiCompatibleVision({ prompt, imageBuffer, mimeType }) {
  const apiKey = getRequiredEnv("AI_API_KEY");
  const baseUrl = process.env.AI_BASE_URL || DEFAULT_OPENAI_BASE_URL;

  return withRetry(async () => {
    const responseJson = await postJson(`${baseUrl}/chat/completions`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: buildOpenAiCompatibleVisionPayload({
        prompt,
        base64Image: imageBuffer.toString("base64"),
        mimeType,
      }),
    });

    return extractOpenAiCompatibleContent(responseJson);
  });
}

async function callCustomHttpProvider({ prompt, imageBuffer, mimeType }) {
  const endpoint = getRequiredEnv("AI_CUSTOM_ENDPOINT");
  const apiKey = process.env.AI_API_KEY;

  return withRetry(async () => {
    const responseJson = await postJson(endpoint, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      body: {
        prompt,
        imageBase64: imageBuffer.toString("base64"),
        mimeType,
        model: process.env.AI_MODEL || null,
      },
    });

    const content =
      responseJson?.outputText ||
      responseJson?.text ||
      responseJson?.data?.text;

    if (typeof content !== "string" || !content.trim()) {
      throw createProviderError("Custom AI provider did not return text output", 502);
    }

    return content;
  });
}

async function analyzeImageWithProvider({ prompt, imageBuffer, mimeType }) {
  validateAnalyzeInput({ prompt, imageBuffer, mimeType });

  const provider = getProviderName();

  switch (provider) {
    case "openai_compatible":
      return callOpenAiCompatibleVision({ prompt, imageBuffer, mimeType });
    case "custom_http":
      return callCustomHttpProvider({ prompt, imageBuffer, mimeType });
    default:
      throw createProviderError(`Unsupported AI provider: ${provider}`, 500);
  }
}

module.exports = {
  analyzeImageWithProvider,
};