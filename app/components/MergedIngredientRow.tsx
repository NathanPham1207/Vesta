"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";

export function MergedIngredientRow({
  name,
  confidenceMax,
  sources,
  checked,
  onToggle,
}: {
  name: string;
  confidenceMax: number;
  sources: { locationTag: string }[];
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  const pct = Math.round(confidenceMax * 100);
  const sourceCount = sources.length;
  const uniqueLocations = Array.from(
    new Set(sources.map((s) => s.locationTag)),
  );

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-black/5">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-black/20"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div className="capitalize">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-black/50">
            Seen in {sourceCount} photo{sourceCount > 1 ? "s" : ""} •{" "}
            {uniqueLocations.join(", ")}
          </div>
        </div>
      </div>

      <Badge tone={pct >= 85 ? "good" : pct >= 70 ? "info" : "warn"}>
        {pct}%
      </Badge>
    </label>
  );
}
