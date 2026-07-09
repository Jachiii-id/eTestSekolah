<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import StudentResultModal from '@/components/StudentResultModal.vue';
import ViolationList from '@/components/ViolationList.vue';
import { DEFAULT_DURATION_MINUTES } from '@/constants';
import { useToasts } from '@/composables/useToasts';
import { resetResultForAdmin } from '@/firebase/results';
import { subscribeTestConfig, updateTestConfig } from '@/firebase/settings';
import { exportResultsToPdf } from '@/lib/exportPdf';
import type { AdminRow } from '@/stores/admin';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const admin = useAdminStore();
const { pushToast } = useToasts();

const activeTab = ref<'results' | 'settings'>('results');
const sessionFilter = ref<'all' | 'Session 1' | 'Session 2'>('all');
const flaggedOnly = ref(false);
// Visible by default so the dummy test account (used to dry-run the flow) is
// easy to find and reset without hunting for a checkbox first.
const showTestAccount = ref(true);
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

function downloadPdf() {
  const parts: string[] = [sessionFilter.value === 'all' ? 'All sessions' : sessionFilter.value];
  if (flaggedOnly.value) parts.push('flagged only');
  if (search.value.trim()) parts.push(`search "${search.value.trim()}"`);
  exportResultsToPdf(filteredRows.value, parts.join(', '));
  pushToast(`Downloaded PDF for ${filteredRows.value.length} student(s).`, 'info');
}

// --- View result ---
const viewTarget = ref<AdminRow | null>(null);

function requestView(row: AdminRow) {
  viewTarget.value = row;
}

// --- Reset test ---
const resetTarget = ref<AdminRow | null>(null);
const resetting = ref(false);

function requestReset(row: AdminRow) {
  resetTarget.value = row;
}

function cancelReset() {
  if (resetting.value) return;
  resetTarget.value = null;
}

async function confirmReset() {
  if (!resetTarget.value) return;
  resetting.value = true;
  try {
    await resetResultForAdmin(resetTarget.value.studentId);
    pushToast(`Reset ${resetTarget.value.name}'s test — back to Not started.`, 'info');
    if (expandedId.value === resetTarget.value.studentId) expandedId.value = null;
    resetTarget.value = null;
  } catch {
    pushToast('Could not reset this test. Please try again.', 'error');
  } finally {
    resetting.value = false;
  }
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
  if (!auth.id) return;
  savingSettings.value = true;
  savedMessage.value = '';
  try {
    await updateTestConfig(durationMinutes.value, auth.id);
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
          <AppButton variant="secondary" :disabled="filteredRows.length === 0" @click="downloadPdf">
            Download PDF
          </AppButton>
        </div>

        <div class="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
          <table class="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th class="px-4 py-2.5"></th>
                <th class="px-4 py-2.5">Student</th>
                <th class="px-4 py-2.5">Session</th>
                <th class="px-4 py-2.5">Status</th>
                <th class="px-4 py-2.5">Score (/100)</th>
                <th class="px-4 py-2.5">Time taken</th>
                <th class="px-4 py-2.5">Violations</th>
                <th class="px-4 py-2.5">Flag</th>
                <th class="px-4 py-2.5">Last Q</th>
                <th class="px-4 py-2.5">Action</th>
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
                    {{ row.score ?? '—' }}
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
                  <td class="px-4 py-2.5">
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="rounded-md px-2 py-1 text-xs font-semibold text-primary-dark hover:bg-primary-light"
                        :disabled="row.status === 'not_started'"
                        :class="row.status === 'not_started' ? 'cursor-not-allowed opacity-40' : ''"
                        @click="requestView(row)"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        class="rounded-md px-2 py-1 text-xs font-semibold text-danger hover:bg-danger-tint"
                        :disabled="row.status === 'not_started'"
                        :class="row.status === 'not_started' ? 'cursor-not-allowed opacity-40' : ''"
                        @click="requestReset(row)"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="expandedId === row.studentId">
                  <td colspan="10" class="p-0">
                    <ViolationList :student-id="row.studentId" />
                  </td>
                </tr>
              </template>
              <tr v-if="filteredRows.length === 0">
                <td colspan="10" class="px-4 py-8 text-center text-sm text-slate-400">No students match these filters.</td>
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

    <div
      v-if="resetTarget"
      class="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 px-4"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h3 class="text-base font-bold text-slate-900">Reset this student's test?</h3>
        <p class="mt-1.5 text-sm text-slate-500">
          This clears all of <strong>{{ resetTarget.name }}</strong
          >'s answers and progress, and sets their status back to <strong>Not started</strong> so they
          can retake the test. Their past violation log is kept for the record. This cannot be undone.
        </p>
        <div class="mt-5 flex gap-2">
          <AppButton variant="secondary" full-width :disabled="resetting" @click="cancelReset">
            Cancel
          </AppButton>
          <AppButton variant="danger" full-width :disabled="resetting" @click="confirmReset">
            {{ resetting ? 'Resetting…' : 'Reset test' }}
          </AppButton>
        </div>
      </div>
    </div>

    <StudentResultModal
      v-if="viewTarget"
      :student-id="viewTarget.studentId"
      :name="viewTarget.name"
      @close="viewTarget = null"
    />
  </main>
</template>
