import { type Unsubscribe, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

import { DEFAULT_DURATION_MINUTES } from '@/constants';
import type { TestConfig } from '@/types';

import { db } from './config';

function configRef() {
  return doc(db, 'settings', 'testConfig');
}

export async function getTestConfig(): Promise<TestConfig> {
  const snap = await getDoc(configRef());
  if (!snap.exists()) {
    return { durationMinutes: DEFAULT_DURATION_MINUTES, updatedAt: Date.now(), updatedBy: 'default' };
  }
  return snap.data() as TestConfig;
}

export function subscribeTestConfig(callback: (config: TestConfig) => void): Unsubscribe {
  return onSnapshot(configRef(), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as TestConfig);
    } else {
      callback({ durationMinutes: DEFAULT_DURATION_MINUTES, updatedAt: Date.now(), updatedBy: 'default' });
    }
  });
}

/** Only affects sessions that have not started yet — in-progress results already have their own durationMinutes locked in and never read this doc again. */
export async function updateTestConfig(durationMinutes: number, updatedByUid: string): Promise<void> {
  await setDoc(configRef(), {
    durationMinutes,
    updatedAt: Date.now(),
    updatedBy: updatedByUid,
  } satisfies TestConfig);
}
