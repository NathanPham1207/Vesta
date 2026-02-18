import React from "react";

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 -mx-4 mt-6 border-t border-black/10 bg-white/80 px-4 py-3 backdrop-blur">
      {children}
    </div>
  );
}
