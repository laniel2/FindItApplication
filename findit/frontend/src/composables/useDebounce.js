import { ref, watch } from 'vue';

/** Returns a ref that follows `source` but only after the user stops changing it. */
export function useDebounce(source, delay = 350) {
  const debounced = ref(typeof source === 'function' ? source() : source.value);
  let timer;
  watch(source, (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => (debounced.value = value), delay);
  });
  return debounced;
}
