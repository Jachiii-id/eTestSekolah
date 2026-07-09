<script setup lang="ts">
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

function confirm() {
  auth.confirmIdentity();
  router.push({ name: 'token-gate' });
}

function notMe() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-primary-light/60 px-4 py-10">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-primary/10">
      <p class="text-xs font-semibold uppercase tracking-wide text-primary-dark">Step 1 of 2</p>
      <h1 class="mt-2 text-lg font-bold text-slate-900">Is this you?</h1>
      <p class="mt-1 text-sm text-slate-500">Confirm your details before starting the test.</p>

      <dl class="mt-6 space-y-3 rounded-xl bg-primary-light/70 p-4 text-left">
        <div>
          <dt class="text-xs font-medium uppercase tracking-wide text-primary-dark/70">Name</dt>
          <dd class="text-sm font-semibold text-slate-900">{{ auth.studentProfile?.name }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase tracking-wide text-primary-dark/70">Class</dt>
          <dd class="text-sm font-semibold text-slate-900">{{ auth.studentProfile?.class }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase tracking-wide text-primary-dark/70">Session</dt>
          <dd class="text-sm font-semibold text-slate-900">{{ auth.studentProfile?.session }}</dd>
        </div>
      </dl>

      <div class="mt-6 flex flex-col gap-2">
        <AppButton full-width @click="confirm">Confirm &amp; Continue</AppButton>
        <button type="button" class="text-sm font-medium text-slate-400 hover:text-slate-600" @click="notMe">
          This isn't me — sign out
        </button>
      </div>
    </div>
  </main>
</template>
