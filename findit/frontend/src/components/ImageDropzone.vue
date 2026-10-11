<script setup>
import { ref } from 'vue';
import { fileToDataUrl } from '../utils/image';

// v-model support: the parent passes `modelValue` (the image) and listens
// for `update:modelValue`. So the parent can write <ImageDropzone v-model="image" />
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Drop a photo here' },
  hint: { type: String, default: 'or click to choose from your gallery' },
  shape: { type: String, default: 'rect' }, // 'rect' | 'circle'
  maxSize: { type: Number, default: 700 },
});
const emit = defineEmits(['update:modelValue', 'error']);

const dragging = ref(false);
const busy = ref(false);
const error = ref('');
const input = ref(null);

async function handleFile(file) {
  error.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    error.value = 'Please choose an image (JPG, PNG or WebP)';
    emit('error', error.value);
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'That image is over 10 MB. Choose a smaller one.';
    emit('error', error.value);
    return;
  }
  busy.value = true;
  try {
    emit('update:modelValue', await fileToDataUrl(file, { maxSize: props.maxSize, square: props.shape === 'circle' }));
  } catch (err) {
    error.value = err.message;
    emit('error', err.message);
  } finally {
    busy.value = false;
  }
}

const onDrop = (e) => {
  dragging.value = false;
  handleFile(e.dataTransfer?.files?.[0]);
};
const onPick = (e) => {
  handleFile(e.target.files?.[0]);
  e.target.value = '';
};
</script>

<template>
  <div>
    <div
      class="dropzone"
      :class="[shape, { dragging, filled: !!modelValue }]"
      tabindex="0"
      role="button"
      :aria-label="label"
      @click="input.click()"
      @keydown.enter.prevent="input.click()"
      @keydown.space.prevent="input.click()"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <img v-if="modelValue" :src="modelValue" alt="Selected photo preview" />
      <div v-else class="dz-empty">
        <i class="bi bi-cloud-arrow-up"></i>
        <strong>{{ busy ? 'Processing…' : label }}</strong>
        <span>{{ hint }}</span>
      </div>
      <button v-if="modelValue" type="button" class="dz-remove" aria-label="Remove photo" @click.stop="emit('update:modelValue', '')">
        <i class="bi bi-x-lg"></i>
      </button>
      <input ref="input" type="file" accept="image/*" hidden @change="onPick" />
    </div>
    <p v-if="error" class="field-error mt-2" role="alert">{{ error }}</p>
  </div>
</template>
