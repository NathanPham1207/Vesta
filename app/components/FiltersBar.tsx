"use client";

import React from "react";
import { Chip } from "./ui/Chip";

export function FiltersBar({
  maxTime,
  setMaxTime,
}: {
  maxTime: number;
  setMaxTime: (n: number) => void;
}) {
  const options = [15, 20, 30, 45];
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm font-semibold">Filters</div>
      <div className="flex flex-wrap gap-2">
        {options.map((n) => (
          <button
            key={n}
            onClick={() => setMaxTime(n)}
            className={`rounded-full px-3 py-1 text-xs ring-1 transition ${
              maxTime === n
                ? "bg-black text-white ring-black"
                : "bg-white text-black/70 ring-black/10 hover:bg-black/5"
            }`}
          >
            ≤ {n} min
          </button>
        ))}
        <span className="hidden sm:inline-flex">
          <Chip>Demo</Chip>
        </span>
      </div>
    </div>
  );
}
