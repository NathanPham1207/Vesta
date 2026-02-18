"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { SessionPhotoCard } from "@/components/SessionPhotoCard";
import {
  createScanSession,
  listSessionPhotos,
  makeMockDetectedForPhoto,
  PhotoLocationTag,
  uploadSessionPhoto,
  type SessionPhoto,
} from "@/lib/session";

export default function ScanSessionPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const sid = sp.get("sid");
  const [sessionId, setSessionId] = useState<string | null>(sid);

  const [photos, setPhotos] = useState<SessionPhoto[]>([]);
  const [locationTag, setLocationTag] = useState<PhotoLocationTag>("fridge");
  const [busy, setBusy] = useState(false);

  // If no sid, create one and update URL
  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      if (sessionId) return;
      const newId = await createScanSession();
      if (cancelled) return;
      setSessionId(newId);
      router.replace(`/scan?sid=${newId}`);
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  // Load photos when session is ready
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!sessionId) return;
      const list = await listSessionPhotos(sessionId);
      if (cancelled) return;
      setPhotos(list);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const canContinue = photos.length > 0;

  const handleAddPhoto = async (file: File) => {
    if (!sessionId) return;
    setBusy(true);
    try {
      const detected = makeMockDetectedForPhoto();
      await uploadSessionPhoto(sessionId, file, locationTag, detected);
      const list = await listSessionPhotos(sessionId);
      setPhotos(list);
    } finally {
      setBusy(false);
    }
  };

  const inputId = useMemo(
    () => `scan-input-${sessionId ?? "new"}`,
    [sessionId],
  );

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Container>
        <TopBar backHref="/" title="Scan session" />

        <Card>
          <CardHeader
            title="Scan your kitchen"
            subtitle="Add multiple photos (fridge, pantry, counter) so we don’t miss ingredients."
          />
          <CardBody>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">Photo location</div>

              <select
                value={locationTag}
                onChange={(e) =>
                  setLocationTag(e.target.value as PhotoLocationTag)
                }
                className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-black/10 focus:outline-none focus:ring-black/30"
              >
                <option value="fridge">Fridge</option>
                <option value="pantry">Pantry / Closet</option>
                <option value="counter">Counter</option>
                <option value="freezer">Freezer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mt-3 rounded-2xl border border-dashed border-black/15 bg-white p-4">
              <div className="text-sm font-semibold">Add a photo</div>
              <div className="mt-1 text-xs text-black/60">
                On mobile, this can open the camera. On desktop, you can upload
                files.
              </div>

              <input
                id={inputId}
                type="file"
                accept="image/*"
                capture="environment"
                className="mt-3 w-full text-sm"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  handleAddPhoto(f);
                  e.currentTarget.value = "";
                }}
              />

              <div className="mt-2 text-xs text-black/50">
                Status: {busy ? "Uploading..." : "Ready"}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="mt-4">
          <div className="px-1 text-sm font-semibold">
            Photos in this session
          </div>
          <div className="px-1 text-xs text-black/60">
            Added: {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </div>

          {photos.length === 0 ? (
            <div className="mt-3 rounded-2xl bg-black/5 p-4 text-sm text-black/60">
              No photos yet. Add at least one photo to continue.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {photos.map((p) => (
                <SessionPhotoCard key={p.id} photo={p} />
              ))}
            </div>
          )}
        </div>

        <BottomBar>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => router.push("/")}
              disabled={busy}
            >
              Back
            </Button>

            <Button
              className="flex-1"
              onClick={() => router.push(`/confirm?sid=${sessionId}`)}
              disabled={!canContinue || busy || !sessionId}
            >
              Continue
            </Button>
          </div>
        </BottomBar>
      </Container>
    </div>
  );
}
