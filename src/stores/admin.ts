import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import { getStudentProfilesByIds, subscribeAllResults } from '@/firebase/adminData';
import type { ResultDoc, StudentProfile, TestStatus } from '@/types';

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

export interface AdminRow {
  studentId: string;
  name: string;
  class: string;
  session: StudentProfile['session'];
  isTestAccount: boolean;
  status: TestStatus;
  score: number | null;
  violationCount: number;
  flaggedForCheating: boolean;
  currentQuestionIndex: number;
  durationTakenMs: number | null;
}

export const useAdminStore = defineStore('admin', () => {
  const students = ref<Record<string, StudentProfile>>({});
  const results = ref<Record<string, ResultDoc>>({});

  let resultsUnsub: (() => void) | null = null;
  let stopProfileWatch: (() => void) | null = null;

  function init(): void {
    teardown();
    resultsUnsub = subscribeAllResults((r) => {
      results.value = r;
    });
    // `results` is listable (drives the roster); `students` is get-only (no
    // bulk dump of usernames/passwords/tokens), so profiles are fetched one
    // id at a time, only for ids we haven't already resolved.
    stopProfileWatch = watch(
      results,
      async (r) => {
        const missingIds = Object.keys(r).filter((id) => !(id in students.value));
        if (missingIds.length === 0) return;
        const fetched = await getStudentProfilesByIds(missingIds);
        students.value = { ...students.value, ...fetched };
      },
      { immediate: true },
    );
  }

  function teardown(): void {
    resultsUnsub?.();
    stopProfileWatch?.();
    resultsUnsub = null;
    stopProfileWatch = null;
    students.value = {};
    results.value = {};
  }

  const rows = computed<AdminRow[]>(() => {
    return Object.keys(results.value)
      .filter((id) => id in students.value)
      .map((id): AdminRow => {
        const student = students.value[id]!;
        const result = results.value[id] ?? DEFAULT_RESULT;
        const durationTakenMs =
          result.startedAt !== null && result.completedAt !== null
            ? result.completedAt - result.startedAt
            : null;
        return {
          studentId: id,
          name: student.name,
          class: student.class,
          session: student.session,
          isTestAccount: student.isTestAccount,
          status: result.status,
          score: result.score,
          violationCount: result.violationCount,
          flaggedForCheating: result.flaggedForCheating,
          currentQuestionIndex: result.currentQuestionIndex,
          durationTakenMs,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  return { students, results, rows, init, teardown };
});
