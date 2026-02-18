"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomBar } from "@/components/ui/BottomBar";
import { Chip } from "@/components/ui/Chip";
import { MergedIngredientRow } from "@/components/MergedIngredientRow";
import { PANTRY_DEFAULT } from "@/lib/mock";
import {
  listSessionPhotos,
  mergeDetectedIngredients,
  saveConfirmedIngredients,
  type SessionPhoto,
} from "@/lib/session";
import { normalizeList } from "@/lib/recommend";

export default function ConfirmSessionPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const sid = sp.get("sid");

  const [photos, setPhotos] = useState<SessionPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [pantryOn, setPantryOn] = useState(true);
  const [manual, setManual] = useState("");
  const [manualList, setManualList] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!sid) return;
      setLoading(true);
      const list = await listSessionPhotos(sid);
      if (cancelled) return;
      setPhotos(list);

      // Initialize checked map from merged ingredients
      const merged = mergeDetectedIngredients(list);
      const init: Record<string, boolean> = {};
      for (const m of merged) init[m.name] = true;
      setChecked(init);

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sid]);

  const merged = useMemo(() => mergeDetectedIngredients(photos), [photos]);

  const selected = useMemo(() => {
    const fromMerged = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => k);

    const combined = [
      ...fromMerged,
      ...manualList,
      ...(pantryOn ? PANTRY_DEFAULT : []),
    ];

    return Array.from(new Set(normalizeList(combined)));
  }, [checked, manualList, pantryOn]);

  const addManual = () => {
    const x = manual.trim();
    if (!x) return;
    setManualList((prev) => Array.from(new Set([...prev, x.toLowerCase()])));
    setManual("");
  };

  const goResults = async () => {
    if (!sid) return;

    // Save confirmed ingredients to session doc
    await saveConfirmedIngredients(sid, selected);

    // Pass to results page using query param
    const payload = encodeURIComponent(
      JSON.stringify({ ingredients: selected }),
    );
    router.push(`/results?data=${payload}`);
  };

  if (!sid) {
    return (
      <div className="min-h-dvh bg-neutral-50">
        <Container>
          <TopBar backHref="/scan" title="Confirm" />
          <Card>
            <CardHeader
              title="Missing session id"
              subtitle="Open this page from /scan first."
            />
            <CardBody>
              <Button onClick={() => router.push("/scan")}>Go to scan</Button>
            </CardBody>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Container>
        <TopBar backHref={`/scan?sid=${sid}`} title="Confirm" />

        <Card>
          <CardHeader
            title="Confirm ingredients"
            subtitle={
              loading
                ? "Loading session..."
                : `Merged from ${photos.length} photo${photos.length === 1 ? "" : "s"}`
            }
          />
          <CardBody>
            {loading ? (
              <div className="rounded-2xl bg-black/5 p-4 text-sm text-black/60">
                Loading photos and merging ingredients…
              </div>
            ) : merged.length === 0 ? (
              <div className="rounded-2xl bg-black/5 p-4 text-sm text-black/60">
                No detected ingredients yet. Add photos in the scan page.
              </div>
            ) : (
              <div className="space-y-2">
                {merged.map((m) => (
                  <MergedIngredientRow
                    key={m.name}
                    name={m.name}
                    confidenceMax={m.confidenceMax}
                    sources={m.sources.map((s) => ({
                      locationTag: s.locationTag,
                    }))}
                    checked={!!checked[m.name]}
                    onToggle={(next) =>
                      setChecked((prev) => ({ ...prev, [m.name]: next }))
                    }
                  />
                ))}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-black/5 p-3">
              <div className="text-sm font-semibold">Add more</div>
              <div className="mt-2 flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="Add ingredient (e.g., rice, chicken)..."
                  className="w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-black/10 focus:outline-none focus:ring-black/30"
                />
                <Button onClick={addManual} type="button">
                  Add
                </Button>
              </div>

              {manualList.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {manualList.map((m) => (
                    <button
                      key={m}
                      onClick={() =>
                        setManualList((prev) => prev.filter((x) => x !== m))
                      }
                      className="group"
                      title="Remove"
                      type="button"
                    >
                      <Chip>
                        {m}{" "}
                        <span className="ml-1 text-black/40 group-hover:text-black/70">
                          ×
                        </span>
                      </Chip>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-black/10">
              <div>
                <div className="text-sm font-semibold">
                  Include pantry staples
                </div>
                <div className="text-xs text-black/60">Salt, pepper, oil</div>
              </div>
              <button
                onClick={() => setPantryOn((v) => !v)}
                className={`h-8 w-14 rounded-full p-1 transition ${pantryOn ? "bg-black" : "bg-black/20"}`}
                aria-label="Toggle pantry staples"
                type="button"
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    pantryOn ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 text-xs text-black/50">
              Selected:{" "}
              <span className="font-semibold text-black/70">
                {selected.length}
              </span>{" "}
              ingredients
            </div>
          </CardBody>
        </Card>

        <BottomBar>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => router.push(`/scan?sid=${sid}`)}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={goResults}
              disabled={selected.length === 0}
            >
              Find meals
            </Button>
          </div>
        </BottomBar>
      </Container>
    </div>
  );
}
