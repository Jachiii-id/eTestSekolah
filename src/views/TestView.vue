<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { MAX_VIOLATIONS } from '@/constants';
import { useProctoring } from '@/composables/useProctoring';
import { useTestSession } from '@/composables/useTestSession';
import type { AnswerLetter } from '@/types';

const router = useRouter();
const {
  questions,
  totalQuestions,
  status,
  result,
  currentIndex,
  currentQuestion,
  currentAnswer,
  answeredCount,
  progressPercent,
  timeRemainingLabel,
  timeIsCritical,
  selectAnswer,
  goToIndex,
  next,
  previous,
  isAnswered,
  submit,
} = useTestSession();

useProctoring();

const showSubmitConfirm = ref(false);
const submitting = ref(false);

watch(
  status,
  (s) => {
    if (s === 'completed') {
      router.push({ name: 'completed' });
    }
  },
  { immediate: true },
);

const letters: AnswerLetter[] = ['A', 'B', 'C', 'D'];

async function confirmSubmit() {
  submitting.value = true;
  try {
    await submit();
  } finally {
    submitting.value = false;
    showSubmitConfirm.value = false;
  }
}
</script>

<template>
  <main class="min-h-screen bg-primary-light/40 pb-28">
    <header class="sticky top-0 z-10 border-b border-primary/10 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div>
          <p class="text-xs font-medium text-slate-400">Question {{ currentIndex + 1 }} / {{ totalQuestions }}</p>
          <div class="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-primary/10 sm:w-48">
            <div class="h-full rounded-full bg-primary transition-all" :style="{ width: progressPercent + '%' }" />
          </div>
        </div>
        <div
          class="rounded-lg px-3 py-1.5 font-mono text-base font-bold tabular-nums"
          :class="timeIsCritical ? 'bg-danger-tint text-danger' : 'bg-primary-light text-primary-dark'"
        >
          {{ timeRemainingLabel }}
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-3xl px-4 py-6">
      <article class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Question {{ currentQuestion.number }}
        </p>
        <h2 class="mt-2 text-base font-semibold text-slate-900 sm:text-lg">{{ currentQuestion.text }}</h2>

        <div class="mt-5 space-y-2.5">
          <button
            v-for="letter in letters"
            :key="letter"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors"
            :class="
              currentAnswer === letter
                ? 'border-primary bg-primary-light text-primary-dark'
                : 'border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary-light/50'
            "
            @click="selectAnswer(letter)"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
              :class="currentAnswer === letter ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-500'"
            >
              {{ letter }}
            </span>
            <span>{{ currentQuestion.options[letter] }}</span>
          </button>
        </div>
      </article>

      <nav class="mt-5 grid grid-cols-8 gap-1.5 sm:grid-cols-10">
        <button
          v-for="q in questions"
          :key="q.number"
          type="button"
          class="aspect-square rounded-md text-xs font-semibold transition-colors"
          :class="[
            q.number - 1 === currentIndex
              ? 'bg-primary text-white'
              : isAnswered(q.number)
                ? 'bg-primary-light text-primary-dark'
                : 'bg-white text-slate-400 ring-1 ring-slate-200',
          ]"
          @click="goToIndex(q.number - 1)"
        >
          {{ q.number }}
        </button>
      </nav>

      <p class="mt-3 text-center text-xs text-slate-400">{{ answeredCount }} / {{ totalQuestions }} answered</p>
    </div>

    <footer class="fixed inset-x-0 bottom-0 z-10 border-t border-primary/10 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <AppButton variant="secondary" :disabled="currentIndex === 0" @click="previous">Previous</AppButton>
        <AppButton v-if="currentIndex < totalQuestions - 1" @click="next">Next</AppButton>
        <AppButton v-else variant="primary" @click="showSubmitConfirm = true">Submit Test</AppButton>
      </div>
    </footer>

    <div
      v-if="showSubmitConfirm"
      class="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 px-4"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h3 class="text-base font-bold text-slate-900">Submit your test?</h3>
        <p class="mt-1.5 text-sm text-slate-500">
          You've answered {{ answeredCount }} of {{ totalQuestions }} questions. You can't change answers after
          submitting.
        </p>
        <div class="mt-5 flex gap-2">
          <AppButton variant="secondary" full-width :disabled="submitting" @click="showSubmitConfirm = false">
            Keep working
          </AppButton>
          <AppButton full-width :disabled="submitting" @click="confirmSubmit">
            {{ submitting ? 'Submitting…' : 'Submit' }}
          </AppButton>
        </div>
      </div>
    </div>

    <p v-if="result.violationCount > 0" class="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs font-medium text-warning">
      {{ result.violationCount }}/{{ MAX_VIOLATIONS }} warnings recorded
    </p>
  </main>
</template>
