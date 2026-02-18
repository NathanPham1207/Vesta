"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ScanButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          // For demo: send user to confirm page (or scan page)
          // In a real version, upload to Firebase Storage first.
          router.push("/confirm");

          // Reset so user can select the same file again later
          e.target.value = "";
        }}
      />

      <Button className="w-full" onClick={() => inputRef.current?.click()}>
        Scan my fridge
      </Button>
    </>
  );
}
