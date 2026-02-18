"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { RecipeCard } from "@/components/RecipeCard";
import { FiltersBar } from "@/components/FiltersBar";
import { MOCK_RECIPES } from "@/lib/mock";
import { normalizeList, rankRecipes } from "@/lib/recommend";

function parseIngredients(sp: URLSearchParams): string[] {
  const raw = sp.get("data");
  if (!raw) return [];
  try {
    const obj = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(obj.ingredients) ? obj.ingredients : [];
  } catch {
    return [];
  }
}

export default function ResultsPage() {
  const sp = useSearchParams();
  const initial = useMemo(() => normalizeList(parseIngredients(sp)), [sp]);

  const [maxTime, setMaxTime] = useState<number>(30);

  const ranked = useMemo(() => {
    const have = new Set(initial);
    return rankRecipes(MOCK_RECIPES, have, maxTime);
  }, [initial, maxTime]);

  const top3 = ranked.slice(0, 3);

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Container>
        <TopBar backHref="/confirm" title="Results" />

        <Card>
          <CardHeader
            title="Best matches"
            subtitle={
              initial.length
                ? `Using ${initial.length} ingredients`
                : "No ingredients found (demo mode)."
            }
          />
          <CardBody>
            <FiltersBar maxTime={maxTime} setMaxTime={setMaxTime} />
          </CardBody>
        </Card>

        <div className="mt-4 space-y-3">
          <div className="px-1">
            <div className="text-sm font-semibold">Top picks</div>
            <div className="text-xs text-black/60">
              Ranked by match, missing core items, and substitutions.
            </div>
          </div>

          {top3.map((r) => (
            <RecipeCard key={r.id} r={r} />
          ))}

          <div className="mt-2 px-1 text-sm font-semibold">More ideas</div>
          {ranked.slice(3, 20).map((r) => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </div>
      </Container>
    </div>
  );
}
