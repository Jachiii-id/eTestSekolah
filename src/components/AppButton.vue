<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger';
    type?: 'button' | 'submit';
    disabled?: boolean;
    fullWidth?: boolean;
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    fullWidth: false,
  },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      fullWidth ? 'w-full' : '',
      variant === 'primary' &&
        'bg-primary text-white hover:bg-primary-dark focus-visible:outline-primary-dark',
      variant === 'secondary' &&
        'border border-primary/30 bg-white text-primary-dark hover:bg-primary-light focus-visible:outline-primary',
      variant === 'danger' &&
        'bg-danger text-white hover:brightness-95 focus-visible:outline-danger',
    ]"
  >
    <slot />
  </button>
</template>
