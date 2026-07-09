import { doc, getDoc } from 'firebase/firestore';

import type { StudentProfile } from '@/types';

import { db } from './config';

interface StudentDocData {
  name: string;
  class: string;
  session: 'Session 1' | 'Session 2';
  username: string;
  personalToken: string;
  isTestAccount: boolean;
}

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  const snap = await getDoc(doc(db, 'students', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as StudentDocData;
  return {
    studentId: uid,
    name: data.name,
    class: data.class,
    session: data.session,
    username: data.username,
    isTestAccount: data.isTestAccount,
  };
}

/** Reads the student's own stored token and compares — never generated on the fly. */
export async function verifyPersonalToken(uid: string, candidate: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'students', uid));
  if (!snap.exists()) return false;
  const data = snap.data() as StudentDocData;
  return data.personalToken.trim().toUpperCase() === candidate.trim().toUpperCase();
}
