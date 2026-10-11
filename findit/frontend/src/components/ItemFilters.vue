<script setup>
// PARENT <-> CHILD with v-model on a whole object.
// The parent owns the filter state; this component never mutates the prop,
// it emits a fresh copy through `update:modelValue`.
const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue', 'reset']);

const set = (key, value) => emit('update:modelValue', { ...props.modelValue, [key]: value });
const types = [
  { value: '', label: 'All' },
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
];
</script>

<template>
  <section class="filters" aria-label="Filter items">
    <div class="search-box">
      <i class="bi bi-search"></i>
      <input
        type="search"
        class="form-control"
        placeholder="Search by name, place or description"
        aria-label="Search items"
        :value="modelValue.q"
        @input="set('q', $event.target.value)"
      />
    </div>

    <div class="filters-row">
      <div class="seg" role="group" aria-label="Lost or found">
        <button v-for="t in types" :key="t.value" type="button" :class="{ on: modelValue.type === t.value }" @click="set('type', t.value)">
          {{ t.label }}
        </button>
      </div>

      <select class="form-select" aria-label="Category" :value="modelValue.category" @change="set('category', $event.target.value)">
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>

      <select class="form-select" aria-label="Status" :value="modelValue.status" @change="set('status', $event.target.value)">
        <option value="open">Still missing / unclaimed</option>
        <option value="resolved">Returned</option>
        <option value="">Any status</option>
      </select>

      <div class="form-check form-switch mine-switch">
        <input id="mine" class="form-check-input" type="checkbox" role="switch" :checked="modelValue.mine" @change="set('mine', $event.target.checked)" />
        <label class="form-check-label" for="mine">My posts only</label>
      </div>

      <button type="button" class="btn btn-link btn-sm p-0" @click="emit('reset')">Clear filters</button>
    </div>
  </section>
</template>
