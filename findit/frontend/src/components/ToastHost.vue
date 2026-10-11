<script setup>
import { useToast } from '../composables/useToast';
const { toasts, dismiss } = useToast();
</script>

<template>
  <div class="toast-host" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" class="toast-msg" :class="t.type" role="status">
      <i class="bi" :class="t.type === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle'"></i>
      <span>{{ t.message }}</span>
      <button type="button" class="btn-close btn-close-white ms-2" aria-label="Dismiss" @click="dismiss(t.id)"></button>
    </div>
  </div>
</template>
