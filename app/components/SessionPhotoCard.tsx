import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { SessionPhoto } from "@/lib/session";

export function SessionPhotoCard({ photo }: { photo: SessionPhoto }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {photo.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.imageUrl}
            alt="Scan"
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-black/5 text-xs text-black/50">
            Uploading...
          </div>
        )}

        <div className="absolute left-2 top-2">
          <Badge tone="neutral" children={photo.locationTag} />
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs text-black/60">Detected</div>
        <div className="mt-1 text-sm font-semibold">
          {photo.detectedIngredients?.length ?? 0} items
        </div>
      </div>
    </Card>
  );
}
