import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { subscribeAllResults, subscribeAllStudents } from '@/firebase/adminData';
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

  let studentsUnsub: (() => void) | null = null;
  let resultsUnsub: (() => void) | null = null;

  function init(): void {
    teardown();
    studentsUnsub = subscribeAllStudents((s) => {
      students.value = s;
    });
    resultsUnsub = subscribeAllResults((r) => {
      results.value = r;
    });
  }

  function teardown(): void {
    studentsUnsub?.();
    resultsUnsub?.();
    studentsUnsub = null;
    resultsUnsub = null;
  }

  const rows = computed<AdminRow[]>(() => {
    return Object.keys(students.value)
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
