<script setup>
import { computed } from 'vue';
import { initials } from '../utils/format';

const props = defineProps({
  user: { type: Object, default: null },
  size: { type: Number, default: 40 },
});
const style = computed(() => ({ width: `${props.size}px`, height: `${props.size}px`, fontSize: `${props.size * 0.38}px` }));
</script>

<template>
  <span class="avatar" :style="style">
    <img v-if="user?.avatar" :src="user.avatar" :alt="`${user.name}'s photo`" />
    <template v-else>{{ initials(user?.name) }}</template>
  </span>
</template>
