import { RankedRecipe, Recipe, SubOption } from "./types";

const SYNONYMS: Record<string, string> = {
  scallions: "green onion",
  "spring onion": "green onion",
  capsicum: "bell pepper",
  "garbanzo beans": "chickpea",
  cilantro: "coriander",
};

const STAPLES = new Set(["salt", "pepper", "oil", "water"]);

const SUBS: Record<string, SubOption[]> = {
  butter: [
    { use: ["oil"], note: "Use oil for cooking; flavor will be less rich." },
  ],
  parmesan: [
    { use: ["cheddar"], note: "Different flavor but works for topping." },
  ],
  buttermilk: [
    { use: ["milk", "lemon juice"], note: "Mix and rest 5–10 min." },
    { use: ["milk", "vinegar"], note: "1 tbsp vinegar per cup milk." },
  ],
  paprika: [{ use: ["chili powder"], note: "A bit spicier; use less." }],
};

export function normalizeOne(s: string): string {
  let x = s.trim().toLowerCase();
  x = x.replace(/[()]/g, "");
  x = x.replace(/[^a-z0-9\s-]/g, "");
  x = x.replace(/\s+/g, " ").trim();

  // naive singularization
  if (x.endsWith("es")) x = x.slice(0, -2);
  else if (x.endsWith("s") && x.length > 3) x = x.slice(0, -1);

  if (SYNONYMS[x]) x = SYNONYMS[x];
  return x;
}

export function normalizeList(list: string[]): string[] {
  return list.map(normalizeOne).filter(Boolean);
}

function getSubsForMissing(missing: string, have: Set<string>): SubOption[] {
  const options = SUBS[missing] ?? [];
  // show options even if not fully available (but you can filter stricter if you want)
  return options.map((opt) => ({
    ...opt,
    // could add a flag "available" if you want
  }));
}

export function rankRecipes(
  recipes: Recipe[],
  haveSet: Set<string>,
  maxTime?: number,
): RankedRecipe[] {
  const ranked = recipes
    .filter((r) =>
      typeof maxTime === "number" ? r.timeMinutes <= maxTime : true,
    )
    .map((r) => {
      const need = r.ingredientsNormalized.map(normalizeOne);
      const total = need.length;

      const matched = need.filter((i) => haveSet.has(i));
      const missing = need.filter((i) => !haveSet.has(i));

      const core = new Set(
        (r.coreIngredientsNormalized ?? []).map(normalizeOne),
      );
      const missingCore = missing.filter((m) => core.has(m) && !STAPLES.has(m));

      const subsMap: Record<string, SubOption[]> = {};
      for (const m of missing) {
        const subs = getSubsForMissing(m, haveSet);
        if (subs.length) subsMap[m] = subs;
      }

      // scoring
      const matchRatio = total ? matched.length / total : 0;
      const missingRatio = total ? missing.length / total : 1;
      const missingCoreRatio = total ? missingCore.length / total : 1;
      const subPossibleRatio = total ? Object.keys(subsMap).length / total : 0;

      const timePenalty =
        typeof maxTime === "number" && maxTime > 0
          ? Math.max(0, (r.timeMinutes - maxTime) / maxTime)
          : 0;

      const score =
        0.6 * matchRatio -
        0.25 * missingCoreRatio -
        0.1 * missingRatio +
        0.15 * subPossibleRatio -
        0.1 * timePenalty;

      return {
        ...r,
        score,
        matchCount: matched.length,
        totalCount: total,
        missing,
        substitutions: subsMap,
      } satisfies RankedRecipe;
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // tie-breakers
      if (a.missing.length !== b.missing.length)
        return a.missing.length - b.missing.length;
      return a.timeMinutes - b.timeMinutes;
    });

  return ranked;
}
