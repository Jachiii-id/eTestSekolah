import { doc, getDoc } from 'firebase/firestore';

import { db } from './config';

/** Used to re-validate a locally-persisted admin session on page load. */
export async function checkAdminExists(id: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'admins', id));
  return snap.exists();
}
