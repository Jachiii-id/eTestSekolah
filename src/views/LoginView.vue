<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { InvalidCredentialsError } from '@/firebase/auth';
import { getResultDocOnce } from '@/firebase/results';
import { useAuthStore } from '@/stores/auth';
import type { TestStatus } from '@/types';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const submitting = ref(false);

function resolveRoute(status: TestStatus): string {
  if (status === 'completed') return 'completed';
  if (status === 'in_progress') return 'test';
  return 'identity-confirm';
}

async function handleSubmit() {
  errorMessage.value = '';
  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Enter your username and password.';
    return;
  }
  submitting.value = true;
  try {
    await auth.loginStudent(username.value, password.value);
    if (auth.isAdmin) {
      await router.push({ name: 'admin-dashboard' });
      return;
    }
    const result = await getResultDocOnce(auth.user!.uid);
    await router.push({ name: resolveRoute(result.status) });
  } catch (err) {
    errorMessage.value =
      err instanceof InvalidCredentialsError
        ? 'Incorrect username or password. Check with your teacher if you need help.'
        : 'Something went wrong. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-primary-light/60 px-4 py-10">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10">
      <div class="mb-6 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white"
        >
          e
        </div>
        <h1 class="text-lg font-bold text-slate-900">eTest SMP Labschool UNESA 3</h1>
        <p class="mt-1 text-sm text-slate-500">English Placement Test — sign in to begin</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="username" class="mb-1 block text-sm font-medium text-slate-700">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. auliasalim"
          />
        </div>
        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••••••"
          />
        </div>

        <p v-if="errorMessage" class="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">
          {{ errorMessage }}
        </p>

        <AppButton type="submit" full-width :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </AppButton>
      </form>

      <p class="mt-6 text-center text-xs text-slate-400">
        Admin?
        <router-link :to="{ name: 'admin-login' }" class="font-medium text-primary-dark hover:underline">
          Go to admin login
        </router-link>
      </p>
    </div>
  </main>
</template>
