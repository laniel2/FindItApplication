<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

// CHILD -> PARENT: the modal never deletes anything itself.
// It only tells the parent what the user chose by emitting events.
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm' },
  busy: { type: Boolean, default: false },
});
const emit = defineEmits(['confirm', 'cancel']);

const onKey = (e) => e.key === 'Escape' && emit('cancel');
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-box" role="dialog" aria-modal="true" :aria-label="title">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" @click="emit('cancel')">Keep it</button>
          <button type="button" class="btn btn-danger" :disabled="busy" @click="emit('confirm')">
            {{ busy ? 'Working…' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
