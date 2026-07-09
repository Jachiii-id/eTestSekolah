<script setup lang="ts">
import ToastStack from '@/components/ToastStack.vue';
</script>

<template>
  <div class="min-h-screen bg-base text-slate-900">
    <router-view />
    <ToastStack />
  </div>
</template>
