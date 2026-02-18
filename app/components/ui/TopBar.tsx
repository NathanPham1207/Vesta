import Link from "next/link";
import React from "react";

export function TopBar({
  title = "Vesta",
  backHref,
  right,
}: {
  title?: string;
  backHref?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10"
            aria-label="Back"
          >
            ←
          </Link>
        ) : null}
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="text-xs text-black/50">
            Cook smarter with what you have
          </div>
        </div>
      </div>

      {right ? (
        right
      ) : (
        <div
          className="h-9 w-9 rounded-full bg-black/10"
          aria-label="Profile"
        />
      )}
    </div>
  );
}
