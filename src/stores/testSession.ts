import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import { TOTAL_QUESTIONS } from '@/constants';
import { getTestConfig } from '@/firebase/settings';
import {
  ensureResultDoc,
  recordViolation as fbRecordViolation,
  saveAnswer as fbSaveAnswer,
  startTestSession,
  submitTest as fbSubmitTest,
  subscribeAnswers,
  subscribeResultDoc,
  updateCurrentQuestionIndex,
} from '@/firebase/results';
import { generateOptionOrder } from '@/lib/optionShuffle';
import { computeScore } from '@/lib/scoring';
import type { AnswerLetter, ResultDoc, TestStatus, ViolationType } from '@/types';

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

export const useTestSessionStore = defineStore('testSession', () => {
  const uid = ref<string | null>(null);
  const result = ref<ResultDoc>({ ...DEFAULT_RESULT });
  const answers = ref<Record<number, AnswerLetter>>({});
  const nowTick = ref(Date.now());

  let resultUnsub: (() => void) | null = null;
  let answersUnsub: (() => void) | null = null;
  let tickInterval: ReturnType<typeof setInterval> | null = null;

  const status = computed<TestStatus>(() => result.value.status);

  const remainingMs = computed<number | null>(() => {
    const { testStartTimestamp, durationMinutes } = result.value;
    if (testStartTimestamp === null || durationMinutes === null) return null;
    const totalMs = durationMinutes * 60_000;
    const elapsed = nowTick.value - testStartTimestamp;
    return Math.max(0, totalMs - elapsed);
  });

  const remainingSeconds = computed(() =>
    remainingMs.value === null ? null : Math.ceil(remainingMs.value / 1000),
  );

  const isExpired = computed(
    () => status.value === 'in_progress' && remainingMs.value !== null && remainingMs.value <= 0,
  );

  const answeredCount = computed(() => Object.keys(answers.value).length);
  const isLocked = computed(() => status.value === 'completed');

  function startTicking() {
    if (tickInterval !== null) return;
    tickInterval = setInterval(() => {
      nowTick.value = Date.now();
    }, 1000);
  }

  function stopTicking() {
    if (tickInterval !== null) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }

  watch(status, (s) => {
    if (s === 'in_progress') startTicking();
    else stopTicking();
  });

  let autoSubmitting = false;
  watch(isExpired, async (expired) => {
    if (expired && !autoSubmitting) {
      autoSubmitting = true;
      await submit();
    }
  });

  async function init(studentUid: string): Promise<void> {
    teardown();
    uid.value = studentUid;
    await ensureResultDoc(studentUid);
    resultUnsub = subscribeResultDoc(studentUid, (r) => {
      result.value = r;
    });
    answersUnsub = subscribeAnswers(studentUid, (a) => {
      answers.value = a;
    });
  }

  function teardown(): void {
    resultUnsub?.();
    answersUnsub?.();
    resultUnsub = null;
    answersUnsub = null;
    stopTicking();
    autoSubmitting = false;
    uid.value = null;
    result.value = { ...DEFAULT_RESULT };
    answers.value = {};
  }

  async function beginTest(): Promise<void> {
    if (!uid.value) return;
    const config = await getTestConfig();
    const questionNumbers = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1);
    const optionOrder = generateOptionOrder(questionNumbers);
    await startTestSession(uid.value, config.durationMinutes, optionOrder);
  }

  async function selectAnswer(questionNumber: number, letter: AnswerLetter): Promise<void> {
    if (!uid.value || isLocked.value) return;
    answers.value = { ...answers.value, [questionNumber]: letter };
    try {
      await fbSaveAnswer(uid.value, questionNumber, letter);
    } catch {
      // Offline persistence queues this write automatically; local state above
      // already reflects the answer so the student sees no interruption.
    }
  }

  async function goToQuestion(index: number): Promise<void> {
    if (!uid.value || isLocked.value) return;
    result.value = { ...result.value, currentQuestionIndex: index };
    try {
      await updateCurrentQuestionIndex(uid.value, index);
    } catch {
      // queued offline, same as selectAnswer
    }
  }

  async function submit(): Promise<void> {
    if (!uid.value || isLocked.value) return;
    const score = computeScore(answers.value);
    await fbSubmitTest(uid.value, score);
  }

  async function recordViolation(type: ViolationType): Promise<{ violationCount: number; locked: boolean }> {
    if (!uid.value || isLocked.value) return { violationCount: result.value.violationCount, locked: true };
    return fbRecordViolation(uid.value, type, () => computeScore(answers.value));
  }

  return {
    uid,
    result,
    answers,
    status,
    remainingSeconds,
    isExpired,
    answeredCount,
    isLocked,
    init,
    teardown,
    beginTest,
    selectAnswer,
    goToQuestion,
    submit,
    recordViolation,
  };
});
