<script setup lang="ts">
import { useToasts } from '@/composables/useToasts';

const { toasts, dismissToast } = useToasts();

const toneClasses: Record<string, string> = {
  warning: 'bg-warning-tint text-warning border-warning/30',
  error: 'bg-danger-tint text-danger border-danger/30',
  info: 'bg-primary-light text-primary-dark border-primary/30',
};
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-3 sm:top-4"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium shadow-lg"
        :class="toneClasses[toast.tone]"
        role="status"
      >
        <span class="flex-1">{{ toast.message }}</span>
        <button
          type="button"
          class="shrink-0 opacity-60 hover:opacity-100"
          aria-label="Dismiss"
          @click="dismissToast(toast.id)"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
