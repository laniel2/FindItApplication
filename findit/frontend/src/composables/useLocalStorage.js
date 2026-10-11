import { ref, watch } from 'vue';

/**
 * A ref that is saved to localStorage automatically.
 * Read once on creation, written on every change.
 */
export function useLocalStorage(key, initialValue) {
  let start = initialValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) start = JSON.parse(raw);
  } catch { /* corrupted value: fall back to the default */ }

  const state = ref(start);

  watch(
    state,
    (value) => {
      try {
        if (value === null || value === undefined) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
      } catch { /* storage full or blocked: ignore */ }
    },
    { deep: true, flush: 'sync' }
  );

  return state;
}
