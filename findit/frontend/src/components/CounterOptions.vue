<script>
import counterMixin from '../mixins/counterMixin';

// OPTIONS API + MIXIN
export default {
  name: 'CounterOptions',
  mixins: [counterMixin],
  data() {
    return { label: 'Options API + mixin' };
  },
};
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
