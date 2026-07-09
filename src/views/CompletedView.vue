<script setup lang="ts">
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { useTestSession } from '@/composables/useTestSession';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const { result, totalQuestions } = useTestSession();

async function signOut() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-primary-light/60 px-4 py-10">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-primary/10">
      <template v-if="result.flaggedForCheating">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-tint text-2xl">
          🔒
        </div>
        <h1 class="text-lg font-bold text-danger">Test locked</h1>
        <p class="mt-2 text-sm text-slate-600">
          Your test was locked after repeated warnings for leaving the test window. Your answers up to that point
          were submitted as your final result.
        </p>
      </template>
      <template v-else>
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-tint text-2xl">
          ✓
        </div>
        <h1 class="text-lg font-bold text-slate-900">Test completed</h1>
        <p class="mt-2 text-sm text-slate-600">
          You've already completed this test. Thank you — your results have been recorded.
        </p>
      </template>

      <dl class="mt-6 grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-primary-light/70 p-3">
          <dt class="text-xs font-medium uppercase tracking-wide text-primary-dark/70">Score</dt>
          <dd class="text-xl font-bold text-slate-900">{{ result.score ?? '—' }} / {{ totalQuestions }}</dd>
        </div>
        <div class="rounded-xl bg-primary-light/70 p-3">
          <dt class="text-xs font-medium uppercase tracking-wide text-primary-dark/70">Warnings</dt>
          <dd class="text-xl font-bold text-slate-900">{{ result.violationCount }}</dd>
        </div>
      </dl>

      <AppButton class="mt-6" full-width variant="secondary" @click="signOut">Sign out</AppButton>
    </div>
  </main>
</template>
