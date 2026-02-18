import React from "react";

type Tone = "neutral" | "good" | "warn" | "info";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  const styles: Record<Tone, string> = {
    neutral: "bg-black/5 text-black/70",
    good: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    warn: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
