import {
  type Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { MAX_VIOLATIONS } from '@/constants';
import type { AnswerDoc, AnswerLetter, ResultDoc, ViolationDoc, ViolationType } from '@/types';

import { db } from './config';

const DEFAULT_RESULT: ResultDoc = {
  status: 'not_started',
  currentQuestionIndex: 0,
  startedAt: null,
  completedAt: null,
  score: null,
  testStartTimestamp: null,
  durationMinutes: null,
  violationCount: 0,
  flaggedForCheating: false,
  optionOrder: null,
};

function resultRef(uid: string) {
  return doc(db, 'results', uid);
}

function answersCollection(uid: string) {
  return collection(db, 'results', uid, 'answers');
}

function violationsCollection(uid: string) {
  return collection(db, 'results', uid, 'violations');
}

export async function ensureResultDoc(uid: string): Promise<void> {
  const snap = await getDoc(resultRef(uid));
  if (!snap.exists()) {
    await setDoc(resultRef(uid), DEFAULT_RESULT);
  }
}

/** One-off read used by the router guard to decide where to send a student — cheaper than standing up a full subscription just to route. */
export async function getResultDocOnce(uid: string): Promise<ResultDoc> {
  const snap = await getDoc(resultRef(uid));
  return snap.exists() ? (snap.data() as ResultDoc) : DEFAULT_RESULT;
}

export function subscribeResultDoc(
  uid: string,
  callback: (result: ResultDoc) => void,
): Unsubscribe {
  return onSnapshot(resultRef(uid), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as ResultDoc);
    } else {
      callback(DEFAULT_RESULT);
    }
  });
}

export function subscribeAnswers(
  uid: string,
  callback: (answers: Record<number, AnswerLetter>) => void,
): Unsubscribe {
  return onSnapshot(answersCollection(uid), (snap) => {
    const answers: Record<number, AnswerLetter> = {};
    snap.forEach((d) => {
      const data = d.data() as AnswerDoc;
      answers[Number(d.id)] = data.selectedAnswer;
    });
    callback(answers);
  });
}

export async function saveAnswer(
  uid: string,
  questionNumber: number,
  selectedAnswer: AnswerLetter,
): Promise<void> {
  await setDoc(doc(answersCollection(uid), String(questionNumber)), {
    selectedAnswer,
    savedAt: Date.now(),
  } satisfies AnswerDoc);
}

export async function updateCurrentQuestionIndex(uid: string, index: number): Promise<void> {
  await updateDoc(resultRef(uid), { currentQuestionIndex: index });
}

export async function startTestSession(
  uid: string,
  durationMinutes: number,
  optionOrder: Record<number, AnswerLetter[]>,
): Promise<void> {
  const now = Date.now();
  await updateDoc(resultRef(uid), {
    status: 'in_progress',
    startedAt: now,
    testStartTimestamp: now,
    durationMinutes,
    currentQuestionIndex: 0,
    optionOrder,
  });
}

export async function submitTest(
  uid: string,
  score: number,
): Promise<void> {
  await updateDoc(resultRef(uid), {
    status: 'completed',
    completedAt: Date.now(),
    score,
  });
}

interface RecordViolationResult {
  violationCount: number;
  locked: boolean;
}

/** Increments violationCount, logs the violation, and auto-locks/submits on the Nth strike — all in one transaction so a refresh mid-write can't desync the count. */
export async function recordViolation(
  uid: string,
  type: ViolationType,
  currentScore: () => number,
): Promise<RecordViolationResult> {
  const violationDocRef = doc(violationsCollection(uid));
  const now = Date.now();

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(resultRef(uid));
    const current = (snap.exists() ? snap.data() : DEFAULT_RESULT) as ResultDoc;

    if (current.status === 'completed') {
      return { violationCount: current.violationCount, locked: true };
    }

    const violationCount = current.violationCount + 1;
    const locked = violationCount >= MAX_VIOLATIONS;

    tx.set(violationDocRef, { type, timestamp: now } satisfies ViolationDoc);

    if (locked) {
      tx.update(resultRef(uid), {
        violationCount,
        status: 'completed',
        flaggedForCheating: true,
        completedAt: now,
        score: currentScore(),
      });
    } else {
      tx.update(resultRef(uid), { violationCount });
    }

    return { violationCount, locked };
  });
}

/** Admin-only: wipes a student's answers and resets their result doc back to
 * a clean 'not_started' state, as if they'd never begun — used when a
 * student needs a genuine re-take (e.g. a device crash). Deliberately does
 * NOT delete the violations subcollection: that log is append-only (the
 * Firestore rules refuse update/delete on it) so a prior attempt's cheating
 * evidence survives a reset instead of being erasable by resetting. */
export async function resetResultForAdmin(uid: string): Promise<void> {
  const answerDocs = await getDocs(answersCollection(uid));

  const batch = writeBatch(db);
  answerDocs.forEach((d) => batch.delete(d.ref));
  batch.set(resultRef(uid), DEFAULT_RESULT);
  await batch.commit();
}

export function subscribeViolations(
  uid: string,
  callback: (violations: ViolationDoc[]) => void,
): Unsubscribe {
  return onSnapshot(query(violationsCollection(uid), orderBy('timestamp', 'asc')), (snap) => {
    callback(snap.docs.map((d) => d.data() as ViolationDoc));
  });
}
