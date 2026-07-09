<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { subscribeViolations } from '@/firebase/results';
import type { ViolationDoc } from '@/types';

const props = defineProps<{ studentId: string }>();

const violations = ref<ViolationDoc[]>([]);
let unsub: (() => void) | null = null;

onMounted(() => {
  unsub = subscribeViolations(props.studentId, (v) => {
    violations.value = v;
  });
});

onUnmounted(() => {
  unsub?.();
});

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}
</script>

<template>
  <div class="bg-slate-50 px-4 py-3">
    <p v-if="violations.length === 0" class="text-xs text-slate-400">No violations recorded.</p>
    <ul v-else class="space-y-1.5">
      <li
        v-for="(v, i) in violations"
        :key="i"
        class="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs ring-1 ring-slate-200"
      >
        <span class="font-medium text-slate-600">#{{ i + 1 }} — {{ v.type === 'tab_switch' ? 'Tab switch' : 'Window blur' }}</span>
        <span class="font-mono text-slate-400">{{ formatTime(v.timestamp) }}</span>
      </li>
    </ul>
  </div>
</template>
