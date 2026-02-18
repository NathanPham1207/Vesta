import Link from "next/link";
import React from "react";
import { RankedRecipe } from "@/lib/types";
import { Badge } from "./ui/Badge";
import { Chip } from "./ui/Chip";
import { Card } from "./ui/Card";

export function RecipeCard({ r }: { r: RankedRecipe }) {
  const matchLabel = `${r.matchCount}/${r.totalCount} match`;
  const missingCount = r.missing.length;
  const hasSubs = Object.keys(r.substitutions).length > 0;

  return (
    <Link href={`/recipe/${r.id}`} className="block">
      <Card className="p-4 hover:shadow-md transition">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold tracking-tight">
              {r.title}
            </div>
            <div className="mt-1 text-xs text-black/60">
              {r.timeMinutes} min • {r.difficulty}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-black/50">Score</div>
            <div className="text-sm font-semibold">
              {Math.max(0, Math.min(1, r.score)).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="good">{matchLabel}</Badge>
          <Badge tone={missingCount ? "warn" : "good"}>
            {missingCount ? `Missing ${missingCount}` : "No missing"}
          </Badge>
          {hasSubs ? <Badge tone="info">Sub available</Badge> : null}
        </div>

        {missingCount ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {r.missing.slice(0, 4).map((m) => (
              <Chip key={m} tone="missing">
                {m}
              </Chip>
            ))}
            {missingCount > 4 ? (
              <Chip tone="missing">+{missingCount - 4}</Chip>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {r.tags.slice(0, 4).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
