<script setup lang="ts">
import { computed } from 'vue';

import type { TestStatus } from '@/types';

const props = defineProps<{ status: TestStatus }>();

const labels: Record<TestStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

const classes: Record<TestStatus, string> = {
  not_started: 'bg-slate-100 text-slate-500',
  in_progress: 'bg-warning-tint text-warning',
  completed: 'bg-success-tint text-success',
};

const label = computed(() => labels[props.status]);
const className = computed(() => classes[props.status]);
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="className">
    {{ label }}
  </span>
</template>
