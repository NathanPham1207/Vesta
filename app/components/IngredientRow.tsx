"use client";

import React from "react";
import { Badge } from "./ui/Badge";

export function IngredientRow({
  name,
  confidence,
  checked,
  onToggle,
}: {
  name: string;
  confidence?: number;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  const pct = confidence != null ? Math.round(confidence * 100) : null;

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
          {pct != null ? (
            <div className="text-xs text-black/50">Detected • {pct}%</div>
          ) : null}
        </div>
      </div>

      {pct != null ? (
        <Badge tone={pct >= 85 ? "good" : pct >= 70 ? "info" : "warn"}>
          {pct}%
        </Badge>
      ) : null}
    </label>
  );
}
