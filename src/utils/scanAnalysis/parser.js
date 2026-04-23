function stripMarkdownCodeFences(rawText) {
  if (typeof rawText !== "string") {
    return "";
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed
    .replace(/^```(?:json|javascript|js)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractLikelyJsonText(rawText) {
  const stripped = stripMarkdownCodeFences(rawText);

  if (!stripped) {
    return "";
  }

  try {
    JSON.parse(stripped);
    return stripped;
  } catch (error) {
    // Continue trying to extract a likely JSON segment.
  }

  const firstObjectBrace = stripped.indexOf("{");
  const lastObjectBrace = stripped.lastIndexOf("}");

  if (
    firstObjectBrace !== -1 &&
    lastObjectBrace !== -1 &&
    lastObjectBrace > firstObjectBrace
  ) {
    const objectCandidate = stripped.slice(firstObjectBrace, lastObjectBrace + 1);

    try {
      JSON.parse(objectCandidate);
      return objectCandidate;
    } catch (error) {
      // Continue trying array extraction below.
    }
  }

  const firstArrayBracket = stripped.indexOf("[");
  const lastArrayBracket = stripped.lastIndexOf("]");

  if (
    firstArrayBracket !== -1 &&
    lastArrayBracket !== -1 &&
    lastArrayBracket > firstArrayBracket
  ) {
    const arrayCandidate = stripped.slice(firstArrayBracket, lastArrayBracket + 1);

    try {
      JSON.parse(arrayCandidate);
      return arrayCandidate;
    } catch (error) {
      // Fall through to returning the stripped text.
    }
  }

  return stripped;
}

function parseJsonSafely(rawText) {
  const normalizedText = extractLikelyJsonText(rawText);

  if (!normalizedText) {
    return {
      value: null,
      error: new Error("AI response was empty"),
    };
  }

  try {
    return {
      value: JSON.parse(normalizedText),
      error: null,
    };
  } catch (error) {
    return {
      value: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to parse AI response as JSON"),
    };
  }
}

module.exports = {
  stripMarkdownCodeFences,
  extractLikelyJsonText,
  parseJsonSafely,
};