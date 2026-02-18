import React from "react";

export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "missing";
}) {
  const styles =
    tone === "missing"
      ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
      : "bg-black/5 text-black/70";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${styles}`}>
      {children}
    </span>
  );
}
