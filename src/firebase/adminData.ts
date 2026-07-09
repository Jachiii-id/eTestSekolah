import { type Unsubscribe, collection, onSnapshot } from 'firebase/firestore';

import type { ResultDoc, StudentProfile } from '@/types';

import { db } from './config';

interface StudentDocData {
  name: string;
  class: string;
  session: 'Session 1' | 'Session 2';
  username: string;
  isTestAccount: boolean;
}

export function subscribeAllStudents(
  callback: (students: Record<string, StudentProfile>) => void,
): Unsubscribe {
  return onSnapshot(collection(db, 'students'), (snap) => {
    const students: Record<string, StudentProfile> = {};
    snap.forEach((d) => {
      const data = d.data() as StudentDocData;
      students[d.id] = { studentId: d.id, ...data };
    });
    callback(students);
  });
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
