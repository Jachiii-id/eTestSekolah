<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import ViolationList from '@/components/ViolationList.vue';
import { DEFAULT_DURATION_MINUTES, TOTAL_QUESTIONS } from '@/constants';
import { subscribeTestConfig, updateTestConfig } from '@/firebase/settings';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const admin = useAdminStore();

const activeTab = ref<'results' | 'settings'>('results');
const sessionFilter = ref<'all' | 'Session 1' | 'Session 2'>('all');
const flaggedOnly = ref(false);
const showTestAccount = ref(false);
const search = ref('');
const expandedId = ref<string | null>(null);

onMounted(() => {
  admin.init();
});
onUnmounted(() => {
  admin.teardown();
});

const filteredRows = computed(() =>
  admin.rows.filter((r) => {
    if (!showTestAccount.value && r.isTestAccount) return false;
    if (sessionFilter.value !== 'all' && r.session !== sessionFilter.value) return false;
    if (flaggedOnly.value && !r.flaggedForCheating) return false;
    if (search.value.trim() && !r.name.toLowerCase().includes(search.value.trim().toLowerCase())) return false;
    return true;
  }),
);

const stats = computed(() => {
  const real = admin.rows.filter((r) => !r.isTestAccount);
  return {
    total: real.length,
    completed: real.filter((r) => r.status === 'completed').length,
    inProgress: real.filter((r) => r.status === 'in_progress').length,
    flagged: real.filter((r) => r.flaggedForCheating).length,
  };
});

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

function toggleExpand(studentId: string) {
  expandedId.value = expandedId.value === studentId ? null : studentId;
}

// --- Settings tab ---
const durationMinutes = ref(DEFAULT_DURATION_MINUTES);
const settingsUpdatedAt = ref<number | null>(null);
const savingSettings = ref(false);
const savedMessage = ref('');
let settingsUnsub: (() => void) | null = null;

onMounted(() => {
  settingsUnsub = subscribeTestConfig((config) => {
    durationMinutes.value = config.durationMinutes;
    settingsUpdatedAt.value = config.updatedAt;
  });
});
onUnmounted(() => {
  settingsUnsub?.();
});

async function saveSettings() {
  if (!auth.user) return;
  savingSettings.value = true;
  savedMessage.value = '';
  try {
    await updateTestConfig(durationMinutes.value, auth.user.uid);
    savedMessage.value = 'Saved. This only affects sessions that have not started yet.';
  } finally {
    savingSettings.value = false;
  }
}

