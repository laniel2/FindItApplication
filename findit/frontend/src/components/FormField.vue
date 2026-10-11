<script setup>
// PARENT -> CHILD: the parent passes data down with props and puts its <input> in the slot.
defineProps({
  label: { type: String, required: true },
  inputId: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
});
</script>

<template>
  <div class="mb-3">
    <label class="form-label" :for="inputId">{{ label }}</label>
    <slot />
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="field-hint">{{ hint }}</p>
  </div>
</template>
