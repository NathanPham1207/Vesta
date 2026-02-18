"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Badge } from "@/components/ui/Badge";
import { MOCK_RECIPES, PANTRY_DEFAULT } from "@/lib/mock";
import { normalizeList, rankRecipes } from "@/lib/recommend";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();

  const id = params.id;

  const ingredientsFromQuery = useMemo(() => {
    // If you want to carry selected ingredients into detail, pass ?i=... later.
    const raw = sp.get("i");
    if (!raw) return [];
    try {
      return normalizeList(JSON.parse(decodeURIComponent(raw)));
    } catch {
      return [];
    }
  }, [sp]);

  const recipe = MOCK_RECIPES.find((r) => r.id === id);

  const ranked = useMemo(() => {
    const have = new Set(
      normalizeList([...ingredientsFromQuery, ...PANTRY_DEFAULT]),
    );
    return rankRecipes(MOCK_RECIPES, have, 999);
  }, [ingredientsFromQuery]);

  const computed = ranked.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="min-h-dvh bg-neutral-50">
        <Container>
          <TopBar backHref="/results" title="Recipe" />
          <Card>
            <CardHeader
              title="Recipe not found"
              subtitle="This recipe id doesn’t exist in mock data."
            />
            <CardBody>
              <Link href="/results">
                <Button>Back to results</Button>
              </Link>
            </CardBody>
          </Card>
        </Container>
      </div>
    );
  }

  const missing = computed?.missing ?? [];
  const subs = computed?.substitutions ?? {};

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Container>
        <TopBar backHref="/results" title="Recipe" />

        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-black/10 to-black/0 p-5 ring-1 ring-black/10">
          <div className="text-xs text-black/60">Recipe</div>
          <div className="mt-1 text-xl font-semibold tracking-tight">
            {recipe.title}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="neutral">{recipe.timeMinutes} min</Badge>
            <Badge tone="neutral">{recipe.difficulty}</Badge>
            {computed ? (
              <Badge tone={missing.length ? "warn" : "good"}>
                {missing.length ? `Missing ${missing.length}` : "Ready to cook"}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="flex-1">Start cooking</Button>
            <Button variant="secondary" className="flex-1">
              Add missing to list
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <Card>
            <CardHeader
              title="Ingredients"
              subtitle="Missing items are highlighted with substitution tips (if available)."
            />
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredientsNormalized.map((ing) => {
                  const isMissing = missing.includes(ing);
                  return (
                    <Chip key={ing} tone={isMissing ? "missing" : "neutral"}>
                      {ing}
                    </Chip>
                  );
                })}
              </div>

              {missing.length ? (
                <div className="mt-4 space-y-3">
                  <div className="text-sm font-semibold">Substitutions</div>
                  {missing.map((m) => (
                    <div key={m} className="rounded-xl bg-black/5 p-3">
                      <div className="text-sm font-semibold capitalize">
                        {m}
                      </div>
                      {subs[m]?.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-black/70">
                          {subs[m].slice(0, 2).map((s, idx) => (
                            <li key={idx}>
                              Use{" "}
                              <span className="font-medium">
                                {s.use.join(" + ")}
                              </span>
                              {s.note ? (
                                <span className="text-black/60">
                                  {" "}
                                  — {s.note}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-1 text-sm text-black/60">
                          No substitution found in demo rules.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Steps"
              subtitle="Simple step-by-step flow (demo-friendly)."
            />
            <CardBody>
              <div className="space-y-3">
                {recipe.steps.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white p-3 ring-1 ring-black/10"
                  >
                    <div className="text-xs font-semibold text-black/60">
                      Step {idx + 1}
                    </div>
                    <div className="mt-1 text-sm">{s}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Link href="/results" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Back to results
                  </Button>
                </Link>
                <Button className="flex-1">Mark as cooked</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
}
