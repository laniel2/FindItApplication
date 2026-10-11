<script setup>
import { useCounter } from '../composables/useCounter';

// COMPOSITION API + COMPOSABLE
const label = 'Composition API + composable';
const { count, isEven, increment, reset } = useCounter();
</script>

<template>
  <div class="demo-card">
    <h3>{{ label }}</h3>
    <p class="demo-count">{{ count }} <small>{{ isEven ? 'even' : 'odd' }}</small></p>
    <div class="d-flex gap-2">
      <button class="btn btn-primary btn-sm" @click="increment">Add one</button>
      <button class="btn btn-light btn-sm" @click="reset">Reset</button>
    </div>
  </div>
</template>
