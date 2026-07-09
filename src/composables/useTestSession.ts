import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted } from 'vue';

import { QUESTIONS } from '@/data/questions';
import { useAuthStore } from '@/stores/auth';
import { useTestSessionStore } from '@/stores/testSession';
import type { AnswerLetter } from '@/types';

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(clamped % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

/** Owns the subscribe-on-mount / unsubscribe-on-unmount lifecycle around the test session store — the single place a view needs to touch to drive the test screen. */
export function useTestSession() {
  const auth = useAuthStore();
  const store = useTestSessionStore();
  const { result, answers, status, remainingSeconds, isExpired, answeredCount, isLocked } =
    storeToRefs(store);

  onMounted(async () => {
    if (auth.id) {
      await store.init(auth.id);
    }
  });

  onUnmounted(() => {
    store.teardown();
  });

  const totalQuestions = QUESTIONS.length;
  const DEFAULT_ORDER: AnswerLetter[] = ['A', 'B', 'C', 'D'];

  const currentIndex = computed(() => result.value.currentQuestionIndex);
  const currentQuestion = computed(() => QUESTIONS[currentIndex.value] ?? QUESTIONS[0]!);
  const currentAnswer = computed<AnswerLetter | undefined>(
    () => answers.value[currentQuestion.value.number],
  );

  /** Display order for the current question's options, locked in for this
   * student at test-start (see optionOrder on the result doc). Each entry's
   * `position` is the on-screen A/B/C/D label; `originalLetter` is the real
   * identity used for saving/scoring, so a shuffled UI never changes what
   * gets recorded. */
  const currentOptions = computed(() => {
    const order =
      result.value.optionOrder?.[currentQuestion.value.number] ?? DEFAULT_ORDER;
    return DEFAULT_ORDER.map((position, i) => {
      const originalLetter = order[i] ?? position;
      return {
        position,
        originalLetter,
        text: currentQuestion.value.options[originalLetter],
      };
    });
  });

  const timeRemainingLabel = computed(() =>
    remainingSeconds.value === null ? '--:--' : formatClock(remainingSeconds.value),
  );
  const timeIsCritical = computed(
    () => remainingSeconds.value !== null && remainingSeconds.value <= 300,
  );

  const progressPercent = computed(() => Math.round((answeredCount.value / totalQuestions) * 100));

  function selectAnswer(letter: AnswerLetter) {
    return store.selectAnswer(currentQuestion.value.number, letter);
  }

  function goToIndex(index: number) {
    const clamped = Math.min(Math.max(index, 0), totalQuestions - 1);
    return store.goToQuestion(clamped);
  }

  function next() {
    return goToIndex(currentIndex.value + 1);
  }

  function previous() {
    return goToIndex(currentIndex.value - 1);
  }

  function isAnswered(questionNumber: number) {
    return answers.value[questionNumber] !== undefined;
  }

  return {
    questions: QUESTIONS,
    totalQuestions,
    status,
    isLocked,
    isExpired,
    result,
    answers,
    currentIndex,
    currentQuestion,
    currentAnswer,
    currentOptions,
    answeredCount,
    progressPercent,
    timeRemainingLabel,
    timeIsCritical,
    selectAnswer,
    goToIndex,
    next,
    previous,
    isAnswered,
    submit: store.submit,
  };
}
