import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-black/60">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="pt-0.5">{right}</div> : null}
    </div>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="px-4 pb-4">{children}</div>;
}
