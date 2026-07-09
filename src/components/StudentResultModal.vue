<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import AppButton from '@/components/AppButton.vue';
import { QUESTIONS } from '@/data/questions';
import { subscribeAnswers } from '@/firebase/results';
import { exportStudentDetailToPdf } from '@/lib/exportStudentPdf';
import type { AnswerLetter } from '@/types';

const props = defineProps<{ studentId: string; name: string }>();
const emit = defineEmits<{ close: [] }>();

const answers = ref<Record<number, AnswerLetter>>({});
let unsub: (() => void) | null = null;

onMounted(() => {
  unsub = subscribeAnswers(props.studentId, (a) => {
    answers.value = a;
  });
});
onUnmounted(() => {
  unsub?.();
});

const rows = computed(() =>
  QUESTIONS.map((q) => {
    const studentLetter = answers.value[q.number];
    const isCorrect = studentLetter === undefined ? null : studentLetter === q.correctAnswer;
    return {
      number: q.number,
      text: q.text,
      studentAnswerText: studentLetter ? q.options[studentLetter] : '—',
      correctText: q.options[q.correctAnswer],
      isCorrect,
    };
  }),
);

const correctCount = computed(() => rows.value.filter((r) => r.isCorrect === true).length);
const wrongCount = computed(() => rows.value.filter((r) => r.isCorrect === false).length);
const unansweredCount = computed(() => rows.value.filter((r) => r.isCorrect === null).length);

function download() {
  exportStudentDetailToPdf(props.name, rows.value);
}
</script>

<template>
  <div class="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 py-8">
    <div class="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900">{{ name }}'s answers</h3>
          <p class="mt-0.5 text-xs text-slate-500">
            <span class="font-semibold text-success">{{ correctCount }} correct</span>
            ·
            <span class="font-semibold text-danger">{{ wrongCount }} incorrect</span>
            ·
            <span class="text-slate-400">{{ unansweredCount }} unanswered</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <AppButton variant="secondary" @click="download">Download PDF</AppButton>
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
            @click="emit('close')"
          >
            &times;
          </button>
        </div>
      </div>

      <div class="overflow-y-auto px-5 py-4">
        <table class="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th class="py-2 pr-3">No</th>
              <th class="py-2 pr-3">Question</th>
              <th class="py-2 pr-3">Answer</th>
              <th class="py-2 pr-3">Correct</th>
              <th class="py-2 pr-3">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.number" class="border-b border-slate-50">
              <td class="py-2 pr-3 align-top tabular-nums text-slate-500">{{ r.number }}</td>
              <td class="py-2 pr-3 align-top text-slate-700">{{ r.text }}</td>
              <td class="py-2 pr-3 align-top text-slate-700">{{ r.studentAnswerText }}</td>
              <td class="py-2 pr-3 align-top text-slate-700">{{ r.correctText }}</td>
              <td class="py-2 pr-3 align-top">
                <span
                  v-if="r.isCorrect === true"
                  class="rounded-full bg-success-tint px-2 py-0.5 text-xs font-semibold text-success"
                >
                  Correct
                </span>
                <span
                  v-else-if="r.isCorrect === false"
                  class="rounded-full bg-danger-tint px-2 py-0.5 text-xs font-semibold text-danger"
                >
                  False
                </span>
                <span v-else class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-400">
                  —
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
