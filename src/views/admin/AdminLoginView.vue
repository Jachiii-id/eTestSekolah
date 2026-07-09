<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const submitting = ref(false);

async function handleSubmit() {
  errorMessage.value = '';
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Enter your admin email and password.';
    return;
  }
  submitting.value = true;
  try {
    await auth.loginAdmin(email.value, password.value);
    await router.push({ name: 'admin-dashboard' });
  } catch {
    errorMessage.value = 'Incorrect credentials, or this account does not have admin access.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
      <div class="mb-6 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-dark text-lg font-bold text-white"
        >
          A
        </div>
        <h1 class="text-lg font-bold text-slate-900">Admin Panel</h1>
        <p class="mt-1 text-sm text-slate-500">eTest SMP Labschool UNESA 3</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="username"
            class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
        <router-link :to="{ name: 'login' }" class="hover:underline">Back to student login</router-link>
      </p>
    </div>
  </main>
</template>
