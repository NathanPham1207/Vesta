import { APP_USER_ID } from '@/constants/appUser';
import { getFirestoreDb } from '@/services/firestore/client';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { RankTier } from '@/utils/rankings/rankUtils';

export interface UserRank {
  points: number;
  tier: RankTier;
  cookedRecipes: string[];
}

function canUseFirestore(): boolean {
  try {
    getFirestoreDb();
    return true;
  } catch {
    return false;
  }
}

function rankDocRef() {
  const db = getFirestoreDb();
  return doc(db, 'users', APP_USER_ID, 'profile', 'rank');
}

export function subscribeUserRank(
  callback: (rank: UserRank | null) => void,
): () => void {
  if (!canUseFirestore()) {
    callback(null);
    return () => {};
  }

  return onSnapshot(
    rankDocRef(),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data();
      callback({
        points: typeof data.points === 'number' ? data.points : 0,
        tier: typeof data.tier === 'string' ? (data.tier as RankTier) : 'Novice',
        cookedRecipes: Array.isArray(data.cookedRecipes) ? data.cookedRecipes : [],
      });
    },
    (err) => {
      console.error('subscribeUserRank error', err);
      callback(null);
    },
  );
}

export async function saveUserRank(rank: UserRank): Promise<void> {
  if (!canUseFirestore()) return;
  await setDoc(rankDocRef(), rank, { merge: true });
}
