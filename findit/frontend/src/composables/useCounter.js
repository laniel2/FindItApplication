import { computed, ref } from 'vue';

// COMPOSABLE: same behaviour as counterMixin, but returned explicitly.
export function useCounter(start = 0) {
  const count = ref(start);
  const isEven = computed(() => count.value % 2 === 0);
  const increment = () => count.value++;
  const reset = () => (count.value = start);
  return { count, isEven, increment, reset };
}
