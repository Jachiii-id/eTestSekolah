import { doc, getDoc } from 'firebase/firestore';

import { db } from './config';

export async function checkIsAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}
