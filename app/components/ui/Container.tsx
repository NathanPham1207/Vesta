import React from "react";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-md px-4 py-5">{children}</div>;
}
