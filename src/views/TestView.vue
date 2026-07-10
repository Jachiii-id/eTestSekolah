<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { MAX_VIOLATIONS } from '@/constants';
import { useProctoring } from '@/composables/useProctoring';
import { useTestSession } from '@/composables/useTestSession';

const router = useRouter();
const {
  questions,
  totalQuestions,
  status,
  result,
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

async function confirmSubmit() {
  submitting.value = true;
  try {
    await submit();
  } finally {
    submitting.value = false;
    showSubmitConfirm.value = false;
  }
}

// Question navigation lives behind a hamburger drawer so the test itself
// stays a full, uncluttered single column — nothing but the question.
const navOpen = ref(false);
const jumpInput = ref<HTMLInputElement | null>(null);
const jumpToValue = ref('');
const jumpError = ref(false);

function openNav() {
  navOpen.value = true;
  nextTick(() => jumpInput.value?.focus());
}

function closeNav() {
  navOpen.value = false;
  jumpError.value = false;
  jumpToValue.value = '';
}

function jumpToQuestion() {
  const n = Number(jumpToValue.value);
  if (!Number.isInteger(n) || n < 1 || n > totalQuestions) {
    jumpError.value = true;
    return;
  }
  goToIndex(n - 1);
  closeNav();
}

function jumpToGrid(index: number) {
  goToIndex(index);
  closeNav();
}
</script>

<template>
  <main class="min-h-screen bg-primary-light/40 pb-10">
    <header class="sticky top-0 z-10 border-b border-primary/10 bg-white/95 backdrop-blur">
      <div class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-primary-light hover:text-primary-dark"
            aria-label="Open question navigation"
            @click="openNav"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <p class="text-xs font-medium text-slate-400">Question {{ currentIndex + 1 }} / {{ totalQuestions }}</p>
            <div class="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-primary/10 sm:w-48">
              <div class="h-full rounded-full bg-primary transition-all" :style="{ width: progressPercent + '%' }" />
            </div>
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

    <div class="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <article class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10 sm:p-8">
        <div v-if="currentQuestion.passage" class="mb-5 rounded-xl bg-primary-light/50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary-dark">Reading passage</p>
          <p class="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{{ currentQuestion.passage }}</p>
        </div>

        <p class="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Question {{ currentQuestion.number }}
        </p>
        <h2 class="mt-2 text-base font-semibold text-slate-900 sm:text-lg">{{ currentQuestion.text }}</h2>

        <div class="mt-6 space-y-2.5">
          <button
            v-for="opt in currentOptions"
            :key="opt.position"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors"
            :class="
              currentAnswer === opt.originalLetter
                ? 'border-primary bg-primary-light text-primary-dark'
                : 'border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary-light/50'
            "
            @click="selectAnswer(opt.originalLetter)"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
              :class="currentAnswer === opt.originalLetter ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-500'"
            >
              {{ opt.position }}
            </span>
            <span>{{ opt.text }}</span>
          </button>
        </div>
      </article>

      <div class="mt-5 flex items-center justify-between gap-3">
        <AppButton variant="secondary" :disabled="currentIndex === 0" @click="previous">Previous</AppButton>
        <AppButton v-if="currentIndex < totalQuestions - 1" @click="next">Next</AppButton>
        <AppButton v-else variant="primary" @click="showSubmitConfirm = true">Submit Test</AppButton>
      </div>

      <p v-if="result.violationCount > 0" class="mt-3 text-center text-xs font-medium text-warning">
        {{ result.violationCount }}/{{ MAX_VIOLATIONS }} warnings recorded
      </p>
    </div>

    <!-- Question navigation drawer -->
    <Transition name="fade">
      <div v-if="navOpen" class="fixed inset-0 z-30 bg-slate-900/50" @click="closeNav" />
    </Transition>
    <Transition name="slide">
      <aside
        v-if="navOpen"
        class="fixed inset-y-0 left-0 z-40 flex w-[85vw] max-w-sm flex-col bg-white shadow-xl sm:w-80"
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
          <h3 class="text-sm font-bold text-slate-900">Question navigation</h3>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
            @click="closeNav"
          >
            &times;
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Jump to question</p>
          <form class="mt-2 flex gap-2" @submit.prevent="jumpToQuestion">
            <input
              ref="jumpInput"
              v-model="jumpToValue"
              type="number"
              min="1"
              :max="totalQuestions"
              placeholder="#"
              class="w-20 rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="jumpError ? 'border-danger' : ''"
            />
            <AppButton type="submit" variant="secondary">Go</AppButton>
          </form>
          <p v-if="jumpError" class="mt-1.5 text-xs text-danger">Enter a number between 1 and {{ totalQuestions }}.</p>

          <p class="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">All questions</p>
          <nav class="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-7">
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
              @click="jumpToGrid(q.number - 1)"
            >
              {{ q.number }}
            </button>
          </nav>

          <p class="mt-3 text-center text-xs text-slate-400">{{ answeredCount }} / {{ totalQuestions }} answered</p>
        </div>
      </aside>
    </Transition>

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
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
