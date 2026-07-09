import { doc, getDoc } from 'firebase/firestore';

import { db } from './config';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid username or password.');
    this.name = 'InvalidCredentialsError';
  }
}

interface StudentAuthDoc {
  password: string;
}

interface AdminAuthDoc {
  password: string;
}

function normalize(id: string): string {
  return id.trim().toLowerCase();
}

/** Firestore-only credential check (no Firebase Auth): the student doc is
 * keyed by username so this is a single `get`, never a `list` — the
 * Firestore rules block listing the students collection outright, which
 * keeps a client from being able to dump every username/password/token in
 * one query. It still can't hide the matched doc's own fields from the
 * client doing the lookup, since the comparison happens client-side. */
export async function signInStudent(username: string, password: string): Promise<{ id: string }> {
  const id = normalize(username);
  const snap = await getDoc(doc(db, 'students', id));
  if (!snap.exists()) throw new InvalidCredentialsError();
  const data = snap.data() as StudentAuthDoc;
  if (data.password !== password) throw new InvalidCredentialsError();
  return { id };
}

export async function signInAdmin(username: string, password: string): Promise<{ id: string }> {
  const id = normalize(username);
  const snap = await getDoc(doc(db, 'admins', id));
  if (!snap.exists()) throw new InvalidCredentialsError();
  const data = snap.data() as AdminAuthDoc;
  if (data.password !== password) throw new InvalidCredentialsError();
  return { id };
}
