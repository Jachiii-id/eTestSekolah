<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { verifyPersonalToken } from '@/firebase/students';
import { useAuthStore } from '@/stores/auth';
import { useTestSessionStore } from '@/stores/testSession';

const auth = useAuthStore();
const testSession = useTestSessionStore();
const router = useRouter();

const token = ref('');
const errorMessage = ref('');
const checking = ref(false);

async function handleSubmit() {
  errorMessage.value = '';
  if (!token.value.trim()) {
    errorMessage.value = 'Enter your personal token.';
    return;
  }
  checking.value = true;
  try {
    const uid = auth.user!.uid;
    const valid = await verifyPersonalToken(uid, token.value);
    if (!valid) {
      errorMessage.value = 'That token doesn’t match our records. Check with your teacher.';
      return;
    }
    await testSession.init(uid);
    await testSession.beginTest();
    await router.push({ name: 'test' });
  } catch {
    errorMessage.value = 'Something went wrong verifying your token. Please try again.';
  } finally {
    checking.value = false;
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-primary-light/60 px-4 py-10">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10">
      <p class="text-center text-xs font-semibold uppercase tracking-wide text-primary-dark">Step 2 of 2</p>
      <h1 class="mt-2 text-center text-lg font-bold text-slate-900">Enter your personal token</h1>
      <p class="mt-1 text-center text-sm text-slate-500">
        This was given to you by your teacher. It unlocks the test once — starting the timer.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <input
          v-model="token"
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          class="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-center text-lg font-mono tracking-[0.3em] uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="TOKEN"
          maxlength="12"
        />

        <p v-if="errorMessage" class="rounded-lg bg-danger-tint px-3 py-2 text-center text-sm text-danger">
          {{ errorMessage }}
        </p>

        <AppButton type="submit" full-width :disabled="checking">
          {{ checking ? 'Checking…' : 'Unlock &amp; Start Test' }}
        </AppButton>
      </form>

      <p class="mt-6 text-center text-xs text-slate-400">
        Starting the test begins your timer immediately — make sure you're ready.
      </p>
    </div>
  </main>
</template>
