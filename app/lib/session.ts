import { db, storage } from "@/lib/firebase/client";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { DetectedIngredient } from "@/lib/types";
import { normalizeList } from "@/lib/recommend";

export type PhotoLocationTag =
  | "fridge"
  | "pantry"
  | "counter"
  | "freezer"
  | "other";

export type SessionPhoto = {
  id: string;
  imageUrl: string;
  locationTag: PhotoLocationTag;
  detectedIngredients: DetectedIngredient[];
  createdAt?: any;
};

export type ScanSession = {
  id: string;
  status: "collecting" | "confirmed";
  createdAt?: any;
  confirmedIngredients?: string[];
};

export async function createScanSession(): Promise<string> {
  const colRef = collection(db, "scanSessions");
  const docRef = await addDoc(colRef, {
    status: "collecting",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function uploadSessionPhoto(
  sessionId: string,
  file: File,
  locationTag: PhotoLocationTag,
  detectedIngredients: DetectedIngredient[],
): Promise<string> {
  // 1) Create photo doc first (to get photoId)
  const photosCol = collection(db, "scanSessions", sessionId, "photos");
  const photoRef = await addDoc(photosCol, {
    imageUrl: "",
    locationTag,
    detectedIngredients,
    createdAt: serverTimestamp(),
  });

  const photoId = photoRef.id;

  // 2) Upload file to Storage
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const storageRef = ref(
    storage,
    `scanSessions/${sessionId}/${photoId}.${ext}`,
  );
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  // 3) Update photo doc with image URL
  await updateDoc(doc(db, "scanSessions", sessionId, "photos", photoId), {
    imageUrl,
  });

  return photoId;
}

export async function listSessionPhotos(
  sessionId: string,
): Promise<SessionPhoto[]> {
  const photosCol = collection(db, "scanSessions", sessionId, "photos");
  const q = query(photosCol, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      imageUrl: data.imageUrl ?? "",
      locationTag: data.locationTag ?? "other",
      detectedIngredients: (data.detectedIngredients ??
        []) as DetectedIngredient[],
      createdAt: data.createdAt,
    } satisfies SessionPhoto;
  });
}

export function mergeDetectedIngredients(photos: SessionPhoto[]) {
  // Merge by normalized ingredient name
  const map = new Map<
    string,
    {
      name: string;
      confidenceMax: number;
      sources: {
        photoId: string;
        locationTag: PhotoLocationTag;
        confidence: number;
      }[];
    }
  >();

  for (const p of photos) {
    for (const ing of p.detectedIngredients ?? []) {
      const key = normalizeList([ing.name])[0] || ing.name.toLowerCase();
      const conf = ing.confidence ?? 0;

      if (!map.has(key)) {
        map.set(key, {
          name: key,
          confidenceMax: conf,
          sources: [
            { photoId: p.id, locationTag: p.locationTag, confidence: conf },
          ],
        });
      } else {
        const cur = map.get(key)!;
        cur.confidenceMax = Math.max(cur.confidenceMax, conf);
        cur.sources.push({
          photoId: p.id,
          locationTag: p.locationTag,
          confidence: conf,
        });
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.confidenceMax - a.confidenceMax,
  );
}

export async function saveConfirmedIngredients(
  sessionId: string,
  confirmed: string[],
) {
  const sessionDoc = doc(db, "scanSessions", sessionId);
  const normalized = Array.from(new Set(normalizeList(confirmed)));

  // if session doc doesn't exist yet, set it
  const exists = await getDoc(sessionDoc);
  if (!exists.exists()) {
    await setDoc(sessionDoc, {
      status: "confirmed",
      createdAt: serverTimestamp(),
      confirmedIngredients: normalized,
    });
  } else {
    await updateDoc(sessionDoc, {
      status: "confirmed",
      confirmedIngredients: normalized,
    });
  }
}

export function makeMockDetectedForPhoto(): DetectedIngredient[] {
  // Simple mock generator — replace later with real vision output
  const pool = [
    "egg",
    "milk",
    "spinach",
    "onion",
    "garlic",
    "tomato",
    "rice",
    "pasta",
    "cheese",
    "chicken",
    "butter",
    "yogurt",
    "carrot",
    "bell pepper",
  ];

  const pickCount = 5 + Math.floor(Math.random() * 5); // 5–9
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, pickCount);

  return shuffled.map((name) => ({
    name,
    confidence: 0.6 + Math.random() * 0.35, // 0.60–0.95
  }));
}
