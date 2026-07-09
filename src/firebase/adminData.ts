import { type Unsubscribe, collection, onSnapshot } from 'firebase/firestore';

import type { ResultDoc, StudentProfile } from '@/types';

import { db } from './config';
import { getStudentProfile } from './students';

/** `students` only allows `get` (single doc), never `list` — that's what
 * stops a client from dumping every username/password/token in one query.
 * So the admin dashboard can't subscribe to the students collection directly;
 * instead it drives the roster off `results` (which IS listable) and fetches
 * each student's profile individually by the id it already knows. */
export async function getStudentProfilesByIds(
  ids: string[],
): Promise<Record<string, StudentProfile>> {
  const entries = await Promise.all(
    ids.map(async (id) => [id, await getStudentProfile(id)] as const),
  );
  const profiles: Record<string, StudentProfile> = {};
  for (const [id, profile] of entries) {
    if (profile) profiles[id] = profile;
  }
  return profiles;
}

export function subscribeAllResults(
  callback: (results: Record<string, ResultDoc>) => void,
): Unsubscribe {
  return onSnapshot(collection(db, 'results'), (snap) => {
    const results: Record<string, ResultDoc> = {};
    snap.forEach((d) => {
      results[d.id] = d.data() as ResultDoc;
    });
    callback(results);
  });
}