async function signOut() {
  admin.teardown();
  await auth.logout();
  router.push({ name: 'admin-login' });
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 pb-16">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 class="text-base font-bold text-slate-900">Admin Dashboard</h1>
          <p class="text-xs text-slate-500">eTest SMP Labschool UNESA 3</p>
        </div>
        <AppButton variant="secondary" @click="signOut">Sign out</AppButton>
      </div>
      <nav class="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
        <button
          type="button"
          class="border-b-2 px-3 py-2 text-sm font-semibold"
          :class="activeTab === 'results' ? 'border-primary text-primary-dark' : 'border-transparent text-slate-400'"
          @click="activeTab = 'results'"
        >
          Results
        </button>
        <button
          type="button"
          class="border-b-2 px-3 py-2 text-sm font-semibold"
          :class="activeTab === 'settings' ? 'border-primary text-primary-dark' : 'border-transparent text-slate-400'"
          @click="activeTab = 'settings'"
        >
          Settings
        </button>
      </nav>
    </header>

    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <template v-if="activeTab === 'results'">
        <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p class="text-xs font-medium text-slate-400">Students</p>
            <p class="mt-1 text-xl font-bold text-slate-900">{{ stats.total }}</p>
          </div>
          <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p class="text-xs font-medium text-slate-400">Completed</p>
            <p class="mt-1 text-xl font-bold text-success">{{ stats.completed }}</p>
          </div>
          <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p class="text-xs font-medium text-slate-400">In progress</p>
            <p class="mt-1 text-xl font-bold text-warning">{{ stats.inProgress }}</p>
          </div>
          <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p class="text-xs font-medium text-slate-400">Flagged</p>
            <p class="mt-1 text-xl font-bold text-danger">{{ stats.flagged }}</p>
          </div>
        </div>

        <div class="mb-4 flex flex-wrap items-center gap-2">
          <input
            v-model="search"
            type="text"
            placeholder="Search student name…"
            class="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <select
            v-model="sessionFilter"
            class="rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All sessions</option>
            <option value="Session 1">Session 1</option>
            <option value="Session 2">Session 2</option>
          </select>
          <label class="flex items-center gap-1.5 text-sm text-slate-600">
            <input v-model="flaggedOnly" type="checkbox" class="rounded border-slate-300 text-primary" />
            Flagged only
          </label>
          <label class="flex items-center gap-1.5 text-sm text-slate-600">
            <input v-model="showTestAccount" type="checkbox" class="rounded border-slate-300 text-primary" />
            Show test account
          </label>
        </div>

        <div class="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
          <table class="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th class="px-4 py-2.5"></th>
                <th class="px-4 py-2.5">Student</th>
                <th class="px-4 py-2.5">Session</th>
                <th class="px-4 py-2.5">Status</th>
                <th class="px-4 py-2.5">Score</th>
                <th class="px-4 py-2.5">Time taken</th>
                <th class="px-4 py-2.5">Violations</th>
                <th class="px-4 py-2.5">Flag</th>
                <th class="px-4 py-2.5">Last Q</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="row in filteredRows" :key="row.studentId">
                <tr class="border-b border-slate-50 hover:bg-slate-50/60">
                  <td class="px-4 py-2.5">
                    <button
                      type="button"
                      class="text-slate-400 hover:text-primary-dark"
                      aria-label="Toggle detail"
                      @click="toggleExpand(row.studentId)"
                    >
                      {{ expandedId === row.studentId ? '▾' : '▸' }}
                    </button>
                  </td>
                  <td class="px-4 py-2.5 font-medium text-slate-900">
                    {{ row.name }}
                    <span v-if="row.isTestAccount" class="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">test</span>
                  </td>
                  <td class="px-4 py-2.5 text-slate-500">{{ row.session }}</td>
                  <td class="px-4 py-2.5"><StatusBadge :status="row.status" /></td>
                  <td class="px-4 py-2.5 tabular-nums text-slate-700">
                    {{ row.score !== null ? `${row.score} / ${TOTAL_QUESTIONS}` : '—' }}
                  </td>
                  <td class="px-4 py-2.5 tabular-nums text-slate-500">{{ formatDuration(row.durationTakenMs) }}</td>
                  <td class="px-4 py-2.5 tabular-nums text-slate-500">{{ row.violationCount }}</td>
                  <td class="px-4 py-2.5">
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="row.flaggedForCheating ? 'bg-danger-tint text-danger' : 'bg-success-tint text-success'"
                    >
                      {{ row.flaggedForCheating ? 'Flagged' : 'Clean' }}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 tabular-nums text-slate-500">{{ row.currentQuestionIndex + 1 }}</td>
                </tr>
                <tr v-if="expandedId === row.studentId">
                  <td colspan="9" class="p-0">
                    <ViolationList :student-id="row.studentId" />
                  </td>
                </tr>
              </template>
              <tr v-if="filteredRows.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-sm text-slate-400">No students match these filters.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <div class="max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 class="text-sm font-bold text-slate-900">Test duration</h2>
          <p class="mt-1 text-xs text-slate-500">
            Applies only to sessions that haven't started yet. A student already taking the test keeps the
            duration that was locked in when they started, permanently.
          </p>
          <div class="mt-4 flex items-center gap-2">
            <input
              v-model.number="durationMinutes"
              type="number"
              min="1"
              max="180"
              class="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span class="text-sm text-slate-500">minutes</span>
          </div>
          <AppButton class="mt-4" :disabled="savingSettings" @click="saveSettings">
            {{ savingSettings ? 'Saving…' : 'Save' }}
          </AppButton>
          <p v-if="savedMessage" class="mt-3 rounded-lg bg-success-tint px-3 py-2 text-xs text-success">
            {{ savedMessage }}
          </p>
          <p v-if="settingsUpdatedAt" class="mt-3 text-xs text-slate-400">
            Last updated {{ new Date(settingsUpdatedAt).toLocaleString() }}
          </p>
        </div>
      </template>
    </div>
  </main>
</template>
